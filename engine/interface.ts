import React from "react";
import { Parser } from "./parser";
import { Tokenize } from "./lexer";
import { Compiler } from "./compiler";
var Fragment = require("./enfa/fragment.js");

class RegexEngine {
  public compile(regexString: string) {
    const parser = new Parser(regexString);
    const compiler = new Compiler();
    const ast = parser.Parse();
    const NFAFragment = compiler.compile(ast.ast);
    return {
      ast: ast.ast,
      NFAFragment,
      tokens: ast.tokens,
    };
  }
}

export default RegexEngine;
