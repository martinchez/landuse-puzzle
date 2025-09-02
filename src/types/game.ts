export interface Tile {
  id: string;
  correctLabel: LandCoverType;
  imageUrl: string;
  assignedLabel?: LandCoverType;
}

export interface Level {
  id: number;
  title: string;
  gridSize: number;
  tiles: Tile[];
  availableLabels: LandCoverType[];
  requiredStars: number;
}

export interface LevelStats {
  attempts: number;
  completions: number;
  failedAttempts: number;
  averageScore: number;
  averageTimeSpent: number; // in seconds
}

export interface GameProgress {
  unlockedLevels: number;
  levelStars: { [levelId: number]: number };
  totalStars: number;
  badges: Badge[];
  levelStatistics: { [levelId: number]: LevelStats };
  mostPlayedLevelId?: number;
  mostFailedLevelId?: number;
  mostCompletedLevelId?: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}

export type LandCoverType = 'forest' | 'water' | 'urban' | 'farmland' | 'desert';

export type GameScreen = 'home' | 'levelSelect' | 'game' | 'results' | 'about' | 'statistics';

export interface GameState {
  currentScreen: GameScreen;
  currentLevel: number;
  gameProgress: GameProgress;
}