
export enum GamePhase {
  START = 'START',
  TALENT_SELECT = 'TALENT_SELECT',
  GAME_LOOP = 'GAME_LOOP',
  GAME_OVER = 'GAME_OVER',
  TALENT_INDEX = 'TALENT_INDEX',
}

export enum TalentType {
  SURVIVAL = 'SURVIVAL',
  RESOURCE = 'RESOURCE',
  SOCIAL = 'SOCIAL',
  TIME = 'TIME',
  SKILL = 'SKILL',
  SPECIAL = 'SPECIAL',
}

export type RouteType = 'NONE' | 'A' | 'B' | 'C';

export interface Talent {
  id: string;
  name: string;
  description: string;
  type: TalentType;
  rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
}

export interface Choice {
  text: string;
  type: 'NORMAL' | 'AGGRESSIVE' | 'SAFE' | 'TALENT' | 'STEALTH' | 'SPECIAL' | 'SOCIAL' | 'SURVIVAL';
  talentReq?: string; // ID of talent required
  moneyReq?: number;
  healthCost?: number; // New: Explicit health cost to show on button
  sanityCost?: number; // New: Explicit sanity cost
  setFlag?: string; 
  setRoute?: RouteType;
  effect: (stats: GameStats) => Partial<GameStats>;
  resultText: string;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  tags: string[]; 
  condition?: (stats: GameStats) => boolean; 
  route?: RouteType;
  priority?: number;
  repeatable?: boolean; // New: Allow event to appear multiple times
  choices: Choice[];
}

export interface GameStats {
  time: number; // 72 -> 0
  money: number; 
  risk: number; // 0-100 (Exposure)
  sanity: number; // 0-100
  health: number; // 0-100 (New)
  karma: number; // -100 to 100 (New)
  fans: number; // 0 to Infinity (New)
  
  route: RouteType; // Current Story Arc
  
  talents: string[]; 
  flags: Record<string, boolean>; 
  seenEvents: string[]; 
  history: { turn: number; risk: number; money: number; sanity: number; health: number }[];
  eventCount: number;
}

export interface StatDeltas {
  money?: number;
  risk?: number;
  sanity?: number;
  time?: number;
  health?: number;
  karma?: number;
  fans?: number;
}

export interface Ending {
  id: string;
  title: string;
  description: string;
  condition: (stats: GameStats) => boolean;
}
