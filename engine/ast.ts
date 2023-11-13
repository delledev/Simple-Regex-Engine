export type Regex = {
  type: "regex";
  body: Node[];
};

export type Quantifier = {
  type: "Quantifier";
  kind: "*";
  greedy: true;
};

export interface NodeBase {
  type: string;
}

export interface StringNode extends NodeBase {
  type: "character";
  kind: "string";
  value: string;
  quantifier: Quantifier | null;
}

export interface GroupNode extends NodeBase {
  type: "group";
  kind: "simple";
  expression: Node[];
  quantifier: Quantifier | null;
}

export interface DisjunctionNode extends NodeBase {
  type: "Disjunction";
  right: Node;
  left: Node;
  quantifier: Quantifier | null;
}

export interface RootNode extends NodeBase {
  type: "root";
}

export type Node = StringNode | GroupNode | DisjunctionNode;

export type ParentNode = Regex | GroupNode | DisjunctionNode;
