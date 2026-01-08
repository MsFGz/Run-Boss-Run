
import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Settings, 
  Clock, 
  DollarSign, 
  Brain, 
  RefreshCw,
  TrendingUp,
  MapPin,
  Volume2,
  VolumeX,
  LogOut,
  X,
  Shield,
  Zap,
  Star,
  Users,
  Heart,
  ArrowLeft,
  Siren
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { GamePhase, GameStats, Talent, GameEvent, Ending, TalentType, StatDeltas } from './types';
import { TALENTS, EVENTS, ENDINGS } from './data';
import { Button, Card, GlitchText, BossScene, IconButton, ResultCard } from './components';

// --- GAME CONFIG ---
const INITIAL_STATS: GameStats = {
  time: 72,
  money: 1000000, 
  risk: 0,
  sanity: 100,
  talents: [],
  flags: {}, // Track story decisions
  seenEvents: [], // Track repetition
  history: [{ turn: 0, risk: 0, money: 1000000, sanity: 100 }],
  eventCount: 0,
};

// --- HELPER ---
const getRandomElements = <T,>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Unified Money Format: 1.5w, 5000, etc.
const formatMoney = (amount: number) => {
  if (Math.abs(amount) >= 10000) return `¥${(amount / 10000).toFixed(1)}w`;
  return `¥${amount}`;
};

// --- ICON MAP FOR TALENTS ---
const TalentIcons: Record<TalentType, any> = {
  [TalentType.SURVIVAL]: Heart,
  [TalentType.RESOURCE]: DollarSign,
  [TalentType.SOCIAL]: Users,
  [TalentType.TIME]: Clock,
  [TalentType.SKILL]: Zap,
  [TalentType.SPECIAL]: Star,
};

const TalentTypeCN: Record<TalentType, string> = {
  [TalentType.SURVIVAL]: '生存',
  [TalentType.RESOURCE]: '资源',
  [TalentType.SOCIAL]: '社交',
  [TalentType.TIME]: '时间',
  [TalentType.SKILL]: '技能',
  [TalentType.SPECIAL]: '特殊',
};

