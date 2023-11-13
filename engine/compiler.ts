import * as AST from "./ast";
var Fragment = require("./enfa/fragment.js");

export class Compiler {
  protected ast: AST.Regex = { type: "regex", body: [] };

  private preCompileSteps(ast: AST.Regex) {
    this.ast = ast;
  }

  public compile(ast: AST.Regex) {
    this.preCompileSteps(ast);
    const nodes = this.ast.body;
    let fragments = this.compileNodes(nodes);
    let frag = fragments[0];
    if (fragments.length > 1) {
      for (let i = 1; i < fragments.length; i++) {
        frag.concat(fragments[i]);
      }
    }
    return frag;
  }

  compileNodes(nodes: AST.Node[]) {
    let nodeFragments: (typeof Fragment)[] = [];
    nodes.forEach((node) => nodeFragments.push(this.compileNode(node)));
    return nodeFragments;
  }

  compileNode(node: AST.Node): typeof Fragment {
    switch (node.type) {
      case "Disjunction":
        return this.compileDisjunction(node);
        break;
      case "group":
        return this.compileGroup(node);
        break;
      case "character":
        return this.compileCharacter(node);
        break;
      default:
        break;
    }
  }

  compileDisjunction(node: AST.DisjunctionNode) {
    let leftFragment = this.compileNode(node.left);
    let rightFragment = this.compileNode(node.right);
    let disjunctionFragment = leftFragment.union(rightFragment);
    if (node.quantifier?.kind == "*") {
      disjunctionFragment = disjunctionFragment.repeat();
    }
    return disjunctionFragment;
  }

  compileGroup(node: AST.GroupNode) {
    let fragments: (typeof Fragment)[] = this.compileNodes(node.expression);
    let frag = fragments[0];
    for (let i = 1; i < fragments.length; i++) {
      frag.concat(fragments[i]);
    }
    if (node.quantifier?.kind == "*") {
      frag = frag.repeat();
    }
    return frag;
  }

  compileCharacter(node: AST.StringNode) {
    let charFragment = new Fragment(node.value);
    if (node.quantifier?.kind == "*") {
      charFragment = charFragment.repeat();
    }
    return charFragment;
  }
}
