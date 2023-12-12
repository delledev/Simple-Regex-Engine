import * as AST from "@/engine/ast";

// Import necessary functions from the NFA module
import { NFA, concat, disjunction, repeat } from "./nfa";

// Compiler class for compiling regular expressions into NFAs
export class Compiler {
  // AST property to store the abstract syntax tree representation of the regular expression
  protected ast: AST.Regex = { type: "regex", body: [] };

  // Pre-compile steps to initialize the AST property
  private preCompileSteps(ast: AST.Regex) {
    this.ast = ast;
  }

  // Main compilation method
  public compile(ast: AST.Regex) {
    this.preCompileSteps(ast);
    const nodes = this.ast.body;
    let fragments = this.compileNodes(nodes);
    let frag = fragments[0];

    // Concatenate multiple fragments if there are more than one
    if (fragments.length > 1) {
      for (let i = 1; i < fragments.length; i++) {
        frag = concat(frag, fragments[i]);
      }
    }

    return frag;
  }

  // Compile an array of AST nodes
  compileNodes(nodes: AST.Node[]) {
    let nodeFragments: NFA[] = [];
    nodes.forEach((node) => {
      nodeFragments.push(this.compileNode(node));
    });
    return nodeFragments;
  }

  // Compile an individual AST node
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

  // Compile a disjunction node (e.g., a|b)
  compileDisjunction(node: AST.DisjunctionNode) {
    let leftFragment = this.compileNode(node.left);
    let rightFragment = this.compileNode(node.right);
    let disjunctionFragment = disjunction(leftFragment, rightFragment);

    // Apply '*' quantifier if present
    if (node.quantifier?.kind == "*") {
      disjunctionFragment = repeat(disjunctionFragment);
    }

    return disjunctionFragment;
  }

  // Compile a group node (e.g., (ab))
  compileGroup(node: AST.GroupNode) {
    let fragments: NFA[] = this.compileNodes(node.expression);
    let frag = fragments[0];

    // Concatenate multiple fragments if there are more than one
    if (fragments.length > 1) {
      for (let i = 1; i < fragments.length; i++) {
        frag = concat(frag, fragments[i]);
      }
    }

    // Apply '*' quantifier if present
    if (node.quantifier?.kind == "*") {
      frag = repeat(frag);
    }

    return frag;
  }

  // Compile a character node (e.g., a)
  compileCharacter(node: AST.StringNode) {
    let charFragment = NFA(node.value);

    // Apply '*' quantifier if present
    if (node.quantifier?.kind == "*") {
      charFragment = repeat(charFragment);
    }

    return charFragment;
  }
}
