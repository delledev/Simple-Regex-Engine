var Fragment,
  StateMachine = require("./machine"),
  string2dfa = require("./string2dfa");

Fragment = function Fragment(def) {
  if (typeof def == "string") {
    def = string2dfa(def);
  }

  var err = this.validate(def);

  if (err !== true) {
    throw err;
  }

  this.initial = def.initial;
  this.accept = def.accept;
  this.transitions = def.transitions;
};

Fragment.prototype.validate = function validate(def) {
  var i, ii, k;

  if (!def) {
    return new Error("Fragment needs a definition");
  }

  if (def.initial == null) {
    return new Error("Fragment needs an initial state");
  }

  if (!Array.isArray(def.accept)) {
    return new Error("Fragment must have an array of accepted states");
  }

  if (def.transitions == null) {
    return new Error("Fragment must have a map of transitions");
  }

  for (i = 0, ii = def.accept.length; i < ii; ++i) {
    if (def.transitions[def.accept[i]] == null) {
      return new Error(
        'Accept state "' +
          def.accept[i] +
          '" does not exist in the transition map',
      );
    }
  }

  for (k in def.transitions) {
    if (!Array.isArray(def.transitions[k])) {
      return new Error("The transitions for " + k + " must be an array");
    }

    for (i = 1, ii = def.transitions[k].length; i < ii; i += 2) {
      if (def.transitions[def.transitions[k][i]] == null) {
        return new Error(
          "Transitioned to " +
            def.transitions[k][i] +
            ", which does not exist in the transition map",
        );
      }
    }
  }

  return true;
};

Fragment.prototype.test = function test(input) {
  return new StateMachine(this).accepts(input);
};

Fragment.prototype.toString = function toString(opts) {
  opts = opts || {};

  opts.functionDef = !opts.functionDef;

  return new StateMachine(this).toString(opts);
};

Fragment.prototype.concat = function concat(other) {
  other._resolveCollisions(this);

  var bInitial = other.initial;

  for (var i = 0, ii = this.accept.length; i < ii; ++i) {
    this.transitions[this.accept[i]].push("\0", bInitial);
  }

  for (var k in other.transitions) {
    this.transitions[k] = other.transitions[k];
  }

  this.accept = other.accept;

  return this;
};

Fragment.prototype.union = function union(other) {
  other._resolveCollisions(this);

  var original = "union",
    suffix = "`",
    newStateKey = original + suffix,
    oldInitial = this.initial;

  while (this._hasState(newStateKey)) {
    suffix = suffix + "`";
    newStateKey = original + suffix;
  }

  this.initial = newStateKey;

  this.transitions[this.initial] = ["\0", oldInitial, "\0", other.initial];

  for (var k in other.transitions) {
    this.transitions[k] = other.transitions[k];
  }

  this.accept.push.apply(this.accept, other.accept);

  return this;
};

Fragment.prototype.repeat = function repeat() {
  var original = "repeat",
    suffix = "`",
    newStateKey = original;

  suffix = "`";

  newStateKey = original + suffix;

  while (this._hasState(newStateKey)) {
    suffix = suffix + "`";
    newStateKey = original + suffix;
  }

  for (var i = 0, ii = this.accept.length; i < ii; ++i) {
    this.transitions[this.accept[i]].push("\0", this.initial);
  }

  this.transitions[newStateKey] = ["\0", this.initial];

  this.initial = newStateKey;
  this.accept.push(newStateKey);

  return this;
};

Fragment.prototype.states = function states() {
  return Object.keys(this.transitions);
};

Fragment.prototype._resolveCollisions = function _resolveCollisions(other) {
  var states = other.states(),
    needle,
    original,
    suffix;

  for (var i = 0, ii = states.length; i < ii; ++i) {
    needle = states[i];

    if (!this._hasState(needle)) {
      continue;
    }

    original = needle;
    suffix = "`";

    needle = original + suffix;

    while (this._hasState(needle)) {
      suffix = suffix + "`";
      needle = original + suffix;
    }

    this._renameState(original, needle);
  }

  return true;
};

Fragment.prototype._hasState = function _hasState(needle) {
  return this.transitions[needle] != null;
};

Fragment.prototype._renameState = function _renameState(from, to) {
  var t = this.transitions[from],
    i = 0,
    ii = 0;

  if (t == null) {
    throw new Error("The state " + from + " does not exist");
  }

  if (this.initial == from) {
    this.initial = to;
  }

  delete this.transitions[from];
  this.transitions[to] = t;

  for (var k in this.transitions) {
    for (i = 1, ii = this.transitions[k].length; i < ii; i += 2) {
      if (this.transitions[k][i] == from) {
        this.transitions[k][i] = to;
      }
    }
  }

  for (i = 0, ii = this.accept.length; i < ii; ++i) {
    if (this.accept[i] == from) {
      this.accept[i] = to;
    }
  }
};

module.exports = Fragment;
