
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  StationState, 
  PlayerState, 
  StationType, 
  Position,
  Transfer
} from './types';
import { 
  STATIONS, 
  MOVEMENT_SPEED, 
  INTERACTION_RADIUS, 
  TICK_RATE,
  MAP_WIDTH,
  MAP_HEIGHT,
  HEAVY_ITEMS
} from './constants';
import { Player } from './components/Player';
import { Station } from './components/Station';
import { RotateCcw, Play, Keyboard, Box, ArrowRight } from 'lucide-react';

const INITIAL_PLAYER_STATE: PlayerState = {
  position: { x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 },
  velocity: { x: 0, y: 0 },
  heldItem: null,
  facing: 'down',
  isInForklift: false,
};

// Helper to get fresh initial station state
const getInitialStationsState = (): Record<string, StationState> => {
  return STATIONS.reduce((acc, s) => {
    acc[s.id] = {
      id: s.id,
      isProcessing: false,
      progress: 0,
      heldItem: null,
      outputItem: null,
    };
    return acc;
  }, {} as Record<string, StationState>);
};

const App: React.FC = () => {
  // Game State
  const [gameStarted, setGameStarted] = useState(false);
  const [player, setPlayer] = useState<PlayerState>(INITIAL_PLAYER_STATE);
  const [stations, setStations] = useState<Record<string, StationState>>(getInitialStationsState());
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [score, setScore] = useState(0);
  const [log, setLog] = useState<string[]>(["Welcome to Recycled Rush!", "Go to Receiving to pick up jugs."]);
  const [hudFaded, setHudFaded] = useState(false);
  
  // Input State (Refs for loop access)
  const keysPressed = useRef<Set<string>>(new Set());
  const lastTimeRef = useRef<number>(0);
  const requestRef = useRef<number>();

  // Helpers
  const addLog = useCallback((msg: string) => {
    setLog(prev => [msg, ...prev].slice(0, 5));
  }, []);

  const getDistance = (p1: Position, p2: Position) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  const findNearestStation = (pos: Position): string | null => {
    let nearestId = null;
    let minDist = Infinity;

    for (const station of STATIONS) {
      const dist = getDistance(pos, station.position);
      if (dist < INTERACTION_RADIUS && dist < minDist) {
        minDist = dist;
        nearestId = station.id;
      }
    }
    return nearestId;
  };

  // State Management Actions
  const handleStartGame = () => {
    setGameStarted(true);
    lastTimeRef.current = performance.now();
  };

  const handleRestart = () => {
    setGameStarted(false);
    setPlayer(INITIAL_PLAYER_STATE);
    setStations(getInitialStationsState());
    setTransfers([]);
    setScore(0);
    setLog(["Shift reset.", "Ready for production."]);
    keysPressed.current.clear();
  };

  const handleInteraction = () => {
    if (!gameStarted) return;

    const nearbyId = findNearestStation(player.position);
    if (!nearbyId) return;

    const stationConfig = STATIONS.find(s => s.id === nearbyId)!;
    const stationState = stations[nearbyId];

    // Case 0: Forklift Parking (Toggle Vehicle)
    if (stationConfig.type === StationType.ForkliftParking) {
        if (player.heldItem) {
            addLog("Drop your item before entering/exiting forklift!");
            return;
        }
        setPlayer(prev => ({
            ...prev,
            isInForklift: !prev.isInForklift
        }));
        addLog(player.isInForklift ? "Exited Forklift." : "Entered Forklift.");
        return;
    }

    // Case 1: Player dropping item into station
    if (player.heldItem && !stationState.heldItem && !stationState.outputItem) {
      // Check if station accepts this item
      if (stationConfig.input === player.heldItem.type) {
        setStations(prev => ({
          ...prev,
          [nearbyId]: {
            ...prev[nearbyId],
            heldItem: player.heldItem,
            isProcessing: true,
            progress: 0
          }
        }));
        setPlayer(prev => ({ ...prev, heldItem: null }));
        addLog(`Loaded ${player.heldItem.type} into ${stationConfig.type}`);
        return;
      } else if (stationConfig.type === StationType.Shipping && player.heldItem.type === stationConfig.input) {
        // Shipping Logic
        setScore(s => s + 100);
        addLog(`Shipped ${player.heldItem.type}! +100 Points`);
        setPlayer(prev => ({ ...prev, heldItem: null }));
        return;
      } else {
        addLog(`This station expects ${stationConfig.input}, not ${player.heldItem.type}`);
      }
    }

    // Case 2: Player picking up output from station
    if (!player.heldItem && stationState.outputItem) {
        // Prevent pickup if item is automated
        if (stationConfig.autoNextStation) {
            addLog("System Automated. Do not touch!");
            return;
        }

        // FORKLIFT CONSTRAINT CHECK
        const isHeavy = HEAVY_ITEMS.includes(stationState.outputItem.type);
        
        if (isHeavy && !player.isInForklift) {
            addLog("Too heavy! Use the Forklift.");
            return;
        }
        if (!isHeavy && player.isInForklift) {
            addLog("Too delicate! Exit Forklift to pickup.");
            return;
        }

        setPlayer(prev => ({ ...prev, heldItem: stationState.outputItem }));
        setStations(prev => ({
            ...prev,
            [nearbyId]: {
            ...prev[nearbyId],
            outputItem: null,
            progress: 0
            }
        }));
        addLog(`Picked up ${stationState.outputItem?.type}`);
        return;
    }
  };

  // Game Loop
  const updateGame = useCallback((time: number) => {
    const deltaTime = time - lastTimeRef.current;
    
    // Pause update logic if game hasn't started
    if (!gameStarted) {
        lastTimeRef.current = time;
        requestRef.current = requestAnimationFrame(updateGame);
        return;
    }

    if (deltaTime >= TICK_RATE) {
      lastTimeRef.current = time;

      // --- 1. Update Player Movement ---
      let dx = 0;
      let dy = 0;
      if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) dy -= 1;
      if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) dy += 1;
      if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) dx -= 1;
      if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) dx += 1;

      // Normalize diagonal movement
      if (dx !== 0 && dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx /= length;
        dy /= length;
      }

      setPlayer(prev => {
        let newX = prev.position.x + dx * MOVEMENT_SPEED;
        let newY = prev.position.y + dy * MOVEMENT_SPEED;

        // Map Bounds
        newX = Math.max(20, Math.min(MAP_WIDTH - 20, newX));
        newY = Math.max(20, Math.min(MAP_HEIGHT - 20, newY));
        
        // Wall collisions (Simplified: check distance to stations)
        STATIONS.forEach(station => {
           const dist = Math.sqrt(Math.pow(station.position.x - newX, 2) + Math.pow(station.position.y - newY, 2));
           if (dist < 40) { // 40 is rough radius of station
               const angle = Math.atan2(newY - station.position.y, newX - station.position.x);
               newX = station.position.x + Math.cos(angle) * 40;
               newY = station.position.y + Math.sin(angle) * 40;
           }
        });

        let facing = prev.facing;
        if (dx > 0) facing = 'right';
        if (dx < 0) facing = 'left';
        if (dy > 0) facing = 'down';
        if (dy < 0) facing = 'up';

        return {
          ...prev,
          position: { x: newX, y: newY },
          facing
        };
      });

      // --- 2. Update Transfers (Automated Items) ---
      let completedTransfers: Transfer[] = [];
      setTransfers(prev => {
        const next = prev.map(t => ({
          ...t,
          progress: Math.min(1, t.progress + 0.015) // Approx 1 second travel time
        }));
        
        // Extract completed
        completedTransfers = next.filter(t => t.progress >= 1);
        return next.filter(t => t.progress < 1);
      });


      // --- 3. Update Stations ---
      setStations(prevStations => {
        const nextStations = { ...prevStations };
        let hasChanges = false;

        // A. Handle Incoming Transfers
        completedTransfers.forEach(transfer => {
            const target = nextStations[transfer.targetStationId];
            if (target && !target.heldItem) {
                target.heldItem = transfer.item;
                target.isProcessing = true;
                target.progress = 0;
                hasChanges = true;
            } else {
                // If target is full, item is lost? Or we bounce it? 
                // For simplified prototype: It vanishes (waste). 
                // Ideally we'd block the transfer start, but this is fine for now.
                console.warn("Transfer arrived but station full!");
            }
        });

        STATIONS.forEach(config => {
          const st = nextStations[config.id];

          // B. Auto-spawn logic for Receiving
          if (config.type === StationType.Receiving) {
            if (!st.outputItem && !st.isProcessing) {
                st.isProcessing = true;
                st.progress = 0;
                hasChanges = true;
            } else if (st.isProcessing) {
                st.progress += (TICK_RATE / config.processingTime) * 100;
                if (st.progress >= 100) {
                    st.isProcessing = false;
                    st.progress = 0;
                    st.outputItem = { id: Date.now().toString(), type: config.output! };
                }
                hasChanges = true;
            }
            return;
          }

          // C. Automation: Check if we need to start a transfer
          if (st.outputItem && config.autoNextStation) {
              const targetSt = nextStations[config.autoNextStation];
              const targetConfig = STATIONS.find(s => s.id === config.autoNextStation);
              
              // Only start transfer if target is ready (empty input)
              if (targetSt && !targetSt.heldItem && !targetSt.isProcessing && !targetSt.outputItem && targetConfig) {
                  // Create Transfer
                  setTransfers(current => [...current, {
                      id: Math.random().toString(),
                      item: st.outputItem!,
                      fromPos: config.position,
                      toPos: targetConfig.position,
                      targetStationId: targetConfig.id,
                      progress: 0
                  }]);
                  
                  // Clear Output from current
                  st.outputItem = null;
                  hasChanges = true;
              }
          }

          // D. Processing Logic for standard stations
          if (st.isProcessing && st.heldItem) {
            st.progress += (TICK_RATE / config.processingTime) * 100;
            hasChanges = true;

            if (st.progress >= 100) {
              st.isProcessing = false;
              st.progress = 0;
              // Transform Item
              st.outputItem = { id: st.heldItem.id, type: config.output! };
              st.heldItem = null;
            }
          }
        });

        return hasChanges ? nextStations : prevStations;
      });
    }

    requestRef.current = requestAnimationFrame(updateGame);
  }, [gameStarted]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateGame);
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
  }, [updateGame]);

  // HUD Auto-Fade Effect
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (gameStarted) {
      setHudFaded(false);
      timer = setTimeout(() => {
        setHudFaded(true);
      }, 5000);
    } else {
      setHudFaded(false);
    }
    return () => clearTimeout(timer);
  }, [gameStarted]);

  // Input Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow starting with Enter or Space if not started
      if (!gameStarted) {
         if (e.key === "Enter" || e.key === " ") {
            handleStartGame();
         }
         return;
      }

      keysPressed.current.add(e.key.toLowerCase());
      if (e.key.toLowerCase() === 'e') {
        handleInteraction();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [player, stations, gameStarted]);

  const nearestStationId = findNearestStation(player.position);

  // Dynamic classes for HUD visibility
  const getHudClass = (baseClass: string) => {
    if (!gameStarted) return `${baseClass} opacity-0 pointer-events-none`;
    if (hudFaded) return `${baseClass} opacity-0 hover:opacity-100 transition-opacity duration-1000`;
    return `${baseClass} opacity-100 transition-opacity duration-1000`;
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-zinc-800 font-mono relative">
        <div className="scanlines absolute inset-0 pointer-events-none z-50 opacity-20" />
        
        {/* WELCOME / START SCREEN OVERLAY */}
        {!gameStarted && (
            <div className="absolute inset-0 z-[60] bg-slate-900/95 flex flex-col items-center justify-center text-center p-8 backdrop-blur-sm animate-in fade-in duration-500">
                <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl shadow-2xl border-4 border-slate-700">
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-2 tracking-tighter">
                        RECYCLED RUSH
                    </h1>
                    <p className="text-slate-400 mb-6 text-sm uppercase tracking-widest font-bold">HDPE Recycling Simulation</p>
                    
                    <div className="space-y-4 mb-8 text-left bg-slate-900/50 p-6 rounded-lg border border-slate-700">
                        <div className="flex items-center gap-4 text-slate-200">
                            <Keyboard className="text-yellow-400" />
                            <span><strong className="text-white">WASD</strong> to Move</span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-200">
                            <Box className="text-green-400" />
                            <span><strong className="text-white">E</strong> to Interact / Pick Up</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-700">
                            <strong>New Mechanic:</strong> Use the <span className="text-yellow-400 font-bold">Forklift Parking</span> (Center) to switch modes. 
                            Some heavy items (Sorted Jugs, Pellets) require the forklift!
                        </div>
                    </div>

                    <button 
                        onClick={handleStartGame}
                        className="group w-full py-4 bg-green-500 hover:bg-green-400 text-slate-900 font-black text-xl rounded-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Play fill="currentColor" /> START SHIFT
                    </button>
                    <p className="mt-4 text-xs text-slate-600 animate-pulse">Press SPACE or CLICK to start</p>
                </div>
            </div>
        )}

        {/* Header HUD */}
        <div className={getHudClass("absolute top-4 left-4 z-50")}>
            <div className="bg-slate-900/90 p-4 rounded-lg border border-slate-700 shadow-xl text-slate-100 w-80">
                <div className="flex justify-between items-start mb-2">
                    <h1 className="text-xl font-bold flex items-center gap-2 text-green-400">
                        Recycled Rush
                    </h1>
                    {/* RESTART BUTTON */}
                    <button 
                        onClick={handleRestart}
                        className="text-xs bg-red-900/50 hover:bg-red-600 text-red-200 hover:text-white px-2 py-1 rounded border border-red-800/50 flex items-center gap-1 transition-colors pointer-events-auto"
                        title="Restart Game"
                    >
                        <RotateCcw size={12} /> Restart
                    </button>
                </div>
                
                <div className="flex justify-between items-center text-sm border-b border-slate-700 pb-2 mb-2">
                    <span>Score:</span>
                    <span className="text-yellow-400 font-bold text-lg">{score}</span>
                </div>
                
                <div className="mt-2 h-24 overflow-hidden flex flex-col justify-end">
                    {log.map((entry, i) => (
                        <div key={i} className={`text-xs ${i === 0 ? 'text-white font-bold' : 'text-slate-500'}`}>
                            {i === 0 ? '> ' : ''}{entry}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Legend */}
        <div className={getHudClass("absolute top-4 right-4 z-50")}>
           <div className="bg-slate-900/90 p-4 rounded-lg border border-slate-700 shadow-xl text-slate-100 text-xs">
                <h3 className="font-bold mb-2 text-slate-300 border-b border-slate-700 pb-1">Process Pipeline</h3>
                <ul className="space-y-1">
                    <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-400 border border-black"></div> Forklift Parking</li>
                    <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-600"></div> Receiving (Dirty)</li>
                    <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Sorting <span className="text-[10px] text-yellow-400 ml-1">➡ Forklift</span></li>
                    <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Washing</li>
                    <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-500"></div> Shredding <span className="text-[10px] text-blue-300 ml-1">➡ Auto</span></li>
                    <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-600"></div> Melting <span className="text-[10px] text-blue-300 ml-1">➡ Auto</span></li>
                    <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Pelletizing <span className="text-[10px] text-yellow-400 ml-1">➡ Forklift</span></li>
                    <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-600"></div> Packaging <span className="text-[10px] text-yellow-400 ml-1">➡ Forklift</span></li>
                    <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-700"></div> Shipping</li>
                </ul>
           </div>
        </div>

        {/* Game Canvas Container */}
        <div 
          className="relative bg-slate-700 rounded-xl overflow-hidden shadow-2xl border-4 border-slate-600"
          style={{ 
            width: MAP_WIDTH, 
            height: MAP_HEIGHT,
            backgroundImage: 'radial-gradient(circle at center, #334155 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        >
            {/* Background Pipes (Visual only) */}
            <svg className="absolute inset-0 pointer-events-none opacity-30" width={MAP_WIDTH} height={MAP_HEIGHT}>
                 {/* Standard Walking Paths */}
                 <path d="M 50 100 L 250 100 L 450 100" stroke="yellow" strokeWidth="4" strokeDasharray="10,5" fill="none" />
                 <path d="M 450 100 C 550 100, 650 100, 650 200" stroke="yellow" strokeWidth="4" strokeDasharray="10,5" fill="none" />
                 
                 {/* AUTOMATED PIPES (Shredder -> Extruder -> Pelletizer) */}
                 <line x1="650" y1="200" x2="650" y2="400" stroke="#475569" strokeWidth="16" />
                 <line x1="650" y1="200" x2="650" y2="400" stroke="#1e293b" strokeWidth="8" />

                 <path d="M 650 400 C 650 500, 550 500, 450 500" stroke="#475569" strokeWidth="16" fill="none" />
                 <path d="M 650 400 C 650 500, 550 500, 450 500" stroke="#1e293b" strokeWidth="8" fill="none" />

                 {/* Packaging Path */}
                 <path d="M 450 500 L 50 500" stroke="yellow" strokeWidth="4" strokeDasharray="10,5" fill="none" />
            </svg>

            {/* Stations */}
            {STATIONS.map(config => (
                <Station 
                    key={config.id} 
                    config={config} 
                    state={stations[config.id]} 
                    isNearby={nearestStationId === config.id}
                />
            ))}

            {/* Active Transfers (Moving Items in Pipes) */}
            {transfers.map(t => {
                // Lerp Position
                const currentX = t.fromPos.x + (t.toPos.x - t.fromPos.x) * t.progress;
                const currentY = t.fromPos.y + (t.toPos.y - t.fromPos.y) * t.progress;
                
                // Curve logic for Extruder -> Pelletizer (simple hack for visual flair)
                // If it's the specific curved path, we can try to offset, but linear is acceptable for "inside pipe"
                // A better approach would be to calculate curve, but for now linear dot inside the thick pipe is clear enough.

                return (
                    <div 
                        key={t.id}
                        className="absolute w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] z-10"
                        style={{
                            left: currentX,
                            top: currentY,
                            transform: 'translate(-50%, -50%)'
                        }}
                    />
                );
            })}

            {/* Player */}
            <Player state={player} />

            {/* Ground Markings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-600 font-bold text-6xl opacity-10 pointer-events-none">
                RECYCLED RUSH
            </div>
        </div>

        <div className="mt-4 text-slate-400 text-sm">
             Prototype v0.1 - Testing Physics & State Flow
        </div>
    </div>
  );
};

export default App;
