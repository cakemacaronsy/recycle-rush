
export enum ItemType {
  DirtyJug = 'Dirty Jug',
  SortedJug = 'Sorted Jug',
  CleanJug = 'Clean Jug',
  Flakes = 'HDPE Flakes',
  MeltedStrands = 'Melted Strands',
  Pellets = 'Pellets',
  BaggedPellets = 'Bagged Pellets',
}

export enum StationType {
  Receiving = 'Receiving', // Spawns items
  Sorting = 'Sorting Table',
  Washing = 'Washing Station',
  Shredding = 'Shredder',
  Melting = 'Extruder',
  Pelletizing = 'Pelletizer',
  Packaging = 'Packaging',
  Shipping = 'Shipping Dock', // Consumes items
  ForkliftParking = 'Forklift Parking',
  Trash = 'Trash Bin'
}

export interface Position {
  x: number;
  y: number;
}

export interface Item {
  id: string;
  type: ItemType;
}

export interface StationConfig {
  id: string;
  type: StationType;
  position: Position;
  input?: ItemType;
  output?: ItemType;
  processingTime: number; // in ms
  color: string;
  autoNextStation?: string; // ID of next station for automated transfer
}

export interface StationState {
  id: string;
  isProcessing: boolean;
  progress: number;
  heldItem: Item | null;
  outputItem: Item | null;
}

export interface PlayerState {
  position: Position;
  velocity: Position;
  heldItem: Item | null;
  facing: 'left' | 'right' | 'up' | 'down';
  isInForklift: boolean;
}

export interface Transfer {
  id: string;
  item: Item;
  fromPos: Position;
  toPos: Position;
  targetStationId: string;
  progress: number; // 0 to 1
}

export interface GameState {
  player: PlayerState;
  stations: Record<string, StationState>;
  score: number;
  lastProcessedTime: number;
}
