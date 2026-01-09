
import React, { useState, useEffect } from 'react';
import { 
  Play, Settings, Clock, Heart, Brain, RefreshCw,
  LogOut, X, Zap, Database, Siren, ArrowLeft,
  DollarSign, Eye, Users, Scale
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { GamePhase, GameStats, Talent, GameEvent, Ending, StatDeltas, RouteType } from './types';
import { TALENTS, EVENTS, ENDINGS } from './data';
import { Button, Card, ElBigotes, BossScene, IconButton, ResultCard, Avatar, DanmakuOverlay, CharacterAction } from './components';

// --- GAME CONFIG ---
const INITIAL_STATS: GameStats = {
  time: 72,
  money: 5000000, 
  risk: 10,
  sanity: 100,
  health: 100,
  karma: 0,
  fans: 0,
  route: 'NONE',
  talents: [],
  flags: {}, 
  seenEvents: [],
  history: [{ turn: 0, risk: 10, money: 5000000, sanity: 100, health: 100 }],
  eventCount: 0,
};

const NEWS_TICKER = [
    "突发：总统府遭遇不明原因断电...",
    "市场传闻：以太坊暴跌 20%...",
    "天气预报：热带风暴即将登陆...",
    "热搜第一：'他去哪了？'...",
    "暗网悬赏：前总统行踪价值 $100w...",
];

const formatMoney = (amount: number) => {
  if (Math.abs(amount) >= 10000) return `${(amount / 10000).toFixed(1)}w`;
  return `${amount}`;
};

const formatCount = (amount: number) => {
  if (Math.abs(amount) >= 10000) return `${(amount / 10000).toFixed(1)}w`;
  return `${amount}`;
};

const getRandomElements = <T,>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export default function App() {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.START);
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [availableTalents, setAvailableTalents] = useState<Talent[]>([]);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [lastDeltas, setLastDeltas] = useState<StatDeltas>({}); 
  const [ending, setEnding] = useState<Ending | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [characterAction, setCharacterAction] = useState<CharacterAction>('IDLE'); // New Action State
  const [showSettings, setShowSettings] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);

  // Ticker Effect
  useEffect(() => {
    const timer = setInterval(() => {
        setTickerIndex(prev => (prev + 1) % NEWS_TICKER.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Background Color Logic based on Sanity (Tropical Panic)
  const getAppBackground = () => {
      if (stats.sanity < 20) return 'bg-black'; // Dead
      if (stats.sanity < 50) return 'bg-[#2D3748]'; // Dark Blue Depressing
      return 'bg-pop-blue'; // Bright Pop Blue for better contrast
  };

  const getTextColor = () => {
      if (stats.sanity < 50) return 'text-white';
      return 'text-pop-dark';
  }

  // --- LOGIC (Unchanged) ---
  const startGame = () => {
    setStats(INITIAL_STATS);
    setAvailableTalents(getRandomElements(TALENTS, 3));
    setLastResult(null);
    setLastDeltas({});
    setEnding(null);
    setCharacterAction('IDLE');
    setPhase(GamePhase.TALENT_SELECT);
  };

  const selectTalent = (talent: Talent) => {
    let newStats = { ...stats, talents: [...stats.talents, talent.id] };
    if (talent.id === 'T05') newStats.money = 20000000;
    if (talent.id === 'T18') newStats.money = 10000000; 
    if (talent.id === 'T02') newStats.sanity -= 30;
    if (talent.id === 'T12') newStats.risk = Math.max(0, newStats.risk - 20);

    setStats(newStats);
    setPhase(GamePhase.GAME_LOOP);
    nextEvent(newStats);
  };

  const nextEvent = (currentStats: GameStats) => {
    const matchedEnding = ENDINGS.find(e => e.condition(currentStats));
    if (matchedEnding) {
        setEnding(matchedEnding);
        setPhase(GamePhase.GAME_OVER);
        return;
    }

    const validEvents = EVENTS.filter(e => {
        const condMet = e.condition ? e.condition(currentStats) : true;
        // Logic Update: If repeatable is true, ignore seenEvents check
        const notSeen = e.repeatable || !currentStats.seenEvents.includes(e.id);
        const routeMatch = !e.route || e.route === currentStats.route;
        return condMet && notSeen && routeMatch;
    });

    if (validEvents.length === 0) {
        if (currentStats.time <= 0) {
             setEnding(ENDINGS.find(e => e.id === 'E_SURVIVE')!);
             setPhase(GamePhase.GAME_OVER);
        } else {
             // Use fallback event U01_HUNGRY
             const fallbackEvent = EVENTS.find(e => e.id === 'U01_HUNGRY');
             setCurrentEvent(fallbackEvent || EVENTS[0]); 
        }
        return;
    }

    validEvents.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    const topPriority = validEvents[0].priority || 0;
    const pool = validEvents.filter(e => (e.priority || 0) === topPriority);
    const randomEvent = pool[Math.floor(Math.random() * pool.length)];
    
    setCurrentEvent(randomEvent);
  };

  const handleChoice = (choiceIndex: number) => {
    if (!currentEvent) return;
    const choice = currentEvent.choices[choiceIndex];
    
    const changes = choice.effect(stats);
    
    if (stats.talents.includes('T05')) changes.money = (changes.money || 0) + (stats.money - 100000 - stats.money);
    if (stats.talents.includes('T19')) changes.time = (changes.time || 0) - 0.5;
    if (stats.talents.includes('T08') && changes.money && changes.money < 0) changes.money = Math.floor(changes.money * 0.8);

    const newStats: GameStats = {
      ...stats,
      ...changes,
      eventCount: stats.eventCount + 1,
      flags: choice.setFlag ? { ...stats.flags, [choice.setFlag]: true } : stats.flags,
      route: choice.setRoute || stats.route,
      seenEvents: [...stats.seenEvents, currentEvent.id],
    };
    
    newStats.risk = Math.max(0, Math.min(100, newStats.risk));
    newStats.sanity = Math.max(0, Math.min(100, newStats.sanity));
    newStats.health = Math.max(0, Math.min(100, newStats.health));
    newStats.time = Math.max(0, newStats.time);

    newStats.history = [...stats.history, { 
      turn: newStats.eventCount, 
      risk: newStats.risk, 
      money: newStats.money, 
      sanity: newStats.sanity,
      health: newStats.health
    }];

    const deltas: StatDeltas = {
        money: (newStats.money - stats.money) || 0,
        risk: (newStats.risk - stats.risk) || 0,
        sanity: (newStats.sanity - stats.sanity) || 0,
        health: (newStats.health - stats.health) || 0,
        karma: (newStats.karma - stats.karma) || 0,
        fans: (newStats.fans - stats.fans) || 0,
        time: (newStats.time - stats.time) || 0,
    };

    setStats(newStats);
    setLastResult(choice.resultText);
    setLastDeltas(deltas);
    setIsTransitioning(true);

    // --- DETERMINE CHARACTER REACTION ---
    let nextAction: CharacterAction = 'IDLE';
    
    // Priority 1: Route Change (Visual Costume Switch)
    if (choice.setRoute && choice.setRoute !== stats.route) {
        nextAction = 'SWITCH';
    } 
    // Priority 2: Damage (Negative Health)
    else if (deltas.health && deltas.health < 0) {
        nextAction = 'HURT';
    }
    // Priority 3: Rich (Positive Money)
    else if (deltas.money && deltas.money > 0) {
        nextAction = 'RICH';
    }

    setCharacterAction(nextAction);

    setTimeout(() => {
        setLastResult(null);
        setIsTransitioning(false); 
        setCharacterAction('IDLE'); // Reset action
        nextEvent(newStats);
    }, 1500); 
  };

  // --- RENDER HELPERS ---
  const renderBackgroundSunburst = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vmax] h-[200vmax] animate-spin-slow opacity-10" 
             style={{ 
                 background: 'conic-gradient(from 0deg, #FDF6E3 0deg 15deg, transparent 15deg 30deg)', 
                 backgroundSize: '100% 100%', 
                 backgroundImage: 'repeating-conic-gradient(#fff 0deg 15deg, transparent 15deg 30deg)' 
             }}>
        </div>
    </div>
  );

  return (
    <div className={`
        fixed inset-0 w-full h-full font-sans overflow-hidden transition-colors duration-1000
        ${getAppBackground()} ${getTextColor()}
    `}>
        {/* Background Texture & Effects */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] z-10"></div>
        {phase === GamePhase.START && renderBackgroundSunburst()}
        
        {/* Danmaku for Low Sanity */}
        {stats.sanity < 30 && <DanmakuOverlay />}

        {/* --- MAIN CONTAINER --- */}
        <div className="relative z-20 w-full h-full max-w-md mx-auto flex flex-col shadow-2xl bg-white/10 backdrop-blur-sm border-x-4 border-black">

            {/* SETTINGS MODAL */}
            {showSettings && (
                <div className="absolute inset-0 z-[100] bg-black/80 flex items-center justify-center p-6 animate-fade-in">
                    <Card title="暂停" className="w-full">
                        <div className="space-y-4">
                            <Button onClick={() => { setPhase(GamePhase.START); setShowSettings(false); }} variant="danger" icon={LogOut} fullWidth>放弃治疗</Button>
                            <Button onClick={() => setShowSettings(false)} icon={X} fullWidth>继续跑路</Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* --- START SCREEN (WANTED POSTER) --- */}
            {phase === GamePhase.START && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8 animate-fade-in overflow-y-auto">
                    
                    {/* The Poster */}
                    <div className="relative bg-[#FDF6E3] border-4 border-black p-4 pb-8 shadow-pop-lg rotate-[-2deg] w-full max-w-xs transform hover:rotate-0 transition-transform duration-300">
                        {/* Tape */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-yellow-200/80 rotate-1 transform skew-x-12 z-10"></div>
                        
                        {/* Wanted Header */}
                        <div className="text-center border-b-4 border-black pb-2 mb-4">
                            <h1 className="font-cartoon text-5xl text-pop-red tracking-widest text-shadow-sm">通缉</h1>
                            <div className="font-bold tracking-[0.5em] text-sm">WANTED</div>
                        </div>

                        {/* Character Image */}
                        <div className="bg-pop-blue/20 border-4 border-black p-4 mb-4 relative overflow-hidden h-48 flex items-end justify-center">
                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-noise.png')] opacity-20"></div>
                             <div className="absolute top-2 left-2 flex flex-col gap-1">
                                 <div className="h-0.5 w-full bg-black/20"></div>
                                 <div className="h-0.5 w-full bg-black/20"></div>
                                 <div className="h-0.5 w-full bg-black/20"></div>
                             </div>
                             <ElBigotes route="NONE" health={100} sanity={100} isTransitioning={false} action="IDLE" className="scale-75 origin-bottom" />
                        </div>

                        {/* Name / Title */}
                        <div className="text-center mb-4">
                             <div className="font-cartoon text-4xl text-black leading-none break-words">岛主别跑</div>
                             <div className="text-xs font-bold mt-1 bg-black text-white inline-block px-2 rotate-2">DEAD OR ALIVE</div>
                        </div>
                        
                        {/* Reward */}
                        <div className="flex justify-between items-center font-bold font-mono text-sm border-t-2 border-black pt-2">
                             <span>REWARD:</span>
                             <span className="text-xl">$5,000,000</span>
                        </div>
                    </div>

                    <div className="w-full max-w-xs space-y-4">
                        <Button onClick={startGame} fullWidth icon={Play} variant="primary" className="text-xl py-4 shadow-pop-lg">开始逃亡</Button>
                        <Button onClick={() => setPhase(GamePhase.TALENT_INDEX)} fullWidth variant="secondary" icon={Database}>情报数据库</Button>
                    </div>
                </div>
            )}

            {/* --- TALENT SELECT --- */}
            {phase === GamePhase.TALENT_SELECT && (
                <div className="flex-1 flex flex-col p-4 bg-pop-cream">
                    <header className="mb-4 text-center">
                        <h2 className="text-2xl font-cartoon text-pop-blue">选择你的外挂</h2>
                    </header>
                    <div className="flex-1 overflow-y-auto space-y-3 pb-20">
                        {availableTalents.map((t, i) => (
                            <div key={t.id} onClick={() => selectTalent(t)} className="cursor-pointer group transform transition-all duration-200 hover:scale-[1.02]">
                                <Card className={`!p-3 h-auto min-h-0 hover:bg-yellow-50 group-active:scale-[0.98] ${t.rarity === 'LEGENDARY' ? 'bg-yellow-100' : ''}`} title={t.rarity === 'LEGENDARY' ? '传说' : ''}>
                                    <div className="flex items-start gap-3">
                                        <div className="p-1.5 border-2 border-black bg-pop-blue text-white rounded-lg shrink-0 mt-0.5">
                                            <Zap size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-base text-black mb-0.5">{t.name}</div>
                                            <div className="text-xs opacity-80 font-medium text-gray-700 leading-snug text-justify">{t.description}</div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- TALENT INDEX (Database) --- */}
            {phase === GamePhase.TALENT_INDEX && (
                <div className="flex-1 flex flex-col bg-pop-cream h-full">
                    <div className="p-4 border-b-4 border-black flex justify-between items-center bg-pop-yellow sticky top-0 z-20 shadow-pop">
                        <div className="flex items-center gap-2">
                            <Database size={24} className="text-black" />
                            <h2 className="text-xl font-cartoon text-black">情报数据库</h2>
                        </div>
                        <IconButton icon={ArrowLeft} onClick={() => setPhase(GamePhase.START)} className="bg-white" />
                    </div>
                    {/* Added pb-20 for bottom safe area */}
                    <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 gap-3 pb-20">
                        {TALENTS.map((t) => (
                            <Card key={t.id} className={`${t.rarity === 'LEGENDARY' ? 'bg-yellow-50' : ''} h-fit min-h-0 !p-3`}>
                                <div className="flex gap-3 items-start">
                                    <div className={`p-1.5 border-2 border-black rounded-lg shrink-0 mt-0.5 ${t.rarity === 'LEGENDARY' ? 'bg-pop-yellow' : 'bg-gray-200'}`}>
                                        <Zap size={18} className="text-black" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-base mb-0.5 text-black flex items-center justify-between">
                                            {t.name}
                                            {t.rarity === 'LEGENDARY' && <span className="text-[10px] bg-pop-red text-white px-1 border border-black rotate-3">传说</span>}
                                        </div>
                                        <div className="text-xs text-gray-800 font-medium leading-snug text-balance text-justify">
                                            {t.description}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* --- GAME LOOP --- */}
            {phase === GamePhase.GAME_LOOP && (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    
                    {/* TOP HUD (V4: Compact 2 Rows) */}
                    <div className="bg-white border-b-4 border-black p-3 flex items-center justify-between shadow-pop z-30 sticky top-0">
                        
                        {/* LEFT: Avatar + Day + Time */}
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Avatar health={stats.health} sanity={stats.sanity} />
                                <div className="absolute -bottom-2 -right-2 bg-black text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold border border-white">
                                    D{Math.floor((72 - stats.time)/24) + 1}
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">剩余时间</div>
                                <div className="flex items-center gap-1 text-black">
                                    <Clock size={16} strokeWidth={3} />
                                    <span className="font-cartoon text-xl leading-none">{Math.ceil(stats.time)}h</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* RIGHT: Stats Grid (Compact 3 cols x 2 rows) */}
                        <div className="grid grid-cols-3 gap-x-2 gap-y-2">
                            
                            {/* Row 1: Money, Health, Karma */}
                            <div className="flex flex-col items-end">
                                <div className="flex items-center justify-end gap-1.5 text-pop-green">
                                    <DollarSign size={14} strokeWidth={3} />
                                    <span className="font-bold text-sm leading-none">{formatMoney(stats.money)}</span>
                                </div>
                                <div className="text-[10px] font-bold text-gray-400 mt-0.5">资金</div>
                            </div>

                            <div className="flex flex-col items-end">
                                <div className={`flex items-center justify-end gap-1.5 ${stats.health < 30 ? 'text-pop-red animate-pulse' : 'text-pop-red'}`}>
                                    <Heart size={14} strokeWidth={3} fill={stats.health < 30 ? "currentColor" : "none"} />
                                    <span className="font-bold text-sm leading-none">{stats.health}</span>
                                </div>
                                <div className="text-[10px] font-bold text-gray-400 mt-0.5">健康</div>
                            </div>

                            <div className="flex flex-col items-end">
                                <div className={`flex items-center justify-end gap-1.5 ${stats.karma > 0 ? 'text-pop-green' : stats.karma < 0 ? 'text-pop-red' : 'text-gray-500'}`}>
                                    <Scale size={14} strokeWidth={3} />
                                    <span className="font-bold text-sm leading-none">{stats.karma}</span>
                                </div>
                                <div className="text-[10px] font-bold text-gray-400 mt-0.5">善恶</div>
                            </div>

                            {/* Row 2: Fans, Sanity, Risk */}
                            <div className="flex flex-col items-end">
                                <div className="flex items-center justify-end gap-1.5 text-pop-blue">
                                    <Users size={14} strokeWidth={3} />
                                    <span className="font-bold text-sm leading-none">{formatCount(stats.fans)}</span>
                                </div>
                                <div className="text-[10px] font-bold text-gray-400 mt-0.5">粉丝</div>
                            </div>

                            <div className="flex flex-col items-end">
                                <div className={`flex items-center justify-end gap-1.5 ${stats.sanity < 30 ? 'text-purple-600 animate-pulse' : 'text-pop-blue'}`}>
                                    <Brain size={14} strokeWidth={3} />
                                    <span className="font-bold text-sm leading-none">{stats.sanity}</span>
                                </div>
                                <div className="text-[10px] font-bold text-gray-400 mt-0.5">理智</div>
                            </div>

                            <div className="flex flex-col items-end">
                                <div className={`flex items-center justify-end gap-1.5 ${stats.risk > 50 ? 'text-orange-600' : 'text-orange-500'}`}>
                                    <Eye size={14} strokeWidth={3} />
                                    <span className="font-bold text-sm leading-none">{stats.risk}%</span>
                                </div>
                                <div className="text-[10px] font-bold text-gray-400 mt-0.5">曝光</div>
                            </div>
                        </div>
                    </div>

                    {/* SCENE AREA */}
                    <div className="flex-1 overflow-y-auto p-4 relative z-20 space-y-4">
                        
                        <BossScene 
                            tags={currentEvent?.tags || []} 
                            isTransitioning={isTransitioning} 
                            riskLevel={stats.risk}
                            route={stats.route}
                            sanity={stats.sanity}
                            health={stats.health}
                            action={characterAction}
                        />
                        
                        <div className="space-y-4 min-h-[300px]">
                            {lastResult ? (
                                <ResultCard text={lastResult} deltas={lastDeltas} route={stats.route} />
                            ) : (
                                <div className="animate-fade-in">
                                    <Card className="mb-4 bg-white">
                                        <h3 className="font-cartoon text-2xl mb-2 text-pop-blue">{currentEvent?.title}</h3>
                                        <p className="font-sans text-lg font-medium leading-relaxed text-gray-800">{currentEvent?.description}</p>
                                    </Card>

                                    <div className="space-y-3">
                                        {currentEvent?.choices.map((choice, idx) => {
                                            const locked = (choice.moneyReq && stats.money < choice.moneyReq) || (choice.talentReq && !stats.talents.includes(choice.talentReq));
                                            if (choice.type === 'TALENT' && locked) return null;
                                            
                                            // Map Choice Types to Button Variants
                                            let variant: any = 'secondary';
                                            if (choice.type === 'AGGRESSIVE') variant = 'danger';
                                            if (choice.type === 'SPECIAL') variant = 'special';
                                            if (choice.type === 'TALENT') variant = 'primary';

                                            return (
                                                <Button 
                                                    key={idx} 
                                                    onClick={() => handleChoice(idx)} 
                                                    disabled={locked}
                                                    variant={variant}
                                                    fullWidth
                                                >
                                                    <div className="flex justify-between w-full items-center">
                                                        <span>{choice.text}</span>
                                                        <div className="flex items-center gap-1">
                                                            {choice.healthCost && (
                                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${choice.healthCost > 0 ? 'bg-pop-red text-white' : 'bg-pop-green text-white'}`}>
                                                                    {choice.healthCost > 0 ? '-' : '+'}{Math.abs(choice.healthCost)} HP
                                                                </span>
                                                            )}
                                                            {choice.moneyReq && <span className="text-xs font-bold bg-black text-white px-2 py-0.5 rounded-full">-${choice.moneyReq}</span>}
                                                        </div>
                                                    </div>
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* BOTTOM BAR */}
                    <div className="bg-pop-yellow border-t-4 border-black py-1 px-2 z-30 flex items-center justify-between h-12">
                        <div className="font-cartoon text-black mr-2 text-lg">快讯:</div>
                        <div className="flex-1 overflow-hidden relative h-full flex items-center">
                            <div className="text-sm font-bold whitespace-nowrap marquee">
                                {NEWS_TICKER[tickerIndex]}
                            </div>
                        </div>
                        <IconButton icon={Settings} onClick={() => setShowSettings(true)} className="scale-75 origin-right bg-white" />
                    </div>
                </div>
            )}

            {/* --- GAME OVER --- */}
            {phase === GamePhase.GAME_OVER && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-black/90">
                    <Card title="GAME OVER" className="w-full max-w-md space-y-6 bg-white border-8 border-pop-red">
                        <div className="text-center space-y-4 border-b-4 border-black pb-4">
                            <div className="text-6xl animate-bounce">
                                {ending?.id.includes('SURVIVE') || ending?.id.includes('KING') || ending?.id.includes('SUNRISE') ? '🏆' : '☠️'}
                            </div>
                            <h2 className="font-cartoon text-3xl text-black uppercase">{ending?.title}</h2>
                        </div>
                        
                        <p className="font-sans text-lg text-justify font-bold text-gray-800">
                            {ending?.description}
                        </p>

                        <div className="h-40 bg-gray-100 border-4 border-black p-2 relative">
                             <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.history}>
                                    <Area type="monotone" dataKey="risk" stroke="#EF476F" strokeWidth={3} fill="#EF476F" fillOpacity={0.3} />
                                    <Area type="monotone" dataKey="sanity" stroke="#073B4C" strokeWidth={3} fill="#073B4C" fillOpacity={0.3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <Button onClick={startGame} fullWidth variant="primary" icon={RefreshCw}>再来一局</Button>
                    </Card>
                </div>
            )}

        </div>
    </div>
  );
}
