import React from "react";
import { Parser } from "./parser";
import { Tokenize } from "./lexer";
import { Compiler } from "./compiler";
var Fragment = require("./enfa/fragment.js");

class RegexEngine {
  public compile(regexString: string, alphabet: string[]) {
    const parser = new Parser(regexString, alphabet);
    const compiler = new Compiler();
    const ast = parser.Parse();
    if (typeof ast != "string") {
      const NFAFragment = compiler.compile(ast.ast);
      return {
        ast: ast.ast,
        NFAFragment,
        tokens: ast.tokens,
      };
    } else {
      return ast;
    }
  }
}

export default RegexEngine;