export default function App() {
  // State
  const [phase, setPhase] = useState<GamePhase>(GamePhase.START);
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [availableTalents, setAvailableTalents] = useState<Talent[]>([]);
  const [talentRefreshCount, setTalentRefreshCount] = useState(1);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [lastDeltas, setLastDeltas] = useState<StatDeltas>({}); // Store changes
  const [ending, setEnding] = useState<Ending | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false); 

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Initialize Game
  const startGame = () => {
    setStats(INITIAL_STATS);
    setAvailableTalents(getRandomElements(TALENTS, 3));
    setTalentRefreshCount(1);
    setLastResult(null);
    setLastDeltas({});
    setEnding(null);
    setPhase(GamePhase.TALENT_SELECT);
  };

  // Select Talent
  const selectTalent = (talent: Talent) => {
    let newStats = { ...stats, talents: [...stats.talents, talent.id] };
    
    // Apply Immediate Talent Effects
    if (talent.id === 'T02') { // 资源大亨
      newStats.money = 6000000;
      newStats.risk = 20;
    }
    if (talent.id === 'T05') { // 舞王
      newStats.sanity = 120;
    }

    setStats(newStats);
    startLoop(newStats);
  };

  const refreshTalents = () => {
    if (talentRefreshCount > 0) {
      setAvailableTalents(getRandomElements(TALENTS, 3));
      setTalentRefreshCount(0);
    }
  };

  // Start Game Loop
  const startLoop = (currentStats: GameStats) => {
    setPhase(GamePhase.GAME_LOOP);
    nextEvent(currentStats);
  };

  // Pick Next Event Logic (Core Update)
  const nextEvent = (currentStats: GameStats) => {
    // 1. Check Endings
    const matchedEnding = ENDINGS.find(e => e.condition(currentStats));
    if (matchedEnding) {
        setEnding(matchedEnding);
        setPhase(GamePhase.GAME_OVER);
        return;
    }

    // 2. Filter Valid Events
    // - Must satisfy condition (if any)
    // - Must NOT be in seenEvents (unless repeatable, but we default to unique)
    const validEvents = EVENTS.filter(e => {
        const condMet = e.condition ? e.condition(currentStats) : true;
        const notSeen = !currentStats.seenEvents.includes(e.id);
        return condMet && notSeen;
    });

    if (validEvents.length === 0) {
        // Fallback ending if run out of events (shouldn't happen easily)
        setEnding(ENDINGS.find(e => e.id === 'E_WIN')!);
        setPhase(GamePhase.GAME_OVER);
        return;
    }

    // 3. Sort by priority (higher first) then randomize
    validEvents.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    // Simple logic: Pick from top priority pool
    const topPriority = validEvents[0].priority || 0;
    const pool = validEvents.filter(e => (e.priority || 0) === topPriority);
    
    const randomEvent = pool[Math.floor(Math.random() * pool.length)];
    
    setCurrentEvent(randomEvent);
  };

  // Handle Choice
  const handleChoice = (choiceIndex: number) => {
    if (!currentEvent) return;
    const choice = currentEvent.choices[choiceIndex];
    
    // 1. Calculate new stats
    const changes = choice.effect(stats);
    
    // Talent Modifications
    if (stats.talents.includes('T13') && changes.money && changes.money > 0) {
       // 印钞机: 每回合加钱
       changes.money += 100000;
    }
    if (stats.talents.includes('T01') && choice.text.includes('大巴')) {
        // 老司机开大巴必成功逻辑暗示 (Visual feedback only here)
    }

    const newStats: GameStats = {
      ...stats,
      ...changes,
      eventCount: stats.eventCount + 1,
      // Update flags if choice has one
      flags: choice.setFlag ? { ...stats.flags, [choice.setFlag]: true } : stats.flags,
      // Add current event to seen list
      seenEvents: [...stats.seenEvents, currentEvent.id],
    };

    // Bounds
    newStats.risk = Math.max(0, Math.min(100, newStats.risk));
    newStats.sanity = Math.max(0, Math.min(100, newStats.sanity));
    newStats.time = Math.max(0, newStats.time);

    newStats.history = [...stats.history, { 
      turn: newStats.eventCount, 
      risk: newStats.risk, 
      money: newStats.money,
      sanity: newStats.sanity
    }];

    // CALCULATE DELTAS FOR UI
    const deltas: StatDeltas = {
        money: (newStats.money - stats.money) || 0,
        risk: (newStats.risk - stats.risk) || 0,
        sanity: (newStats.sanity - stats.sanity) || 0,
        time: (newStats.time - stats.time) || 0,
    };

    setStats(newStats);
    setLastResult(choice.resultText);
    setLastDeltas(deltas);
    
    // 2. Trigger Transition Animation (Run!)
    setIsTransitioning(true);

    // 3. Wait for animation
    setTimeout(() => {
        setLastResult(null);
        setIsTransitioning(false); 
        nextEvent(newStats);
    }, 3500); 
  };

  // --- RENDERERS ---
  
  // --- SETTINGS MODAL ---
  const SettingsModal = () => {
    if (!showSettings) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <Card className="w-full max-w-sm bg-white shadow-hard" title="系统设置">
           <div className="flex flex-col gap-6 mt-2">
              <div className="flex justify-between items-center border-b-2 border-black pb-4">
                  <div className="flex flex-col">
                      <span className="font-black text-lg">游戏音效</span>
                      <span className="text-xs text-gray-500 font-mono">Audio & SFX</span>
                  </div>
                  <button onClick={() => setAudioEnabled(!audioEnabled)} className={`flex items-center gap-2 font-mono font-bold border-2 border-black px-3 py-2 shadow-hard-sm ${audioEnabled ? 'bg-neo-yellow' : 'bg-gray-200'}`}>
                      {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                      {audioEnabled ? "开启" : "静音"}
                  </button>
              </div>
              <div className="flex justify-between items-center border-b-2 border-black pb-4">
                  <div className="flex flex-col">
                      <span className="font-black text-lg">游戏进度</span>
                      <span className="text-xs text-gray-500 font-mono">当前存档</span>
                  </div>
                  {phase !== GamePhase.START ? (
                       <button onClick={() => { setPhase(GamePhase.START); setShowSettings(false); }} className="flex items-center gap-2 font-bold text-white bg-neo-action border-2 border-black px-3 py-2 shadow-hard-sm hover:translate-x-1">
                          <LogOut size={18} /> 放弃逃亡
                       </button>
                  ) : (<span className="text-gray-400 font-mono text-sm bg-gray-100 px-2 py-1 border border-gray-300">未开始</span>)}
              </div>
               <Button onClick={() => setShowSettings(false)} fullWidth variant="primary" icon={X}>返回游戏</Button>
           </div>
        </Card>
      </div>
    );
  }

  if (phase === GamePhase.GAME_LOOP) {
    return (
      <div className="h-screen w-full flex flex-col relative bg-neo-bg overflow-hidden text-neo-black animate-in fade-in duration-500">
        <SettingsModal />
        
        {/* SETTINGS BUTTON (Floating) */}
        <div className="absolute top-[88px] right-2 z-40 animate-pop-in">
            <IconButton icon={Settings} onClick={() => setShowSettings(true)} variant="primary" />
        </div>

        {/* RISK VIGNETTE - Intensified */}
        <div 
            className="vignette-risk" 
            style={{ 
                boxShadow: `inset 0 0 ${stats.risk * 5}px ${stats.risk > 70 ? 'rgba(255,0,0,0.8)' : 'rgba(255,0,0,0.2)'}`,
                opacity: stats.risk > 50 ? 1 : 0.5
            }}
        />

        {/* STATUS BAR - Updated for Exposure */}
        <div className="grid grid-cols-3 border-b-4 border-black bg-white z-30 shadow-hard-sm sticky top-0">
            {/* TIME */}
            <div className="p-2 border-r-4 border-black flex flex-col items-center justify-center bg-white">
                <div className="flex items-center gap-1 text-neo-action font-black text-xl">
                    <Clock size={20} strokeWidth={3} />
                    <span>{stats.time}h</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">剩余时间</span>
            </div>
            
            {/* EXPOSURE (RISK) - Replaces Money in center for emphasis */}
            <div className={`p-2 border-r-4 border-black flex flex-col items-center justify-center transition-colors duration-500 ${stats.risk > 80 ? 'bg-red-100' : 'bg-white'}`}>
                <div className={`flex items-center gap-1 font-black text-xl ${stats.risk > 80 ? 'text-red-600 animate-pulse' : stats.risk > 50 ? 'text-orange-500' : 'text-gray-800'}`}>
                    <Siren size={20} strokeWidth={3} />
                    <span>{stats.risk}%</span>
                </div>
                 <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">被通缉度</span>
            </div>

            {/* MONEY & SANITY */}
            <div className="p-2 flex flex-col items-center justify-center bg-white relative overflow-hidden">
                 <div className="flex flex-col items-end w-full px-2">
                     <div className="flex items-center gap-1 text-[#228B22] font-black text-sm">
                        {/* DollarSign removed to avoid duplicate currency symbol */}
                        <span>{formatMoney(stats.money)}</span>
                     </div>
                     <div className="flex items-center gap-1 text-neo-special font-black text-sm">
                        <Brain size={14} strokeWidth={3} />
                        <span>{stats.sanity}</span>
                     </div>
                 </div>
                 {/* Sanity Bar */}
                 <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
                    <div className="h-full bg-neo-special transition-all duration-500" style={{ width: `${stats.sanity}%` }}></div>
                 </div>
            </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 p-5 flex flex-col relative z-20 overflow-y-auto">
            
            {/* SCENE (BOSS RUN) */}
            <div className="animate-pop-in">
                <BossScene tags={currentEvent?.tags || []} isTransitioning={isTransitioning} riskLevel={stats.risk} />
            </div>

            {lastResult ? (
                <ResultCard text={lastResult} deltas={lastDeltas} />
            ) : (
                <>
                    {/* TEXT */}
                    <div className="mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
                        <div className="inline-block bg-neo-yellow border-2 border-black px-3 py-1 mb-3 transform -skew-x-12 shadow-sm">
                            <h3 className="font-black text-lg uppercase transform skew-x-12 break-words">
                                {currentEvent?.title}
                            </h3>
                        </div>
                        <div className="bg-white border-2 border-black p-4 shadow-hard-sm">
                            <p className="font-sans text-lg font-bold leading-relaxed text-gray-900 break-words">
                                {currentEvent?.description}
                            </p>
                        </div>
                    </div>

                    {/* CHOICES */}
                    <div className="flex flex-col gap-3 mt-auto pb-4">
                        {currentEvent?.choices.map((choice, idx) => {
                            const hasMoney = !choice.moneyReq || stats.money >= choice.moneyReq;
                            const hasTalent = !choice.talentReq || stats.talents.includes(choice.talentReq);
                            const isLocked = !hasMoney || !hasTalent;

                            if (!hasTalent && choice.type === 'TALENT') return null;

                            return (
                                <div key={idx} className="animate-slide-up" style={{ animationDelay: `${200 + idx * 100}ms` }}>
                                    <Button 
                                        onClick={() => handleChoice(idx)}
                                        disabled={isLocked}
                                        variant={choice.type === 'AGGRESSIVE' ? 'danger' : (choice.type === 'SAFE' || choice.type === 'STEALTH') ? 'secondary' : choice.type === 'TALENT' ? 'special' : 'primary'}
                                        className={`text-left justify-between items-center ${isLocked ? 'grayscale opacity-70' : ''}`}
                                    >
                                        <div className="flex flex-col items-start w-full">
                                            <span className="text-base font-black tracking-wide break-words w-full">{choice.text}</span>
                                            {choice.moneyReq && <span className="text-xs font-mono font-bold opacity-80 mt-1 bg-black/10 px-1">花费: {formatMoney(choice.moneyReq)}</span>}
                                        </div>
                                        {isLocked && !hasMoney && <span className="text-xs bg-red-600 text-white px-2 py-1 font-bold border border-black shrink-0 ml-2">资金不足</span>}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
      </div>
    );
  }

  if (phase === GamePhase.START) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-6 relative overflow-hidden bg-neo-bg">
        <SettingsModal />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neo-yellow/10 to-transparent h-[200%] w-full animate-scan pointer-events-none"></div>
        <div className="z-10 flex flex-col items-center gap-8 max-w-md w-full animate-pop-in">
            <div className="border-8 border-black p-6 bg-white shadow-hard relative group">
                 <div className="absolute -top-4 -right-4 bg-neo-action text-white px-2 font-bold transform rotate-12 border-2 border-black shadow-sm group-hover:rotate-0 transition-transform">Wanted</div>
                 <GlitchText text="岛主别跑" size="xl" />
                 <div className="text-center font-black text-2xl mt-2 tracking-widest bg-black text-white p-1">最后72小时</div>
            </div>
            <div className="w-full space-y-4">
              <Button onClick={startGame} fullWidth variant="primary" icon={Play}>开始逃亡</Button>
              <Button onClick={() => setPhase(GamePhase.TALENT_INDEX)} fullWidth variant="secondary" icon={Brain}>天赋图鉴</Button>
              <Button onClick={() => setShowSettings(true)} fullWidth variant="secondary" icon={Settings}>游戏设置</Button>
            </div>
            <div className="mt-8 text-xs font-mono text-gray-500 text-center bg-white p-2 border-2 border-black shadow-sm">
              专机被扣？火星人约架？<br/> 魔幻现实主义 Roguelike 策略
            </div>
        </div>
      </div>
    );
  }

  if (phase === GamePhase.TALENT_INDEX) {
    return (
      <div className="h-screen w-full bg-neo-bg flex flex-col">
        <div className="p-4 border-b-4 border-black bg-white flex justify-between items-center shadow-hard-sm z-20 sticky top-0">
           <div className="flex items-center gap-3">
               <div className="bg-neo-yellow p-2 border-2 border-black"><Brain size={24} /></div>
               <h2 className="text-2xl font-black italic">天赋图鉴</h2>
           </div>
           <IconButton icon={ArrowLeft} onClick={() => setPhase(GamePhase.START)} />
        </div>
        <div className="flex-1 overflow-y-auto p-4 animate-slide-up z-10">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-10">
              {TALENTS.map((t) => {
                  const Icon = TalentIcons[t.type] || Star;
                  return (
                      <Card key={t.id} className="transform transition-transform hover:-translate-y-1" title={t.rarity === 'LEGENDARY' ? '传说' : t.rarity === 'RARE' ? '稀有' : '普通'}>
                          <div className="flex items-start gap-4">
                              <div className={`p-3 border-2 border-black shadow-hard-sm flex-shrink-0 text-black ${t.rarity === 'LEGENDARY' ? 'bg-neo-yellow' : t.rarity === 'RARE' ? 'bg-neo-safe' : 'bg-gray-300'}`}>
                                  <Icon size={28} strokeWidth={2.5} />
                              </div>
                              <div>
                                  <div className="font-black text-xl mb-1">{t.name}</div>
                                  <div className="text-xs font-mono mb-2 text-gray-500 border border-gray-300 inline-block px-1 bg-gray-50">{TalentTypeCN[t.type]}</div>
                                  <p className="text-sm font-bold text-gray-800 leading-tight">{t.description}</p>
                              </div>
                          </div>
                      </Card>
                  )
              })}
           </div>
           <div className="text-center text-gray-400 font-mono text-xs mt-4 pb-4">--- 底库数据加载完毕 ---</div>
        </div>
      </div>
    )
  }

  if (phase === GamePhase.TALENT_SELECT) {
    return (
      <div className="min-h-screen w-full p-4 flex flex-col bg-neo-bg">
        <SettingsModal />
        <div className="flex justify-between items-start mb-6 animate-slide-up">
            <h2 className="text-3xl font-black border-b-8 border-black inline-block bg-neo-yellow px-2">选择天赋</h2>
            <IconButton icon={Settings} onClick={() => setShowSettings(true)} />
        </div>
        <div className="flex-1 flex flex-col gap-5 overflow-y-auto pb-20">
          {availableTalents.map((t, i) => {
            const Icon = TalentIcons[t.type] || Star;
            return (
                <div key={t.id} className="animate-pop-in" style={{ animationDelay: `${i * 100}ms` }}>
                    <Card className="cursor-pointer hover:scale-[1.02] transition-transform active:scale-95 group" title={t.rarity === 'LEGENDARY' ? '传说' : t.rarity === 'RARE' ? '稀有' : '普通'}>
                        <div onClick={() => selectTalent(t)} className="flex gap-4 items-center">
                            <div className={`p-3 border-2 border-black rounded-full shadow-hard-sm group-hover:bg-black group-hover:text-white transition-colors text-black ${t.rarity === 'LEGENDARY' ? 'bg-neo-yellow' : t.rarity === 'RARE' ? 'bg-neo-safe' : 'bg-gray-300'}`}>
                                <Icon size={24} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1"><span className="font-black text-xl">{t.name}</span></div>
                                <p className="font-sans font-medium text-base leading-relaxed text-gray-800">{t.description}</p>
                            </div>
                        </div>
                    </Card>
                </div>
            )
          })}
        </div>
        {talentRefreshCount > 0 && (
             <Button onClick={refreshTalents} variant="secondary" icon={RefreshCw} className="mt-4 shadow-hard animate-pop-in" style={{ animationDelay: '300ms' }}>刷新天赋 ({talentRefreshCount})</Button>
        )}
      </div>
    );
  }

  if (phase === GamePhase.GAME_OVER) {
    return (
      <div className="min-h-screen w-full bg-neo-bg p-4 flex flex-col items-center justify-center animate-in fade-in duration-700">
         <SettingsModal />
         <div className="absolute top-4 right-4 z-50">
             <IconButton icon={Settings} onClick={() => setShowSettings(true)} />
         </div>
         <Card className="w-full max-w-md mb-6 bg-white shadow-hard animate-slide-up">
            <div className="text-center border-b-4 border-black pb-4 mb-4 bg-stripes">
                <GlitchText text={ending?.title || "游戏结束"} size="lg" color={stats.time <= 0 && ending?.id === 'E_WIN' ? "text-neo-safe" : "text-neo-action"} />
            </div>
            <p className="font-sans font-bold text-lg text-justify mb-6 px-2 leading-relaxed">{ending?.description}</p>
            <div className="h-40 w-full bg-white border-2 border-black p-2 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.history}>
                         <XAxis dataKey="turn" hide />
                         <YAxis hide domain={[0, 100]} />
                         <Tooltip labelStyle={{color: 'black'}} itemStyle={{color: 'black'}} />
                         <Area type="monotone" dataKey="risk" stroke="#FF4500" fill="#FF4500" fillOpacity={0.3} strokeWidth={3} />
                         <Area type="monotone" dataKey="sanity" stroke="#9370DB" fill="#9370DB" fillOpacity={0.3} strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
                <div className="flex justify-between px-2 text-xs font-bold mt-1 uppercase">
                    <span className="text-neo-action">被通缉度 (红)</span>
                    <span className="text-neo-special">理智 (紫)</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 font-mono text-sm border-t-4 border-black pt-4">
                <div className="bg-neo-bg p-2 border border-black text-center">
                    <div className="text-xs text-gray-500">剩余资金</div>
                    <div className="font-black text-lg">{formatMoney(stats.money)}</div>
                </div>
                <div className="bg-neo-bg p-2 border border-black text-center">
                    <div className="text-xs text-gray-500">存活时间</div>
                    <div className="font-black text-lg">{72 - Math.max(0, stats.time)} 小时</div>
                </div>
            </div>
         </Card>
         <Button onClick={startGame} variant="primary" icon={RefreshCw} fullWidth className="animate-pop-in" style={{ animationDelay: '500ms' }}>再次挑战</Button>
      </div>
    );
  }
  return null;
}
