import React from "react";
import { Parser } from "./parser";
import { Tokenize } from "./lexer";
import { Compiler } from "./compiler";
import { Node, Regex } from "./ast";
import { Token } from "./token";
import { NFA, generateStrings, test } from "./nfa";

class SRegex {
  private ast: Regex | undefined;
  private tokens: Token[] | undefined;
  private errorMessage: string = "";
  private NFA: NFA | undefined;
  constructor(regexString: string, alphabet: string[]) {
    const parser = new Parser(regexString, alphabet);
    const compiler = new Compiler();
    const astobject = parser.Parse();
    if (typeof astobject == "string") {
      this.errorMessage = astobject;
    } else {
      this.errorMessage = "";
      this.ast = astobject.ast;
      this.tokens = astobject.tokens;
    }
    if (this.ast) {
      this.NFA = compiler.compile(this.ast);
    }
  }

  public generateStrings(): string[] {
    return this.NFA ? generateStrings(this.NFA) : [];
  }

  public testString(str: string): boolean {
    return this.NFA ? test(this.NFA, str) : false;
  }

  public getAST(): Regex {
    return this.ast ? this.ast : { type: "regex", body: [] };
  }

  public getTokens(): Token[] {
    return this.tokens ? this.tokens : [];
  }

  public getErrorMessage(): string {
    return this.errorMessage;
  }
}

export default SRegex;
