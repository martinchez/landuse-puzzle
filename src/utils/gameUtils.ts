import { GameProgress, Badge, LandCoverType } from '../types/game';

export const LAND_COVER_CONFIG = {
  forest: { name: 'Forest', emoji: '🌳', color: 'bg-green-500' },
  water: { name: 'Water', emoji: '💧', color: 'bg-blue-500' },
  urban: { name: 'Urban', emoji: '🏙️', color: 'bg-gray-500' },
  farmland: { name: 'Farmland', emoji: '🌾', color: 'bg-yellow-500' },
  desert: { name: 'Desert', emoji: '🏜️', color: 'bg-orange-500' }
};

export const INITIAL_BADGES: Badge[] = [
  { id: 'forest-guardian', name: 'Forest Guardian', description: 'Classified 10 forest tiles correctly', icon: '🌳', earned: false },
  { id: 'water-watcher', name: 'Water Watcher', description: 'Classified 10 water tiles correctly', icon: '💧', earned: false },
  { id: 'city-planner', name: 'City Planner', description: 'Classified 10 urban tiles correctly', icon: '🏙️', earned: false },
  { id: 'farm-expert', name: 'Farm Expert', description: 'Classified 10 farmland tiles correctly', icon: '🌾', earned: false },
  { id: 'desert-explorer', name: 'Desert Explorer', description: 'Classified 10 desert tiles correctly', icon: '🏜️', earned: false },
  { id: 'perfect-classifier', name: 'Perfect Classifier', description: 'Complete a level with 3 stars', icon: '⭐', earned: false },
  { id: 'master-classifier', name: 'Master Classifier', description: 'Complete all levels', icon: '🏆', earned: false }
];

export const getInitialProgress = (): GameProgress => ({
  unlockedLevels: 1,
  levelStars: {},
  totalStars: 0,
  badges: [...INITIAL_BADGES]
});

export const loadProgress = (): GameProgress => {
  try {
    const saved = localStorage.getItem('landCoverGameProgress');
    return saved ? JSON.parse(saved) : getInitialProgress();
  } catch {
    return getInitialProgress();
  }
};

export const saveProgress = (progress: GameProgress): void => {
  localStorage.setItem('landCoverGameProgress', JSON.stringify(progress));
};

export const calculateStars = (correctAnswers: number, totalTiles: number): number => {
  const percentage = (correctAnswers / totalTiles) * 100;
  if (percentage >= 90) return 3;
  if (percentage >= 70) return 2;
  if (percentage >= 50) return 1;
  return 0;
};

export const playSound = (type: 'success' | 'error' | 'complete') => {
  // Web Audio API implementation for sound effects
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  };

  switch (type) {
    case 'success':
      playTone(523.25, 0.2); // C5
      setTimeout(() => playTone(659.25, 0.3), 100); // E5
      break;
    case 'error':
      playTone(207.65, 0.5); // G#3
      break;
    case 'complete':
      playTone(523.25, 0.2); // C5
      setTimeout(() => playTone(659.25, 0.2), 100); // E5
      setTimeout(() => playTone(783.99, 0.4), 200); // G5
      break;
  }
};