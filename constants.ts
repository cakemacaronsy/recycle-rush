
import { ItemType, StationType, StationConfig } from './types';

export const MOVEMENT_SPEED = 6;
export const INTERACTION_RADIUS = 80; // pixels
export const TICK_RATE = 16; // ~60fps

// Map Dimensions
export const MAP_WIDTH = 800;
export const MAP_HEIGHT = 600;

// Items that require a forklift to move
export const HEAVY_ITEMS = [
  ItemType.SortedJug,
  ItemType.Pellets,
  ItemType.BaggedPellets
];

// Station Definitions
export const STATIONS: StationConfig[] = [
  {
    id: 'receiving-1',
    type: StationType.Receiving,
    position: { x: 50, y: 100 },
    output: ItemType.DirtyJug,
    processingTime: 3000, // Spawns every 3s
    color: 'bg-yellow-600',
  },
  {
    id: 'sorting-1',
    type: StationType.Sorting,
    position: { x: 250, y: 100 },
    input: ItemType.DirtyJug,
    output: ItemType.SortedJug,
    processingTime: 1500,
    color: 'bg-orange-500',
  },
  {
    id: 'washing-1',
    type: StationType.Washing,
    position: { x: 450, y: 100 },
    input: ItemType.SortedJug,
    output: ItemType.CleanJug,
    processingTime: 2000,
    color: 'bg-blue-500',
  },
  {
    id: 'shredder-1',
    type: StationType.Shredding,
    position: { x: 650, y: 200 },
    input: ItemType.CleanJug,
    output: ItemType.Flakes,
    processingTime: 1000,
    color: 'bg-gray-500',
    autoNextStation: 'extruder-1', // Automate to Extruder
  },
  {
    id: 'extruder-1',
    type: StationType.Melting,
    position: { x: 650, y: 400 },
    input: ItemType.Flakes,
    output: ItemType.MeltedStrands,
    processingTime: 3000,
    color: 'bg-red-600',
    autoNextStation: 'pelletizer-1', // Automate to Pelletizer
  },
  {
    id: 'pelletizer-1',
    type: StationType.Pelletizing,
    position: { x: 450, y: 500 },
    input: ItemType.MeltedStrands,
    output: ItemType.Pellets,
    processingTime: 1500,
    color: 'bg-green-500',
  },
  {
    id: 'packaging-1',
    type: StationType.Packaging,
    position: { x: 250, y: 500 },
    input: ItemType.Pellets,
    output: ItemType.BaggedPellets,
    processingTime: 2000,
    color: 'bg-indigo-600',
  },
  {
    id: 'shipping-1',
    type: StationType.Shipping,
    position: { x: 50, y: 500 },
    input: ItemType.BaggedPellets,
    processingTime: 500, // Instant ship
    color: 'bg-emerald-700',
  },
  {
    id: 'parking-1',
    type: StationType.ForkliftParking,
    position: { x: 350, y: 300 }, // Central location
    processingTime: 0,
    color: 'bg-yellow-400',
  },
];
