// Array of operators used in regular expressions
export const Operators = ["(", ")", "*", "+"];

// Enum representing different token types
export enum TokenType {
  Char, // Character token
  GroupStart, // Token representing the start of a group "("
  GroupEnd, // Token representing the end of a group ")"
  OrOperator, // Token representing the "|" operator
  GreedyOperator, // Token representing the "*" operator
  RegexEnd, // Token indicating the end of the regular expression
}

// Interface defining the structure of a token
export interface Token {
  value: string; // The actual value of the token (e.g., a character or operator)
  type: TokenType; // The type of the token (from the enum TokenType)
  loc: number; // The location or position of the token in the original source string
}

// Function to create a token with the specified values
export function CreateToken(
  value: string = "",
  tokenType: TokenType,
  loc: number,
): Token {
  return {
    value: value,
    type: tokenType,
    loc: loc,
  };
}
