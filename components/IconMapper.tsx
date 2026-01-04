
import React from 'react';
import { 
  Trash2, 
  Recycle, 
  Droplets, 
  Scissors, 
  Flame, 
  CircleDot, 
  Package, 
  Truck,
  Milk,
  CheckCircle2,
  Waves,
  ParkingSquare
} from 'lucide-react';
import { ItemType, StationType } from '../types';

export const getItemIcon = (type: ItemType) => {
  switch (type) {
    case ItemType.DirtyJug: return <Milk className="text-yellow-200" size={20} />;
    case ItemType.SortedJug: return <Milk className="text-white" size={20} />;
    case ItemType.CleanJug: return <Milk className="text-blue-200" size={20} />;
    case ItemType.Flakes: return <Scissors className="text-gray-200" size={18} />;
    case ItemType.MeltedStrands: return <Waves className="text-orange-400" size={20} />;
    case ItemType.Pellets: return <CircleDot className="text-white" size={16} />;
    case ItemType.BaggedPellets: return <Package className="text-amber-200" size={22} />;
    default: return <CircleDot size={16} />;
  }
};

export const getStationIcon = (type: StationType) => {
  switch (type) {
    case StationType.Receiving: return <Truck size={32} />;
    case StationType.Sorting: return <CheckCircle2 size={32} />;
    case StationType.Washing: return <Droplets size={32} />;
    case StationType.Shredding: return <Scissors size={32} />;
    case StationType.Melting: return <Flame size={32} />;
    case StationType.Pelletizing: return <CircleDot size={32} />;
    case StationType.Packaging: return <Package size={32} />;
    case StationType.Shipping: return <Truck size={32} />;
    case StationType.ForkliftParking: return <ParkingSquare size={32} />;
    default: return <Recycle size={32} />;
  }
};
