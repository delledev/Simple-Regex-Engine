import { Token, TokenType } from "./token";
import * as AST from "./ast";
import { Tokenize } from "./lexer";

export class Parser {
  private regex: string;
  private tokens: Token[];
  private tokensUntouched: Token[];
  private alphabet: string[];
  constructor(regex: string, alphabet: string[]) {
    this.regex = regex;
    this.tokens = Tokenize(regex);
    this.tokensUntouched = [...this.tokens];
    this.alphabet = alphabet;
  }

  public Parse(): { ast: AST.Regex; tokens: Token[] } | string {
    let res = this.parseNodes();
    if (res.success) {
      const regexnode: AST.Regex = {
        type: "regex",
        body: res.nodes,
      };
      return { ast: regexnode, tokens: this.tokensUntouched };
    } else {
      return res?.message;
    }
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

  private verifyCharacterToken(token: Token) {
    if (this.alphabet.length == 0) return true;

    let result = false;
    this.alphabet.forEach((str) => {
      token.value.includes(str) ? (result = true) : "";
    });
    return result;
  }

  private parseNodes(): {
    nodes: AST.Node[];
    success: boolean;
    message: string;
  } {
    let capturingMode = false;
    let branches: AST.Node[] = new Array<AST.Node>();
    let nodes: AST.Node[] = new Array<AST.Node>();
    let leftNode: AST.Node | undefined;
    let rightNode: AST.Node | undefined;
    while (this.tokens.length > 0) {
      let currentToken = this.eat();

      if (currentToken.value == "(") {
        capturingMode = true;
      } else if (currentToken.value == ")") {
        capturingMode = false;
      }

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
            console.log(leftNode);
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
          let tokenString = currentToken.value;
          let verify = this.verifyCharacterToken(currentToken);
          if (!verify) {
            return {
              nodes,
              success: false,
              message: `Unknown token ${currentToken.value} at ${currentToken.loc}.`,
            };
          }
          tokenString.split("").forEach((char) => {
            let textNode: AST.StringNode = {
              type: "character",
              kind: "string",
              value: char,
              quantifier: null,
            };
            if (leftNode && !capturingMode) {
              branches.push(this.disjunctionNode(leftNode, textNode));
              leftNode = undefined;
            } else {
              branches.push(textNode);
            }
          });
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
    if (capturingMode) {
      return {
        nodes,
        success: false,
        message: "Unclosed capturing group detected!",
      };
    }
    return { nodes, success: true, message: "" };
  }
}
