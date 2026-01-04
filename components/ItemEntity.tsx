import React from 'react';
import { Item } from '../types';
import { getItemIcon } from './IconMapper';

interface ItemEntityProps {
  item: Item;
  className?: string;
}

export const ItemEntity: React.FC<ItemEntityProps> = ({ item, className }) => {
  return (
    <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-600 shadow-lg ${className || ''} animate-pulse`}>
      {getItemIcon(item.type)}
    </div>
  );
};