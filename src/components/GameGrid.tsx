// Import necessary dependencies
import React from 'react';
import { GameTile } from './GameTile';
import { Tile, LandCoverType } from '../types/game';

// Define props interface for the GameGrid component
interface GameGridProps {
  tiles: Tile[];           // Array of tiles to display in the grid
  gridSize: number;        // Number of tiles per row/column
  onTileDrop: (tileId: string, labelType: LandCoverType) => void;  // Callback for tile drop events
  showHints: boolean;      // Flag to control hint visibility
}

// GameGrid component: Renders a grid of GameTile components
export const GameGrid: React.FC<GameGridProps> = ({ tiles, gridSize, onTileDrop, showHints }) => {
  return (
    // Grid container with responsive sizing and automatic gap between tiles
    <div 
      className={`grid gap-2 max-w-2xl mx-auto`}
      style={{ 
        gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,  // Create dynamic grid columns based on gridSize
      }}
    >
      {/* Map through tiles array to render individual GameTile components */}
      {tiles.map((tile) => (
        <GameTile
          key={tile.id}
          tile={tile}
          onDrop={onTileDrop}
          showHint={showHints && !tile.assignedLabel}  // Show hints only if enabled and tile has no label
        />
      ))}
    </div>
  );
};