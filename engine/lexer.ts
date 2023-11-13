import { CreateToken, Operators, Token, TokenType } from "./token";

function IsOperator(char: string) {
  return Operators.includes(char);
}

export function Tokenize(sourceString: string): Token[] {
  const TokensArray = new Array<Token>();
  const sourceArray = sourceString.split("");

  while (sourceArray.length > 0) {
    if (sourceArray[0] == "(") {
      TokensArray.push(CreateToken(sourceArray.shift(), TokenType.GroupStart));
    } else if (sourceArray[0] == ")") {
      TokensArray.push(CreateToken(sourceArray.shift(), TokenType.GroupEnd));
    } else if (sourceArray[0] == "+") {
      TokensArray.push(CreateToken(sourceArray.shift(), TokenType.OrOperator));
    } else if (sourceArray[0] == "*") {
      TokensArray.push(
        CreateToken(sourceArray.shift(), TokenType.GreedyOperator),
      );
    } else {
      TokensArray.push(CreateToken(sourceArray.shift(), TokenType.Char));
    }
  }
  TokensArray.push(CreateToken("end", TokenType.RegexEnd));
  return TokensArray;
}
