
export type NodeType = 'empty' | 'wall' | 'start' | 'end' | 'visited' | 'path' | 'frontier';

export interface NodeData {
  row: number;
  col: number;
  type: NodeType;
  distanceFromStart: number; // g-cost
  distanceToGoal: number;    // h-cost
  totalCost: number;         // f-cost
  parent?: NodeData;
}

export enum AlgorithmStep {
  PROBLEM = 1,
  NAIVE = 2,
  IMPROVEMENT = 3,
  VISUALIZATION = 4,
  IMPLEMENTATION = 5,
  NAMING = 6,
  LIMITATIONS = 7,
  EXTENSIONS = 8
}
