
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

export interface Talent {
  id: string;
  name: string;
  description: string;
  type: TalentType;
  rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
}

export interface Choice {
  text: string;
  type: 'NORMAL' | 'AGGRESSIVE' | 'SAFE' | 'TALENT' | 'STEALTH';
  talentReq?: string; // ID of talent required
  moneyReq?: number;
  // New: Set a flag when this choice is selected
  setFlag?: string; 
  effect: (stats: GameStats) => Partial<GameStats>;
  resultText: string;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  tags: string[]; // WATER, SKY, STEALTH, CITY, etc. determines animation
  // New: Only appear if these conditions are met
  condition?: (stats: GameStats) => boolean; 
  // New: Higher priority events appear first
  priority?: number;
  choices: Choice[];
}

export interface GameStats {
  time: number; // Hours remaining
  money: number; 
  risk: number; // 0-100
  sanity: number; // 0-100
  talents: string[]; 
  // New: Track decisions for chain events (e.g., 'has_ticket', 'met_hacker')
  flags: Record<string, boolean>; 
  // New: Prevent repeating events
  seenEvents: string[]; 
  history: { turn: number; risk: number; money: number; sanity: number }[];
  eventCount: number;
}

export interface StatDeltas {
  money?: number;
  risk?: number;
  sanity?: number;
  time?: number;
}

export interface Ending {
  id: string;
  title: string;
  description: string;
  condition: (stats: GameStats) => boolean;
}
