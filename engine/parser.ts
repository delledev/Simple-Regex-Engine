import { Token, TokenType } from "./token";
import * as AST from "./ast";
import { Tokenize } from "./lexer";

export class Parser {
  private regex: string;
  private tokens: Token[];
  private tokensUntouched: Token[];
  constructor(regex: string) {
    this.regex = regex;
    this.tokens = Tokenize(regex);
    this.tokensUntouched = [...this.tokens];
  }

  public Parse(): { ast: AST.Regex; tokens: Token[] } {
    let nodes = this.parseNodes();
    const regexnode: AST.Regex = {
      type: "regex",
      body: nodes,
    };
    return { ast: regexnode, tokens: this.tokensUntouched };
  }

  private eat() {
    let prevToken = this.tokens.shift();
    return prevToken as Token;
  }

  private disjunctionNode(
    leftNode: AST.Node,
    rightNode: AST.Node,
  ): AST.DisjunctionNode {
    return {
      type: "Disjunction",
      left: leftNode,
      right: rightNode,
      quantifier: null,
    };
  }

  private parseNodes() {
    let branches: AST.Node[] = new Array<AST.Node>();
    let nodes: AST.Node[] = new Array<AST.Node>();
    let leftNode: AST.Node | undefined;
    let rightNode: AST.Node | undefined;
    while (this.tokens.length > 0) {
      let currentToken = this.eat();
      switch (currentToken.type) {
        case TokenType.RegexEnd: {
          branches.forEach((branch) => nodes.push(branch));
          break;
        }
        case TokenType.GroupEnd: {
          let GroupNode: AST.GroupNode = {
            type: "group",
            kind: "simple",
            expression: branches,
            quantifier: null,
          };
          if (branches.length > 0) {
            branches = new Array<AST.Node>();
            if (leftNode) {
              nodes.push(this.disjunctionNode(leftNode, GroupNode));
              leftNode = undefined;
            } else {
              nodes.push(GroupNode);
            }
          }
          break;
        }
        case TokenType.GroupStart: {
          if (branches.length > 0) {
            branches.forEach((b) => nodes.push(b));
            branches = new Array<AST.Node>();
          }
          break;
        }
        case TokenType.GreedyOperator: {
          if (branches.length > 0) {
            let branch = branches[branches.length - 1];
            let q: AST.Quantifier = {
              type: "Quantifier",
              kind: "*",
              greedy: true,
            };

            if (branch.type == "Disjunction") {
              branch.right.quantifier = q;
            } else {
              branches[branches.length - 1].quantifier = q;
            }
          } else if (nodes.length > 0) {
            nodes[nodes.length - 1].quantifier = {
              type: "Quantifier",
              kind: "*",
              greedy: true,
            };
          }
          break;
        }
        case TokenType.Char: {
          let textNode: AST.StringNode = {
            type: "character",
            kind: "string",
            value: currentToken.value,
            quantifier: null,
          };
          if (leftNode) {
            branches.push(this.disjunctionNode(leftNode, textNode));
            leftNode = undefined;
          } else {
            branches.push(textNode);
          }
          break;
        }
        case TokenType.OrOperator: {
          if (branches.length > 0) {
            leftNode = branches.pop();
          } else if (nodes.length > 0) {
            leftNode = nodes.pop();
          }
          break;
        }
      }
    }
    return nodes;
  }
}
