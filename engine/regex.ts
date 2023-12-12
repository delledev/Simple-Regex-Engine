import React from "react";
import { Parser } from "./parser";
import { Tokenize } from "./lexer";
import { Compiler } from "./compiler";
import { Node, Regex } from "./ast";
import { Token } from "./token";
import { NFA, generateStrings, test } from "./nfa";

// SRegex class is an interface for the modular regex engine
class SRegex {
  private ast: Regex | undefined; // Stores the abstract syntax tree (AST) of the regular expression
  private tokens: Token[] | undefined; // Stores the tokens generated during parsing
  private errorMessage: string = ""; // Stores error messages, if any
  private NFA: NFA | undefined; // Stores the NFA generated from the compiled AST

  constructor(regexString: string, alphabet: string[]) {
    // Create instances of the Parser and Compiler classes
    const parser = new Parser(regexString, alphabet);
    const compiler = new Compiler();

    // Parse the regular expression
    const astobject = parser.Parse();

    // Check if parsing was successful or resulted in an error
    if (typeof astobject == "string") {
      this.errorMessage = astobject;
    } else {
      this.errorMessage = "";
      this.ast = astobject.ast; // Set the AST if parsing was successful
      this.tokens = astobject.tokens; // Set the tokens generated during parsing
    }

    // Compile the AST into an NFA
    if (this.ast) {
      this.NFA = compiler.compile(this.ast);
    }
  }

  // Method to generate strings accepted by the regular expression
  public generateStrings(): string[] {
    return this.NFA ? generateStrings(this.NFA) : [];
  }

  // Method to test if a given string is accepted by the regular expression
  public testString(str: string): boolean {
    return this.NFA ? test(this.NFA, str) : false;
  }

  // Method to get the AST of the regular expression
  public getAST(): Regex {
    return this.ast ? this.ast : { type: "regex", body: [] };
  }

  // Method to get the tokens generated during parsing
  public getTokens(): Token[] {
    return this.tokens ? this.tokens : [];
  }

  // Method to get the error message, if any
  public getErrorMessage(): string {
    return this.errorMessage;
  }
}
export default SRegex;
