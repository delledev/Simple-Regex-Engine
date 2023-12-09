export const Operators = ["(", ")", "*", "+"];

export enum TokenType {
  Char,
  GroupStart,
  GroupEnd,
  OrOperator,
  GreedyOperator,
  RegexEnd,
}

export interface Token {
  value: string;
  type: TokenType;
  loc: number;
}

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
