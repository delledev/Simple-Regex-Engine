import { CreateToken, Operators, Token, TokenType } from "./token";

function IsOperator(char: string) {
  return Operators.includes(char);
}

export function Tokenize(sourceString: string): Token[] {
  const TokensArray = new Array<Token>();
  const sourceArray = sourceString.split("");
  let loc = 0;
  //failsafe for empty string otherwise the whole program crashes
  if (sourceString.trim() == "") {
    return [CreateToken("end", TokenType.RegexEnd, loc)];
  }
  while (sourceArray.length > 0) {
    if (sourceArray[0] == "(") {
      TokensArray.push(
        CreateToken(sourceArray.shift(), TokenType.GroupStart, loc++),
      );
    } else if (sourceArray[0] == ")") {
      TokensArray.push(
        CreateToken(sourceArray.shift(), TokenType.GroupEnd, loc++),
      );
    } else if (sourceArray[0] == "+") {
      TokensArray.push(
        CreateToken(sourceArray.shift(), TokenType.OrOperator, loc++),
      );
    } else if (sourceArray[0] == "*") {
      TokensArray.push(
        CreateToken(sourceArray.shift(), TokenType.GreedyOperator, loc++),
      );
    } else if (sourceArray[0] !== "") {
      let word = "";
      let stringLoc = loc++;
      while (!IsOperator(sourceArray[0]) && sourceArray.length > 0) {
        word += sourceArray.shift();
        loc++;
      }
      TokensArray.push(CreateToken(word, TokenType.Char, stringLoc));
    }
  }
  TokensArray.push(CreateToken("end", TokenType.RegexEnd, loc++));
  return TokensArray;
}
