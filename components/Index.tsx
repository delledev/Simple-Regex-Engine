"use client";
import { Regex } from "@/engine/ast";
import RegexEngine from "@/engine/interface";
import { Token, TokenType } from "@/engine/token";
import React, { ChangeEvent, useEffect, useState } from "react";
import { JSONTree } from "react-json-tree";

var Fragment = require("@/engine/enfa/fragment.js");

const Index = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [regexString, setRegexString] = useState("");
  const [testString, setTestString] = useState("");
  const [AST, setAST] = useState<Regex>();
  const [tokens, setTokens] = useState<Token[]>();
  const regexEngine = new RegexEngine();
  const [NFA, setNFA] = useState<typeof Fragment>();
  const [testResult, setTestResult] = useState<boolean>(false);

  useEffect(() => {
    CompileRegex(regexString);
  }, [regexString]);

  useEffect(() => {
    TestString(testString);
  }, [testString, NFA]);

  const CompileRegex = (str: string) => {
    const RegexInstance = regexEngine.compile(str);
    setAST(RegexInstance.ast);
    setTokens(RegexInstance.tokens);
    setNFA(RegexInstance.NFAFragment);
  };

  const TestString = (str: string) => {
    if (testString == "" && !NFA) {
      return;
    }
    setTestResult(NFA?.test(str));
  };

  return (
    <div className="h-full w-full flex p-12 text-white gap-10">
      <div className="flex h-full w-[45%] flex-col gap-10">
        <div className="flex-col w-full h-1/3">
          <span className="h-fit w-full p-1 text-3xl">Regex</span>
          <div className="flex h-full w-full bg-[#2b2b2b] rounded-xl p-4">
            <div className="flex h-full w-2/3 ">
              <div className="flex flex-col w-full h-fit m-auto px-12 text-black text-xl gap-4">
                <input
                  className="h-fit w-full text-black"
                  placeholder="Regex String"
                  onChange={(e) => setRegexString(e.target.value.trim())}
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
                className="flex h-full w-full overflow-auto"
              ></div>
            </div>
          </div>
        </div>
        <div className="flex w-full h-2/3 flex-col">
          <span className="h-fit w-full p-1 text-3xl">Tokens</span>
          <div className="flex flex-col h-full w-full bg-[#2b2b2b] rounded-xl px-2 py-8">
            {tokens?.map((t) => {
              return (
                <div className="w-full h-fit p-1 justify-around flex border border-black">
                  <div>Value: {t.value}</div>
                  <div>Type: {TokenType[t.type]}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex h-full w-[55%] flex-col">
        <span className="h-fit w-full p-1 text-3xl">AST</span>
        <div className="flex h-full w-full bg-[#2b2b2b] rounded-xl">
          <JSONTree data={AST} />
        </div>
      </div>
    </div>
  );
};

export default Index;
