// Definition of a state in a non-deterministic finite automaton (NFA)
export type State = {
  isEnd: boolean;
  transitions: Record<string, State>; // Transitions based on input symbols
  epsilonTransitions: State[]; // Epsilon transitions (no input symbol)
};

// Definition of a non-deterministic finite automaton (NFA)
export type NFA = {
  start: State; // Starting state
  end: State; // Ending state
};

// Function to create a new state
export function State(isEnd: boolean) {
  return {
    isEnd,
    transitions: {},
    epsilonTransitions: [],
  } as State;
}

// Function to add an epsilon transition between two states
export function addEpsilonTransition(from: State, to: State) {
  from.epsilonTransitions.push(to);
}

// Function to add a transition between two states based on a symbol
export function addTransition(from: State, to: State, symbol: string) {
  from.transitions[symbol] = to;
}

// Function to create an NFA with a single transition based on a symbol
export function NFA(symbol: string): NFA {
  const start = State(false);
  const end = State(true);
  addTransition(start, end, symbol);

  return { start, end } as NFA;
}

// Function to concatenate two NFAs
export function concat(first: NFA, second: NFA): NFA {
  addEpsilonTransition(first.end, second.start);
  first.end.isEnd = false;

  return { start: first.start, end: second.end } as NFA;
}

// Function to create the union of two NFAs
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

// Function to repeat an NFA
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

// Function to test whether a given word is accepted by the NFA
export function test(nfa: NFA, word: string): boolean {
  // Helper function to compute epsilon closure of a set of states
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

  // Helper function to get the next reachable states based on input symbol
  function getNextStates(states: State[], symbol: string): State[] {
    const nextStates: State[] = [];

    states.forEach((state) => {
      if (state.transitions[symbol]) {
        nextStates.push(...epsilonClosure([state.transitions[symbol]]));
      }
    });

    return nextStates;
  }

  // Start with the epsilon closure of the NFA's initial state
  let currentStates: State[] = epsilonClosure([nfa.start]);

  // Process each symbol in the word, updating the set of reachable states
  for (const symbol of word) {
    currentStates = epsilonClosure(getNextStates(currentStates, symbol));
  }

  // Check if any of the current states is an accepting state
  return currentStates.some((state) => state.isEnd);
}

// Function to generate strings that match the given NFA
export function generateStrings(nfa: NFA) {
  // Use a helper function to shuffle the array of generated strings
  return shuffleArray(generateMatchingStrings(nfa, 10000, 20));
}

// Function to generate matching strings for a given NFA
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

// Recursive function to generate matching strings for a given state
function generateMatchingStringsRecursive(
  currentState: State,
  currentString: string,
  maxLength: number,
  matchingStrings: string[],
  numStrings: number,
) {
  // Terminate if the required number of strings is generated or maxLength is exceeded
  if (
    matchingStrings.length >= numStrings ||
    currentString.length > maxLength
  ) {
    return;
  }

  // If the current state is an accepting state, add the current string to the result
  if (currentState.isEnd) {
    matchingStrings.push(currentString);
  }

  // Recursively explore epsilon transitions
  for (const epsilonTransition of currentState.epsilonTransitions) {
    generateMatchingStringsRecursive(
      epsilonTransition,
      currentString,
      maxLength,
      matchingStrings,
      numStrings,
    );
  }

  // Explore transitions based on input symbols
  const symbols = Object.keys(currentState.transitions);
  for (const symbol of symbols) {
    if (symbol === " ") {
      // Handle space as a special case
      const nextState = currentState.transitions[symbol];
      generateMatchingStringsRecursive(
        nextState,
        currentString + " ",
        maxLength,
        matchingStrings,
        numStrings,
      );
    } else {
      // For other symbols, continue the exploration
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

// Function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray(inputArray: string[]): string[] {
  const shuffledArray = inputArray.slice();
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  // Return a subset of the shuffled array (e.g., first 10 elements)
  return shuffledArray.slice(0, 10);
}
