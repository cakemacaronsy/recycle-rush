import React from 'react';
import { StationConfig, StationState, StationType, ItemType } from '../types';
import { getStationIcon } from './IconMapper';
import { ItemEntity } from './ItemEntity';
import { Milk } from 'lucide-react';

interface StationProps {
  config: StationConfig;
  state: StationState;
  isNearby: boolean;
}

export const Station: React.FC<StationProps> = ({ config, state, isNearby }) => {
  const isProcessing = state.isProcessing;
  const hasOutput = state.outputItem !== null;
  const hasInput = state.heldItem !== null;
  const isReceiving = config.type === StationType.Receiving;

  return (
    <div
      className={`absolute flex flex-col items-center justify-center transition-all duration-200`}
      style={{
        left: config.position.x,
        top: config.position.y,
        width: '96px',
        height: '96px',
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Interaction Indicator */}
      {isNearby && (
        <div className="absolute -top-12 animate-bounce bg-white text-black px-2 py-1 rounded text-xs font-bold uppercase tracking-wider shadow-lg z-20">
          Press E
        </div>
      )}

      {/* Main Station Body */}
      <div 
        className={`
          relative w-24 h-24 rounded-lg shadow-2xl border-b-4 border-r-4 border-black/30 
          flex flex-col items-center justify-center 
          ${config.color} 
          ${isNearby ? 'ring-4 ring-white/50' : ''}
          ${isProcessing ? 'animate-rumble' : ''}
        `}
      >
        
        {/* Receiving Station: Pile of Jugs Visual */}
        {isReceiving && (
          <div className="absolute inset-0 overflow-hidden rounded-lg opacity-30 pointer-events-none">
            <div className="absolute top-1 left-1 transform -rotate-12"><Milk size={16} /></div>
            <div className="absolute top-2 right-2 transform rotate-45"><Milk size={18} /></div>
            <div className="absolute bottom-2 left-3 transform rotate-180"><Milk size={14} /></div>
            <div className="absolute bottom-1 right-1 transform -rotate-12"><Milk size={16} /></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-90"><Milk size={20} /></div>
          </div>
        )}

        {/* Processing Smoke Effects */}
        {isProcessing && (
          <div className="absolute -top-8 left-0 w-full h-8 overflow-visible pointer-events-none">
             <div className="absolute left-1/2 bottom-0 w-3 h-3 bg-white/40 rounded-full animate-smoke-1" />
             <div className="absolute left-1/3 bottom-0 w-2 h-2 bg-white/30 rounded-full animate-smoke-2" />
             <div className="absolute left-2/3 bottom-0 w-4 h-4 bg-white/20 rounded-full animate-smoke-3" />
          </div>
        )}

        {/* Icon */}
        <div className={`text-white/90 drop-shadow-md z-10 ${isProcessing ? 'scale-110 transition-transform' : ''}`}>
          {getStationIcon(config.type)}
        </div>
        
        <span className="text-[10px] font-bold text-white uppercase mt-1 tracking-tighter opacity-80 z-10">
          {config.type}
        </span>

        {/* Processing Bar */}
        {isProcessing && (
          <div className="absolute bottom-2 w-16 h-2 bg-black/40 rounded-full overflow-hidden z-10">
            <div 
              className="h-full bg-green-400 transition-all duration-100 ease-linear"
              style={{ width: `${state.progress}%` }}
            />
          </div>
        )}

        {/* Output Item (Waiting to be picked up) */}
        {hasOutput && state.outputItem && (
          <div className="absolute -right-4 -bottom-4 z-10 animate-pulse">
             <ItemEntity item={state.outputItem} />
          </div>
        )}

        {/* Input Item (Being processed or waiting) */}
        {hasInput && state.heldItem && !isProcessing && (
           <div className="absolute -left-4 -top-4 z-10 opacity-80">
            <ItemEntity item={state.heldItem} />
          </div>
        )}
      </div>
      
      {/* Floor Shadow */}
      <div className="absolute -bottom-4 w-20 h-4 bg-black/40 rounded-[100%] blur-sm -z-10" />
    </div>
  );
};