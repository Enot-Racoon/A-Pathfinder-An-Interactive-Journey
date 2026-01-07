
import React, { useState, useRef } from 'react';
import { Play, RotateCcw, Wall, MousePointer2, MapPin, Target } from 'lucide-react';
import { NodeData, NodeType } from '../types.ts';

const GRID_ROWS = 15;
const GRID_COLS = 20;

const createInitialGrid = (): NodeData[][] => {
  const grid: NodeData[][] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    const row: NodeData[] = [];
    for (let c = 0; c < GRID_COLS; c++) {
      row.push({
        row: r,
        col: c,
        type: 'empty',
        distanceFromStart: Infinity,
        distanceToGoal: Infinity,
        totalCost: Infinity,
      });
    }
    grid.push(row);
  }
  
  // Set default start and end
  grid[7][3].type = 'start';
  grid[7][16].type = 'end';
  
  return grid;
};

const getManhattanDistance = (node: NodeData, goal: NodeData) => {
  return Math.abs(node.row - goal.row) + Math.abs(node.col - goal.col);
};

const InteractiveGrid: React.FC = () => {
  const [grid, setGrid] = useState<NodeData[][]>(createInitialGrid());
  const [isSolving, setIsSolving] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<NodeType>('wall');
  const [startPos, setStartPos] = useState({ r: 7, c: 3 });
  const [endPos, setEndPos] = useState({ r: 7, c: 16 });
  const solvingRef = useRef(false);

  const clearPath = () => {
    setIsSolving(false);
    solvingRef.current = false;
    setGrid(prev => prev.map(row => row.map(node => {
        if (node.type === 'visited' || node.type === 'path' || node.type === 'frontier') {
            return { ...node, type: 'empty', distanceFromStart: Infinity, totalCost: Infinity, parent: undefined };
        }
        return node;
    })));
  };

  const handleMouseDown = (r: number, c: number) => {
    if (isSolving) return;
    const node = grid[r][c];
    if (node.type === 'start') {
        setDrawMode('start');
    } else if (node.type === 'end') {
        setDrawMode('end');
    } else {
        setDrawMode(node.type === 'wall' ? 'empty' : 'wall');
    }
    setIsDrawing(true);
    updateNode(r, c, node.type === 'wall' ? 'empty' : 'wall');
  };

  const handleMouseEnter = (r: number, c: number) => {
    if (!isDrawing || isSolving) return;
    updateNode(r, c, drawMode);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const updateNode = (r: number, c: number, type: NodeType) => {
    setGrid(prev => {
      const newGrid = prev.map(row => [...row]);
      const oldType = newGrid[r][c].type;

      if (type === 'start') {
        newGrid[startPos.r][startPos.c].type = 'empty';
        newGrid[r][c].type = 'start';
        setStartPos({ r, c });
      } else if (type === 'end') {
        newGrid[endPos.r][endPos.c].type = 'empty';
        newGrid[r][c].type = 'end';
        setEndPos({ r, c });
      } else {
          if (oldType !== 'start' && oldType !== 'end') {
            newGrid[r][c].type = type;
          }
      }
      return newGrid;
    });
  };

  const solve = async () => {
    if (isSolving) return;
    setIsSolving(true);
    solvingRef.current = true;

    const openList: NodeData[] = [];
    const closedList: Set<string> = new Set();
    
    const startNode = { ...grid[startPos.r][startPos.c], distanceFromStart: 0, totalCost: 0 };
    openList.push(startNode);

    const getNeighbors = (node: NodeData) => {
        const neighbors = [];
        const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        for (const [dr, dc] of dirs) {
            const nr = node.row + dr;
            const nc = node.col + dc;
            if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS) {
                neighbors.push(grid[nr][nc]);
            }
        }
        return neighbors;
    };

    while (openList.length > 0 && solvingRef.current) {
        openList.sort((a, b) => a.totalCost - b.totalCost || a.distanceToGoal - b.distanceToGoal);
        const current = openList.shift()!;

        if (current.row === endPos.r && current.col === endPos.c) {
            let temp: NodeData | undefined = current;
            while (temp) {
                const tr = temp.row;
                const tc = temp.col;
                setGrid(prev => {
                    const ng = prev.map(r => [...r]);
                    if (ng[tr][tc].type !== 'start' && ng[tr][tc].type !== 'end') {
                        ng[tr][tc].type = 'path';
                    }
                    return ng;
                });
                temp = temp.parent;
                await new Promise(res => setTimeout(res, 20));
            }
            setIsSolving(false);
            return;
        }

        closedList.add(`${current.row},${current.col}`);

        if (current.type !== 'start' && current.type !== 'end') {
            setGrid(prev => {
                const ng = prev.map(r => [...r]);
                ng[current.row][current.col].type = 'visited';
                return ng;
            });
        }

        for (const neighbor of getNeighbors(current)) {
            const posKey = `${neighbor.row},${neighbor.col}`;
            if (neighbor.type === 'wall' || closedList.has(posKey)) continue;

            const tentativeG = current.distanceFromStart + 1;
            const existingOpen = openList.find(n => n.row === neighbor.row && n.col === neighbor.col);

            if (!existingOpen || tentativeG < neighbor.distanceFromStart) {
                const h = getManhattanDistance(neighbor, grid[endPos.r][endPos.c]);
                const updatedNeighbor = {
                    ...neighbor,
                    distanceFromStart: tentativeG,
                    distanceToGoal: h,
                    totalCost: tentativeG + h,
                    parent: current,
                };

                if (!existingOpen) {
                    openList.push(updatedNeighbor);
                    if (updatedNeighbor.type !== 'end' && updatedNeighbor.type !== 'start') {
                         setGrid(prev => {
                            const ng = prev.map(r => [...r]);
                            ng[neighbor.row][neighbor.col].type = 'frontier';
                            return ng;
                        });
                    }
                } else {
                    const idx = openList.findIndex(n => n.row === neighbor.row && n.col === neighbor.col);
                    openList[idx] = updatedNeighbor;
                }
            }
        }
        await new Promise(res => setTimeout(res, 10));
    }
    
    setIsSolving(false);
  };

  return (
    <div className="flex flex-col items-center select-none" onMouseUp={handleMouseUp}>
      <div className="w-full flex flex-wrap justify-between items-center mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 gap-4">
        <div className="flex gap-4">
          <button 
            onClick={solve} 
            disabled={isSolving}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all"
          >
            <Play size={18} fill="currentColor" /> Найти путь
          </button>
          <button 
            onClick={clearPath}
            disabled={isSolving}
            className="flex items-center gap-2 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold hover:bg-slate-300 transition-all"
          >
            <RotateCcw size={18} /> Сброс
          </button>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
               <div className="w-3 h-3 bg-indigo-500 rounded-sm"></div> Старт
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
               <div className="w-3 h-3 bg-red-500 rounded-sm"></div> Цель
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
               <div className="w-3 h-3 bg-slate-700 rounded-sm"></div> Стена
            </div>
        </div>
      </div>

      <div 
        className="grid gap-px bg-slate-200 border border-slate-200 shadow-inner rounded-sm overflow-hidden"
        style={{ 
          gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
          width: '100%',
          aspectRatio: `${GRID_COLS}/${GRID_ROWS}`
        }}
      >
        {grid.map((row, r) => 
          row.map((node, c) => (
            <div
              key={`${r}-${c}`}
              onMouseDown={() => handleMouseDown(r, c)}
              onMouseEnter={() => handleMouseEnter(r, c)}
              className={`
                aspect-square cursor-crosshair transition-colors duration-150
                ${node.type === 'empty' ? 'bg-white hover:bg-slate-100' : ''}
                ${node.type === 'wall' ? 'bg-slate-800' : ''}
                ${node.type === 'start' ? 'bg-indigo-500 flex items-center justify-center text-white' : ''}
                ${node.type === 'end' ? 'bg-red-500 flex items-center justify-center text-white' : ''}
                ${node.type === 'visited' ? 'bg-indigo-100' : ''}
                ${node.type === 'frontier' ? 'bg-emerald-50' : ''}
                ${node.type === 'path' ? 'bg-emerald-400' : ''}
              `}
            >
               {node.type === 'start' && <MapPin size={12} />}
               {node.type === 'end' && <Target size={12} />}
            </div>
          ))
        )}
      </div>
      
      <div className="mt-4 flex gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-1"><MousePointer2 size={12}/> Зажмите для рисования стен</div>
      </div>
    </div>
  );
};

export default InteractiveGrid;
