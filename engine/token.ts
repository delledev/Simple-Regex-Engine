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
}

export function CreateToken(value: string = "", tokenType: TokenType): Token {
  return {
    value: value,
    type: tokenType,
  };
}
