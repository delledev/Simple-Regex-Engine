// Define the types representing different nodes in the abstract syntax tree (AST)

// Top-level type representing the entire regular expression
export type Regex = {
  type: "regex";
  body: Node[]; // An array of nodes representing the components of the regular expression
};

// Type representing a quantifier, such as '*'
export type Quantifier = {
  type: "Quantifier";
  kind: "*";
  greedy: true;
};

// Base interface for all nodes in the AST
export interface NodeBase {
  type: string; // Common property indicating the type of the node
}

// Type representing a character node in the AST
export interface StringNode extends NodeBase {
  type: "character";
  kind: "string";
  value: string; // The actual character value
  quantifier: Quantifier | null; // Optional quantifier associated with the character
}

// Type representing a group node in the AST
export interface GroupNode extends NodeBase {
  type: "group";
  kind: "simple";
  expression: Node[]; // Array of nodes representing the components of the group
  quantifier: Quantifier | null; // Optional quantifier associated with the group
}

// Type representing a disjunction node in the AST (e.g., a|b)
export interface DisjunctionNode extends NodeBase {
  type: "Disjunction";
  right: Node; // Right-hand side of the disjunction
  left: Node; // Left-hand side of the disjunction
  quantifier: Quantifier | null; // Optional quantifier associated with the disjunction
}

// Type representing the root node in the AST
export interface RootNode extends NodeBase {
  type: "root";
}

// Union type representing any node in the AST
export type Node = StringNode | GroupNode | DisjunctionNode;

// Union type representing any parent node that can have child nodes
export type ParentNode = Regex | GroupNode | DisjunctionNode;
