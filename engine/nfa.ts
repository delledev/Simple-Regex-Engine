export type State = {
  isEnd: boolean;
  transitions: Record<string, State>;
  epsilonTransitions: State[];
};

export type NFA = {
  start: State;
  end: State;
};

export function State(isEnd: boolean) {
  return {
    isEnd,
    transitions: {},
    epsilonTransitions: [],
  } as State;
}

export function addEpsilonTransition(from: State, to: State) {
  from.epsilonTransitions.push(to);
}

export function addTransition(from: State, to: State, symbol: string) {
  from.transitions[symbol] = to;
}

export function NFA(symbol: string): NFA {
  const start = State(false);
  const end = State(true);
  addTransition(start, end, symbol);

  return { start, end } as NFA;
}

export function concat(first: NFA, second: NFA): NFA {
  addEpsilonTransition(first.end, second.start);
  first.end.isEnd = false;

  return { start: first.start, end: second.end } as NFA;
}

export function disjunction(first: NFA, second: NFA) {
  const start = State(false);
  addEpsilonTransition(start, first.start);
  addEpsilonTransition(start, second.start);

  const end = State(true);
  addEpsilonTransition(first.end, end);
  first.end.isEnd = false;
  addEpsilonTransition(second.end, end);
  second.end.isEnd = false;

  return { start, end } as NFA;
}

export function repeat(nfa: NFA): NFA {
  const start = State(false);
  const end = State(true);

  addEpsilonTransition(start, end);
  addEpsilonTransition(start, nfa.start);

  addEpsilonTransition(nfa.end, end);
  addEpsilonTransition(nfa.end, nfa.start);
  nfa.end.isEnd = false;

  return { start, end } as NFA;
}

export function addNextState(
  state: State,
  nextStates: State[],
  visited: State[],
) {
  if (state.epsilonTransitions.length) {
    for (const st of state.epsilonTransitions) {
      if (!visited.find((vs) => vs === st)) {
        visited.push(st);
        addNextState(st, nextStates, visited);
      }
    }
  } else {
    nextStates.push(state);
  }
}

export function test(nfa: NFA, word: string): boolean {
  function epsilonClosure(states: State[]): State[] {
    const closure: State[] = [];
    const visited: State[] = [];

    function addStatesToClosure(state: State) {
      if (!visited.includes(state)) {
        visited.push(state);
        closure.push(state);
        state.epsilonTransitions.forEach((nextState) =>
          addStatesToClosure(nextState),
        );
      }
    }

    states.forEach((state) => addStatesToClosure(state));
    return closure;
  }

  function getNextStates(states: State[], symbol: string): State[] {
    const nextStates: State[] = [];

    states.forEach((state) => {
      if (state.transitions[symbol]) {
        nextStates.push(...epsilonClosure([state.transitions[symbol]]));
      }
    });

    return nextStates;
  }

  let currentStates: State[] = epsilonClosure([nfa.start]);

  for (const symbol of word) {
    currentStates = epsilonClosure(getNextStates(currentStates, symbol));
  }

  return currentStates.some((state) => state.isEnd);
}

export function generateStrings(nfa: NFA) {
  return shuffleArray(generateMatchingStrings(nfa, 10000, 20));
}

function generateMatchingStrings(
  nfa: NFA,
  numStrings: number,
  maxLength: number = 10,
): string[] {
  const matchingStrings: string[] = [];
  if (!nfa) {
    return [];
  }
  generateMatchingStringsRecursive(
    nfa.start,
    "",
    maxLength,
    matchingStrings,
    numStrings,
  );
  return matchingStrings;
}

function generateMatchingStringsRecursive(
  currentState: State,
  currentString: string,
  maxLength: number,
  matchingStrings: string[],
  numStrings: number,
) {
  if (
    matchingStrings.length >= numStrings ||
    currentString.length > maxLength
  ) {
    return;
  }

  if (currentState.isEnd) {
    matchingStrings.push(currentString);
  }

  for (const epsilonTransition of currentState.epsilonTransitions) {
    generateMatchingStringsRecursive(
      epsilonTransition,
      currentString,
      maxLength,
      matchingStrings,
      numStrings,
    );
  }

  const symbols = Object.keys(currentState.transitions);
  for (const symbol of symbols) {
    if (symbol === " ") {
      const nextState = currentState.transitions[symbol];
      generateMatchingStringsRecursive(
        nextState,
        currentString + " ",
        maxLength,
        matchingStrings,
        numStrings,
      );
    } else {
      const nextState = currentState.transitions[symbol];
      generateMatchingStringsRecursive(
        nextState,
        currentString + symbol,
        maxLength,
        matchingStrings,
        numStrings,
      );
    }
  }
}

function shuffleArray(inputArray: string[]): string[] {
  const shuffledArray = inputArray.slice();
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray.slice(0, 10);
}
