"use client";
import { Regex } from "@/engine/ast";
import SRegex from "@/engine/regex";
import { Token, TokenType } from "@/engine/token";
import { Autocomplete, TextField } from "@mui/material";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { JSONTree } from "react-json-tree";

const Index = () => {
  const [alphabet, setAlphabet] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [regexString, setRegexString] = useState("");
  const [testString, setTestString] = useState("");
  const [AST, setAST] = useState<Regex>();
  const [tokens, setTokens] = useState<Token[]>();
  const [sRegex, setSRegex] = useState<SRegex>(new SRegex("", []));
  const [testResult, setTestResult] = useState<boolean>(false);
  const [generatedWords, setGeneratedWords] = useState<string[]>([]);

  //Evalute test results if either test string or regex changes
  useEffect(() => {
    setTestResult(sRegex.testString(testString));
  }, [sRegex, testString]);

  //Evalute values everytime regex changes
  useEffect(() => {
    console.log(sRegex);
    setAST(sRegex.getAST());
    setTokens(sRegex.getTokens());
    setErrorMessage(sRegex.getErrorMessage());
    setGeneratedWords(sRegex.generateStrings());
  }, [sRegex]);

  //Compile regex effect
  useEffect(() => {
    setSRegex(new SRegex(regexString, alphabet));
  }, [alphabet, regexString]);

  return (
    <div className="flex xl:flex-row flex-col h-full w-full p-12 text-white gap-10">
      <div className="flex h-full xl:w-[45%] w-full  flex-col gap-10">
        <div className="flex-col w-full h-1/3">
          <span className="h-fit w-full p-1 text-3xl">Regex</span>
          <div className="flex h-full w-full bg-[#2b2b2b] rounded-xl p-4">
            <div className="flex h-full w-2/3 ">
              <div className="flex flex-col w-full h-fit m-auto px-12 text-black text-xl gap-4">
                <div>
                  <span className="text-white text-xs">
                    Specify alphabet (If no alphabet rule, leave blank).
                  </span>
                  <Autocomplete
                    sx={{
                      background: "white",
                    }}
                    value={alphabet}
                    multiple
                    options={[]}
                    onChange={(e, array) => {
                      setAlphabet(array);
                    }}
                    freeSolo
                    renderInput={(params) => (
                      <TextField {...params} variant="outlined" label="" />
                    )}
                  ></Autocomplete>
                </div>
                <input
                  className="h-fit w-full text-black"
                  placeholder="Regex String"
                  onChange={(e) => setRegexString(e.target.value)}
                ></input>
                <input
                  className={`h-fit w-full ${
                    testResult ? "text-green-500" : "text-red-500"
                  }`}
                  placeholder="Test String"
                  onChange={(e) => setTestString(e.target.value)}
                ></input>
                <span className="text-red-500 font-semibold">
                  {errorMessage}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1 h-full w-1/3 p-2 border border-black rounded-xl">
              <span>Generated Words</span>
              <div
                id="wordsContent"
                className="flex flex-col h-full w-full overflow-auto"
              >
                {generatedWords.map((word, i) => (
                  <span key={i}>{word}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full h-2/3 flex-col">
          <span className="h-fit w-full p-1 text-3xl">Tokens</span>
          <div className="flex flex-col h-full w-full bg-[#2b2b2b] rounded-xl px-2 py-8">
            {tokens?.map((t, idx) => {
              return (
                <div
                  className="w-full h-fit p-1 justify-around flex border border-black"
                  key={idx}
                >
                  <div>Value: {t.value}</div>
                  <div>Type: {TokenType[t.type]}</div>
                  <div>Location: {t.loc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex h-full w-full xl:w-[55%] flex-col">
        <span className="h-fit w-full p-1 text-3xl">AST</span>
        <div className="flex h-full w-full bg-[#2b2b2b] rounded-xl">
          <JSONTree data={AST} />
        </div>
      </div>
    </div>
  );
};

export default Index;
