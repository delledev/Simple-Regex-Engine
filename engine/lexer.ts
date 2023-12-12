import { CreateToken, Operators, Token, TokenType } from "./token";

// Function to check if a character is an operator
function IsOperator(char: string) {
  return Operators.includes(char);
}

// Tokenize function to convert a regular expression string into an array of tokens
export function Tokenize(sourceString: string): Token[] {
  const TokensArray = new Array<Token>(); // Array to store the generated tokens
  const sourceArray = sourceString.split(""); // Split the source string into an array of characters
  let loc = 0; // Location tracker for tokens in the source string

  // Failsafe for empty string, return a token indicating the end of the regular expression
  if (sourceString.trim() == "") {
    return [CreateToken("end", TokenType.RegexEnd, loc)];
  }

  // Loop through the characters in the source string
  while (sourceArray.length > 0) {
    // Check for specific characters and create corresponding tokens
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
      // If the character is not an operator, create a token for a character or word
      let word = "";
      let stringLoc = loc++;

      // Build the word until an operator is encountered or the source array is empty
      while (!IsOperator(sourceArray[0]) && sourceArray.length > 0) {
        word += sourceArray.shift();
        loc++;
      }

      // Create a token for the word
      TokensArray.push(CreateToken(word, TokenType.Char, stringLoc));
    }
  }

  // Add a token indicating the end of the regular expression
  TokensArray.push(CreateToken("end", TokenType.RegexEnd, loc++));

  return TokensArray;
}
