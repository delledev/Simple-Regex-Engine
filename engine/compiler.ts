import * as AST from "@/engine/ast";
import { NFA, concat, disjunction, repeat } from "./nfa";

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
        frag = concat(frag, fragments[i]);
      }
    }
    return frag;
  }

  compileNodes(nodes: AST.Node[]) {
    let nodeFragments: NFA[] = [];
    nodes.forEach((node) => {
      nodeFragments.push(this.compileNode(node));
    });
    return nodeFragments;
  }

  compileNode(node: AST.Node): NFA {
    switch (node.type) {
      case "Disjunction":
        return this.compileDisjunction(node);
      case "group":
        return this.compileGroup(node);
      case "character":
        return this.compileCharacter(node);
    }
  }

  compileDisjunction(node: AST.DisjunctionNode) {
    let leftFragment = this.compileNode(node.left);
    let rightFragment = this.compileNode(node.right);
    let disjunctionFragment = disjunction(leftFragment, rightFragment);
    if (node.quantifier?.kind == "*") {
      disjunctionFragment = repeat(disjunctionFragment);
    }
    return disjunctionFragment;
  }

  compileGroup(node: AST.GroupNode) {
    let fragments: NFA[] = this.compileNodes(node.expression);
    let frag = fragments[0];
    if (fragments.length > 1) {
      for (let i = 1; i < fragments.length; i++) {
        frag = concat(frag, fragments[i]);
      }
    }
    if (node.quantifier?.kind == "*") {
      frag = repeat(frag);
    }
    return frag;
  }

  compileCharacter(node: AST.StringNode) {
    let charFragment = NFA(node.value);
    if (node.quantifier?.kind == "*") {
      charFragment = repeat(charFragment);
    }
    return charFragment;
  }
}
