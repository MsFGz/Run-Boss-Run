
import React, { useState, useEffect } from 'react';
import { 
  LucideIcon, 
  Sun
} from 'lucide-react';
import { StatDeltas, RouteType } from './types';

// --- TAG TRANSLATIONS ---
const TAG_CN: Record<string, string> = {
  CITY: '城市', DANGER: '危机', DIGITAL: '数字', SOCIAL: '社交',
  SCAM: '诈骗', FOOD: '补给', RESOURCE: '资源', SKY: '天空',
  HUMAN: '人性', MECH: '机械', MONEY: '财富', SURVIVAL: '生存',
  NATURE: '自然', DARK: '黑暗', MYSTERY: '神秘', TIME: '时间'
};

// --- POP BUTTON (Skeuomorphic / Cartoon) ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'special';
  icon?: LucideIcon;
  fullWidth?: boolean;
  route?: RouteType;
  sanity?: number;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', icon: Icon, fullWidth, className, route = 'NONE', sanity = 100, ...props 
}) => {
  
  let bgClass = 'bg-white';
  let textClass = 'text-black';
  
  if (variant === 'primary') bgClass = 'bg-pop-yellow hover:bg-yellow-300';
  if (variant === 'secondary') bgClass = 'bg-white hover:bg-gray-50';
  if (variant === 'danger') bgClass = 'bg-pop-red text-white hover:bg-red-500';
  if (variant === 'special') bgClass = 'bg-pop-blue text-white hover:bg-blue-500';

  const [isPressed, setIsPressed] = useState(false);

  return (
    <button 
      className={`
        relative group font-rounded text-lg border-4 border-black transition-all duration-75
        ${fullWidth ? 'w-full' : ''} 
        px-4 py-3 flex items-center justify-between gap-3
        ${bgClass} ${textClass}
        ${isPressed ? 'translate-x-[4px] translate-y-[4px] shadow-none' : 'shadow-pop'}
        ${props.disabled ? 'opacity-50 cursor-not-allowed filter grayscale' : 'cursor-pointer'}
        rounded-lg
        ${className || ''}
      `}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      {...props}
    >
      <div className="flex items-center gap-3 text-left w-full">
        {Icon && <div className="p-1 border-2 border-black bg-white/50 rounded-md shrink-0"><Icon size={20} className="text-black" /></div>}
        <span className="font-bold flex-1 leading-tight">{children}</span>
      </div>
    </button>
  );
};

// --- ICON BUTTON ---
export const IconButton: React.FC<any> = ({ icon: Icon, onClick, className }) => {
  const [isPressed, setIsPressed] = useState(false);
  return (
    <button 
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)} 
      className={`
        p-2 border-4 border-black bg-white text-black transition-all duration-75
        ${isPressed ? 'translate-x-[2px] translate-y-[2px] shadow-none' : 'shadow-pop-sm'}
        rounded-lg
        ${className}
      `}>
      <Icon size={24} strokeWidth={3} />
    </button>
  );
};

// --- POP CARD ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string; route?: RouteType }> = ({ children, className, title, route = 'NONE' }) => {
  return (
    <div className={`relative bg-white border-4 border-black p-5 shadow-pop-lg rounded-xl ${className || ''}`}>
      {/* 纸张纹理效果 */}
      <div className="absolute inset-0 opacity-10 pointer-events-none rounded-xl bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>
      
      {title && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-pop-red text-white px-3 py-0.5 border-4 border-black font-cartoon text-lg tracking-wider rotate-[-2deg] z-20 whitespace-nowrap shadow-sm rounded-md">
          {title}
        </div>
      )}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
};

// --- EL BIGOTES CHARACTER (V5.0 Reactive) ---
export type CharacterAction = 'IDLE' | 'HURT' | 'RICH' | 'SWITCH';

