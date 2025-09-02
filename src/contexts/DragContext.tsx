import React, { createContext, useContext, useState } from 'react';
import { LandCoverType } from '../types/game';

interface DragContextType {
  isDragging: boolean;
  setIsDragging: (value: boolean) => void;
  currentDragItem: { labelType: LandCoverType } | null;
  setCurrentDragItem: (item: { labelType: LandCoverType } | null) => void;
}

const DragContext = createContext<DragContextType | undefined>(undefined);

export const DragProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [currentDragItem, setCurrentDragItem] = useState<{ labelType: LandCoverType } | null>(null);

  return (
    <DragContext.Provider value={{ isDragging, setIsDragging, currentDragItem, setCurrentDragItem }}>
      {children}
    </DragContext.Provider>
  );
};

export const useDragContext = () => {
  const context = useContext(DragContext);
  if (!context) {
    throw new Error('useDragContext must be used within a DragProvider');
  }
  return context;
};
