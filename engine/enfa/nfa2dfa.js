function nfa2dfa(frag, delimiter) {
  if (delimiter == null) {
    delimiter = String.fromCharCode(3193);
  }

  function closureOf(state) {
    var i = 0,
      ii = 0,
      j = 0,
      jj = 0,
      trans,
      closure = [].concat(state),
      discoveredStates;

    while (true) {
      discoveredStates = [];

      for (i = 0, ii = closure.length; i < ii; ++i) {
        trans = frag.transitions[closure[i]];
        for (j = 0, jj = trans.length; j < jj; j += 2) {
          if (trans[j] == "\0") {
            if (closure.indexOf(trans[j + 1]) < 0) {
              discoveredStates.push(trans[j + 1]);
            }
          }
        }
      }

      if (discoveredStates.length === 0) {
        break;
      } else {
        closure.push.apply(closure, discoveredStates);
      }

      discoveredStates = [];
    }

    return closure.sort();
  }

  function goesTo(state, chr) {
    var output = [],
      i = 0,
      ii = state.length,
      j = 0,
      jj = 0,
      trans;

    for (; i < ii; ++i) {
      trans = frag.transitions[state[i]];

      for (j = 0, jj = trans.length; j < jj; j += 2) {
        if (trans[j] == chr) {
          output.push(trans[j + 1]);
        }
      }
    }

    return closureOf(output);
  }
  function exits(state) {
    var chars = [],
      i = 0,
      ii = state.length,
      j = 0,
      jj = 0,
      trans;

    for (; i < ii; ++i) {
      trans = frag.transitions[state[i]];

      for (j = 0, jj = trans.length; j < jj; j += 2) {
        if (trans[j] != "\0" && chars.indexOf(trans[j]) < 0) {
          chars.push(trans[j]);
        }
      }
    }

    return chars;
  }

  var processStack = [closureOf([frag.initial])],
    initalStateKey = processStack[0].join(delimiter),
    current = [],
    exitChars = [],
    i = 0,
    ii = 0,
    j = 0,
    jj = 0,
    discoveredState,
    currentStateKey = "",
    discoveredStateKey = "",
    transitionTable = {},
    acceptStates = [];

  while (processStack.length > 0) {
    current = processStack.pop();
    currentStateKey = current.join(delimiter);
    transitionTable[currentStateKey] = [];

    exitChars = exits(current);

    for (i = 0, ii = exitChars.length; i < ii; ++i) {
      discoveredState = goesTo(current, exitChars[i]);
      discoveredStateKey = discoveredState.join(delimiter);

      if (
        !transitionTable[discoveredStateKey] &&
        discoveredStateKey != currentStateKey
      ) {
        processStack.push(discoveredState);
      }

      for (j = 0, jj = discoveredState.length; j < jj; ++j) {
        if (
          frag.accept.indexOf(discoveredState[j]) >= 0 &&
          acceptStates.indexOf(discoveredStateKey) < 0
        ) {
          acceptStates.push(discoveredStateKey);
        }
      }

      transitionTable[currentStateKey].push(exitChars[i], discoveredStateKey);
    }
  }

  return {
    initial: initalStateKey,
    accept: acceptStates,
    transitions: transitionTable,
  };
}

module.exports = nfa2dfa;