export const ElBigotes: React.FC<{ 
    route: RouteType; 
    sanity: number; 
    health: number; 
    action: CharacterAction; // New prop for transient animations
    className?: string;
    isTransitioning?: boolean;
}> = ({ route, sanity, health, action, className, isTransitioning }) => {
    
    const [blink, setBlink] = useState(false);

    useEffect(() => {
        const blinkInterval = setInterval(() => {
            setBlink(true);
            setTimeout(() => setBlink(false), 200);
        }, 3000 + Math.random() * 2000); 
        return () => clearInterval(blinkInterval);
    }, []);

    // Expressions
    const isStressed = health < 50 || sanity < 50;
    const isCritical = health < 20 || sanity < 20;
    
    // Action States
    const isHurt = action === 'HURT';
    const isRich = action === 'RICH';
    const isSwitching = action === 'SWITCH';

    // Animations
    const shakeClass = isCritical || isHurt ? 'animate-shake' : '';
    const breathingStyle = isSwitching ? {} : { animation: 'breathe 4s ease-in-out infinite' };

    return (
        <div className={`relative w-40 h-48 ${shakeClass} ${className || ''}`} style={breathingStyle}>
            <style>{`
                @keyframes breathe {
                    0%, 100% { transform: scaleY(1) translateY(0); }
                    50% { transform: scaleY(1.02) translateY(-2px); }
                }
                @keyframes poof {
                    0% { transform: scale(0); opacity: 1; }
                    50% { opacity: 1; }
                    100% { transform: scale(2); opacity: 0; }
                }
            `}</style>
            
            {/* SMOKE POOF EFFECT (For Switch/Costume Change) */}
            {isSwitching && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 z-50 pointer-events-none">
                     <div className="absolute inset-0 bg-white rounded-full animate-[poof_0.6s_ease-out_forwards]"></div>
                     <div className="absolute top-0 left-0 w-20 h-20 bg-gray-200 rounded-full animate-[poof_0.5s_ease-out_0.1s_forwards]"></div>
                     <div className="absolute bottom-0 right-0 w-24 h-24 bg-gray-100 rounded-full animate-[poof_0.7s_ease-out_0.05s_forwards]"></div>
                     <div className="absolute top-0 right-0 text-4xl animate-bounce" style={{animationDuration: '0.3s'}}>💨</div>
                </div>
            )}

            {/* --- HEAD --- */}
            <div className={`
                absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#e0ac69] border-4 border-black rounded-full z-20 flex flex-col items-center shadow-md
                ${isSwitching ? 'scale-0' : 'scale-100'} transition-transform duration-300
            `} style={{ boxShadow: 'inset -5px -5px 0px rgba(0,0,0,0.1)' }}>
                
                {/* Hair - Tight black hair */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-[105%] h-16 bg-black rounded-t-full z-10 clip-path-hair" style={{ clipPath: 'ellipse(100% 100% at 50% 100%)' }}></div>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[90%] h-12 bg-black rounded-t-full z-10"></div>

                {/* Ears */}
                <div className="absolute top-14 -left-3 w-4 h-7 bg-[#e0ac69] border-4 border-black rounded-l-md z-0"></div>
                <div className="absolute top-14 -right-3 w-4 h-7 bg-[#e0ac69] border-4 border-black rounded-r-md z-0"></div>

                {/* Sweat Drops (Stressed) */}
                {isStressed && (
                    <div className="absolute top-10 right-2 text-blue-400 font-bold text-xl animate-pulse z-30">💦</div>
                )}

                {/* Eyebrows */}
                <div className="absolute top-10 w-full px-4 flex justify-between z-30 pointer-events-none mt-1">
                    <div className={`w-8 h-2.5 bg-black rounded-full transition-transform duration-500 ${isStressed || isHurt ? 'rotate-[20deg] translate-y-1' : 'rotate-0'}`}></div>
                    <div className={`w-8 h-2.5 bg-black rounded-full transition-transform duration-500 ${isStressed || isHurt ? '-rotate-[20deg] translate-y-1' : 'rotate-0'}`}></div>
                </div>

                {/* Eyes */}
                <div className="flex gap-2 mt-14 relative z-20">
                    {/* Reacting Eyes Logic */}
                    {isHurt ? (
                        <>
                            <div className="w-9 h-9 bg-white border-4 border-black rounded-full flex items-center justify-center font-bold text-lg">X</div>
                            <div className="w-9 h-9 bg-white border-4 border-black rounded-full flex items-center justify-center font-bold text-lg">X</div>
                        </>
                    ) : isRich ? (
                        <>
                            <div className="w-9 h-9 bg-green-100 border-4 border-black rounded-full flex items-center justify-center font-bold text-green-700">$</div>
                            <div className="w-9 h-9 bg-green-100 border-4 border-black rounded-full flex items-center justify-center font-bold text-green-700">$</div>
                        </>
                    ) : (
                        // Normal Eyes
                        <>
                            <div className={`w-9 h-9 bg-white border-4 border-black rounded-full relative overflow-hidden ${isCritical ? 'bg-red-100' : ''}`}>
                                <div className={`absolute top-0 w-full bg-[#d49e5d] border-b-4 border-black z-20 transition-all duration-300 ${blink ? 'h-full' : isStressed ? 'h-1' : 'h-4'}`}></div>
                                <div className={`w-3 h-3 bg-black rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${isCritical ? 'animate-ping' : ''}`}></div>
                            </div>
                            <div className={`w-9 h-9 bg-white border-4 border-black rounded-full relative overflow-hidden ${isCritical ? 'bg-red-100' : ''}`}>
                                <div className={`absolute top-0 w-full bg-[#d49e5d] border-b-4 border-black z-20 transition-all duration-300 ${blink ? 'h-full' : isStressed ? 'h-1' : 'h-4'}`}></div>
                                <div className={`w-3 h-3 bg-black rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${isCritical ? 'animate-ping' : ''}`}></div>
                            </div>
                        </>
                    )}
                </div>

                {/* Nose */}
                <div className="w-4 h-2 rounded-full border-b-4 border-black/20 mt-1"></div>

                {/* Mustache */}
                <div className={`relative z-30 mt-[-2px] ${isStressed || isHurt ? 'animate-shake' : ''}`}>
                   <div className="w-24 h-14 bg-black rounded-[40%] absolute left-1/2 -translate-x-1/2 -top-1"></div>
                </div>
                
                {/* Hurt Band-aid */}
                {isHurt && (
                    <div className="absolute top-16 left-2 w-8 h-3 bg-[#e8beac] border-2 border-black rotate-45 z-40 opacity-90 shadow-sm flex items-center justify-center">
                        <div className="w-1 h-1 bg-black/20 rounded-full mx-0.5"></div>
                        <div className="w-1 h-1 bg-black/20 rounded-full mx-0.5"></div>
                    </div>
                )}

                {/* Accessories based on Route */}
                {route === 'A' && (
                     <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-12 bg-red-600 border-4 border-black rounded-t-full skew-x-2 z-40 shadow-md flex items-end justify-center pb-1">
                         <div className="text-white font-bold text-[10px] tracking-tighter">VENCEREMOS</div>
                     </div>
                )}
                {route === 'B' && (
                    <div className="absolute -top-6 w-36 h-14 bg-[#4A5D23] border-4 border-black rounded-tl-full rounded-br-full -rotate-3 z-40 flex items-center justify-center shadow-md">
                        <div className="w-full h-1 bg-black/20 absolute"></div>
                        <div className="w-1 h-full bg-black/20 absolute"></div>
                    </div>
                )}
                {route === 'C' && (
                    <div className="absolute -top-8 w-36 h-16 bg-[#1a202c] border-4 border-black z-40 flex flex-col items-center shadow-md rounded-sm">
                        <div className="w-full h-3 bg-red-600 mt-10 border-y-2 border-black"></div>
                        <div className="w-10 h-10 rounded-full bg-yellow-500 border-2 border-black absolute -top-4 shadow-sm flex items-center justify-center text-xs">⭐</div>
                    </div>
                )}
            </div>

            {/* --- BODY --- */}
            <div className={`
                absolute top-28 left-1/2 -translate-x-1/2 w-36 h-24 bg-white border-4 border-black rounded-[2rem] z-10 flex flex-col overflow-hidden shadow-pop-sm
                ${isSwitching ? 'scale-0' : 'scale-100'} transition-transform duration-300 delay-75
            `} style={{ boxShadow: 'inset -10px 0px 0px rgba(0,0,0,0.1)' }}>
                
                {/* ROUTE A: Tracksuit (Venezuelan Flag Colors) */}
                {route === 'A' && (
                    <div className="w-full h-full flex flex-col bg-[#00247D] relative">
                         {/* Collar */}
                         <div className="w-full h-6 bg-transparent border-b-4 border-black relative z-10"></div>
                         <div className="absolute top-0 w-full h-full flex flex-col">
                             <div className="flex-1 bg-yellow-400 border-b-4 border-black"></div>
                             <div className="flex-1 bg-blue-600 border-b-4 border-black flex justify-center items-center">
                                 <div className="flex gap-1">
                                     <div className="w-1 h-1 bg-white rounded-full"></div>
                                     <div className="w-1 h-1 bg-white rounded-full"></div>
                                     <div className="w-1 h-1 bg-white rounded-full"></div>
                                     <div className="w-1 h-1 bg-white rounded-full"></div>
                                 </div>
                             </div>
                             <div className="flex-1 bg-red-600"></div>
                         </div>
                         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-full bg-black/10 border-x-2 border-black/10"></div>
                    </div>
                )}

                {/* ROUTE B: Dirty Shirt / Guayabera */}
                {route === 'B' && (
                    <div className="w-full h-full bg-[#E5E5E5] relative">
                        {/* Stains */}
                        <div className="absolute top-4 left-4 w-6 h-6 bg-[#8D6E63] rounded-full opacity-60 filter blur-sm"></div>
                        <div className="absolute bottom-2 right-6 w-8 h-8 bg-[#8D6E63] rounded-full opacity-60 filter blur-sm"></div>
                        {/* Buttons */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col gap-4 pt-2">
                             <div className="w-2 h-2 bg-black rounded-full opacity-50"></div>
                             <div className="w-2 h-2 bg-black rounded-full opacity-50"></div>
                        </div>
                    </div>
                )}

                {/* ROUTE C: Dictator Uniform */}
                {route === 'C' && (
                    <div className="w-full h-full bg-[#1F2937] relative flex flex-col items-center">
                        {/* Sash */}
                        <div className="absolute top-0 right-0 w-12 h-full bg-gradient-to-r from-yellow-400 via-blue-500 to-red-600 border-l-4 border-black transform -skew-x-12 origin-top shadow-md z-10 opacity-90"></div>
                        {/* Medals */}
                        <div className="absolute top-8 left-4 flex flex-wrap w-16 gap-1">
                            <div className="w-4 h-2 bg-yellow-400 border border-black"></div>
                            <div className="w-4 h-2 bg-red-500 border border-black"></div>
                            <div className="w-4 h-2 bg-white border border-black"></div>
                            <div className="w-4 h-2 bg-green-600 border border-black"></div>
                        </div>
                    </div>
                )}
                
                {/* Default/Start: Bus Driver Shirt (Dark with red stripe) */}
                {route === 'NONE' && (
                    <div className="w-full h-full bg-[#1e293b] flex flex-col items-center relative">
                        <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-[#d49e5d] mt-0 z-10"></div>
                        {/* Red Stripe */}
                        <div className="w-8 h-full bg-red-700 absolute top-0 z-0 border-x-2 border-black/30"></div>
                        {/* Pocket */}
                        <div className="absolute top-8 left-4 w-8 h-1 bg-black/30 rounded-full border border-black/20"></div>
                        {/* ID Badge */}
                        <div className="absolute top-8 right-4 w-6 h-8 bg-white border border-black -rotate-6 opacity-80 shadow-sm flex flex-col items-center p-0.5">
                            <div className="w-4 h-4 bg-gray-300 rounded-sm mb-0.5"></div>
                            <div className="w-4 h-0.5 bg-black/50"></div>
                        </div>
                    </div>
                )}
            </div>

            {/* --- ARMS --- */}
            <div className={`
                absolute top-36 -left-2 w-12 h-20 bg-[#e0ac69] border-4 border-black rounded-b-full origin-top -rotate-6 z-0 shadow-sm
                ${isSwitching ? 'scale-0' : 'scale-100'} transition-transform duration-300
            `}></div>
            <div className={`
                absolute top-36 -right-2 w-12 h-20 bg-[#e0ac69] border-4 border-black rounded-b-full origin-top rotate-6 z-0 shadow-sm
                ${isSwitching ? 'scale-0' : 'scale-100'} transition-transform duration-300
            `}></div>
            
            {/* Hand item for Route A */}
            {route === 'A' && (
                <div className="absolute top-44 -left-6 text-4xl -rotate-12 z-20 drop-shadow-md">🕊️</div>
            )}
        </div>
    );
};

// --- AVATAR (HUD) ---
export const Avatar: React.FC<{ health: number; sanity: number }> = ({ health, sanity }) => {
    let emoji = "😎"; // High health
    let bg = "bg-pop-green";
    
    if (health < 50 || sanity < 50) {
        emoji = "😰"; // Mid
        bg = "bg-pop-yellow";
    }
    
    if (health < 20 || sanity < 20) {
        emoji = "😵‍💫"; // Low
        bg = "bg-pop-red";
    }

    return (
        <div className={`w-12 h-12 ${bg} border-4 border-black rounded-full flex items-center justify-center text-2xl shadow-pop overflow-hidden shrink-0`}>
            {emoji}
        </div>
    );
};

// --- BOSS SCENE CONTAINER ---
export const BossScene: React.FC<{ 
    tags: string[]; 
    isTransitioning: boolean; 
    riskLevel: number; 
    route?: RouteType; 
    sanity: number; 
    health: number;
    action: CharacterAction; // Passed down
}> = ({ tags, isTransitioning, riskLevel, route = 'NONE', sanity, health, action }) => {
  
  const isBunker = route === 'C';
  const isJungle = route === 'B';
  const isBarrio = route === 'A';
  
  // Flash effect on Damage
  const isHurt = action === 'HURT';

  // Environment Background
  let bgClass = 'bg-pop-cream';
  if (isBarrio) bgClass = 'bg-yellow-100';
  if (isJungle) bgClass = 'bg-green-100';
  if (isBunker) bgClass = 'bg-gray-300';
  
  if (isHurt) bgClass = 'bg-red-200'; // Override for hurt

  return (
    <div className={`relative w-full h-64 border-4 border-black shadow-pop-lg overflow-hidden transition-colors duration-200 rounded-xl ${bgClass}`}>
       
       {/* Background Pattern */}
       <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

       {/* Decorative Sun/Moon */}
       <div className="absolute top-4 right-4 text-pop-yellow animate-spin-slow">
           <Sun size={48} strokeWidth={3} fill="#FFD166" className="text-black" />
       </div>

       {/* Ground */}
       <div className="absolute bottom-0 w-full h-12 bg-black/10 border-t-4 border-black"></div>

       {/* Character */}
       <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
           <ElBigotes route={route} sanity={sanity} health={health} action={action} isTransitioning={isTransitioning} />
       </div>

       {/* Floating Emojis (Risk Indicator) */}
       {riskLevel > 50 && (
           <div className="absolute top-10 left-10 animate-bounce text-4xl">
               🚔
           </div>
       )}

       {/* Tags as Stickers */}
       <div className="absolute bottom-2 left-2 flex flex-wrap gap-2 z-30">
           {tags.map(t => (
               <span key={t} className="bg-white border-2 border-black px-2 py-0.5 text-xs font-bold shadow-pop-sm rotate-[-2deg] rounded-sm">
                   #{TAG_CN[t] || t}
               </span>
           ))}
       </div>
    </div>
  );
};

// --- DANMAKU OVERLAY ---
export const DanmakuOverlay: React.FC = () => {
    const comments = ["完了完了", "芭比Q了", "SAN值狂掉", "这是个啥？", "我要回家", "前面的别跑", "???", "前方高能"];
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-50 opacity-60">
            {comments.map((text, i) => (
                <div 
                    key={i} 
                    className="absolute whitespace-nowrap text-2xl font-cartoon text-red-600 animate-danmaku"
                    style={{ 
                        top: `${Math.random() * 80 + 10}%`, 
                        animationDuration: `${Math.random() * 5 + 5}s`,
                        animationDelay: `${Math.random() * 5}s`
                    }}
                >
                    {text}
                </div>
            ))}
        </div>
    );
};

// --- RESULT CARD ---
export const ResultCard: React.FC<{ text: string; deltas: StatDeltas; route?: RouteType }> = ({ text, deltas, route = 'NONE' }) => {
    
    // Translation Map for Stats
    const STAT_CN: Record<string, string> = {
        'money': '资金', 'risk': '曝光度', 'sanity': '理智', 
        'health': '健康', 'time': '时间', 'fans': '粉丝', 'karma': '善恶'
    };

    return (
        <div className={`w-full bg-white border-4 border-black p-6 relative animate-jelly shadow-pop-lg rounded-xl`}>
             <div className="absolute inset-0 opacity-10 pointer-events-none rounded-xl bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>
            
            <div className="absolute -top-4 -right-4 text-4xl animate-bounce z-20">
                {deltas.money && deltas.money > 0 ? '💰' : deltas.risk && deltas.risk > 0 ? '📢' : '📝'}
            </div>

            <h3 className="font-cartoon text-2xl mb-4 border-b-4 border-black inline-block relative z-10">最新情报</h3>

            <div className="flex flex-wrap gap-2 mb-4 relative z-10">
                 {Object.entries(deltas).map(([key, val]) => {
                     if (!val) return null;
                     const valNum = val as number;
                     const isPos = valNum > 0;
                     const isBad = (key === 'risk' && isPos) || (key !== 'risk' && !isPos);
                     return (
                         <div key={key} className={`flex items-center gap-2 border-2 border-black px-3 py-1 font-bold ${isBad ? 'bg-pop-red text-white' : 'bg-pop-green text-black'} shadow-pop-sm rounded-lg text-sm`}>
                             <span>{STAT_CN[key] || key}</span>
                             <span>{valNum > 0 ? '+' : ''}{valNum}</span>
                         </div>
                     )
                 })}
            </div>

            <p className="font-sans text-lg leading-relaxed text-black font-medium relative z-10">{text}</p>
        </div>
    );
}
