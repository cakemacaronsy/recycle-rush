
import React from 'react';
import { PlayerState } from '../types';
import { User, HardHat } from 'lucide-react';
import { ItemEntity } from './ItemEntity';

interface PlayerProps {
  state: PlayerState;
}

export const Player: React.FC<PlayerProps> = ({ state }) => {
  return (
    <div
      className="absolute flex items-center justify-center z-50 transition-transform duration-75"
      style={{
        left: state.position.x,
        top: state.position.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {state.isInForklift ? (
        /* FORKLIFT VISUAL: Yellow Square with 2 Black Bars */
        <div className="relative">
             {/* The forks (black bars) - rotate based on facing */}
             <div className={`absolute bg-black transition-all duration-100 
                ${state.facing === 'up' ? '-top-4 left-2 w-2 h-6' : ''}
                ${state.facing === 'down' ? '-bottom-4 left-2 w-2 h-6' : ''}
                ${state.facing === 'left' ? '-left-4 top-2 h-2 w-6' : ''}
                ${state.facing === 'right' ? '-right-4 top-2 h-2 w-6' : ''}
             `} />
             <div className={`absolute bg-black transition-all duration-100
                ${state.facing === 'up' ? '-top-4 right-2 w-2 h-6' : ''}
                ${state.facing === 'down' ? '-bottom-4 right-2 w-2 h-6' : ''}
                ${state.facing === 'left' ? '-left-4 bottom-2 h-2 w-6' : ''}
                ${state.facing === 'right' ? '-right-4 bottom-2 h-2 w-6' : ''}
             `} />

            {/* The Body: Yellow Square */}
            <div className="w-14 h-14 bg-yellow-400 rounded-sm border-4 border-slate-900 shadow-2xl flex items-center justify-center relative z-10">
                 <div className="w-8 h-1 bg-black/20 absolute top-2 rounded-full" />
                 <div className="w-8 h-1 bg-black/20 absolute bottom-2 rounded-full" />
                 {/* Held Item sits on top of forklift */}
                 {state.heldItem && (
                    <div className="absolute -top-6 animate-pop-up z-20 scale-125">
                        <ItemEntity item={state.heldItem} />
                    </div>
                )}
            </div>
        </div>
      ) : (
        /* HUMAN VISUAL */
        <div className="relative w-12 h-12 bg-blue-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center">
            {/* Held Item Display */}
            {state.heldItem && (
            <div key={state.heldItem.id} className="absolute -top-8 animate-pop-up z-20">
                <ItemEntity item={state.heldItem} />
            </div>
            )}
            
            {/* Character Icon */}
            <User className="text-white" />
            
            {/* Hat (Visual Flair) */}
            <div className="absolute -top-3 text-yellow-400">
            <HardHat size={20} fill="currentColor" />
            </div>

            {/* Direction Indicator */}
            <div 
                className={`absolute w-3 h-3 bg-white rounded-full transition-all duration-100
                ${state.facing === 'right' ? '-right-1' : ''}
                ${state.facing === 'left' ? '-left-1' : ''}
                ${state.facing === 'up' ? '-top-1' : ''}
                ${state.facing === 'down' ? '-bottom-1' : ''}
                `}
            />
        </div>
      )}
      
      {/* Shadow */}
       <div className="absolute -bottom-2 w-10 h-3 bg-black/50 rounded-[100%] blur-sm -z-10" />
    </div>
  );
};
