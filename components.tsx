
import React, { useState, useEffect } from 'react';
import { 
  LucideIcon, 
  Moon, 
  Sun, 
  Cloud,
  MessageCircle,
  Waves
} from 'lucide-react';
import { StatDeltas } from './types';

// --- BUTTON ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'special';
  icon?: LucideIcon;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', icon: Icon, fullWidth, className, ...props 
}) => {
  const baseStyle = "relative font-sans font-bold text-lg border-4 border-black transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 overflow-hidden group";
  
  const variants = {
    primary: "bg-neo-yellow text-neo-black shadow-hard hover:shadow-hard-hover",
    secondary: "bg-neo-safe text-neo-black shadow-hard hover:shadow-hard-hover",
    danger: "bg-neo-action text-white shadow-hard hover:shadow-hard-hover",
    special: "bg-neo-special text-white shadow-hard hover:shadow-hard-hover",
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} px-6 py-4 flex items-center justify-center gap-3 ${className || ''}`}
      {...props}
    >
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none"></div>
      {Icon && <Icon size={24} strokeWidth={3} className="shrink-0" />}
      <span className="z-10 text-left w-full">{children}</span>
    </button>
  );
};

// --- ICON BUTTON ---
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  variant?: 'primary' | 'secondary';
  size?: number;
}

export const IconButton: React.FC<IconButtonProps> = ({ icon: Icon, variant = 'primary', size = 20, className, ...props }) => {
  const baseStyle = "relative border-2 border-black p-2 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-hard-sm hover:shadow-hard-hover flex items-center justify-center";
   const variants = {
    primary: "bg-white text-black",
    secondary: "bg-neo-black text-white",
  };
  
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className || ''}`} {...props}>
      <Icon size={size} strokeWidth={3} />
    </button>
  );
}

// --- CARD ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className, title }) => {
  return (
    <div className={`relative bg-white border-4 border-black p-6 shadow-hard ${className || ''}`}>
      {title && (
        <div className="absolute -top-5 -left-1 bg-black text-white px-3 py-1 font-bold text-sm transform -rotate-2 border-2 border-white shadow-sm z-10">
          {title}
        </div>
      )}
      {children}
    </div>
  );
};

// --- GLITCH TEXT ---
export const GlitchText: React.FC<{ text: string; size?: 'sm' | 'md' | 'lg' | 'xl'; color?: string }> = ({ text, size = 'md', color = 'text-black' }) => {
  const sizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-7xl',
  };

  return (
    <div className={`relative inline-block font-sans font-black ${sizes[size]} ${color}`}>
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-0 -z-10 w-full h-full text-neo-action opacity-70 animate-glitch" style={{ clipPath: 'inset(20% 0 80% 0)' }}>{text}</span>
      <span className="absolute top-0 left-0 -z-10 w-full h-full text-neo-safe opacity-70 animate-glitch" style={{ animationDirection: 'reverse', clipPath: 'inset(60% 0 10% 0)' }}>{text}</span>
    </div>
  );
};

// --- TYPEWRITER TEXT ---
export const TypewriterText: React.FC<{ text: string }> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 20); // Faster speed
    return () => clearInterval(timer);
  }, [text]);

  return <p className="font-sans font-bold text-lg leading-relaxed text-gray-900 break-words whitespace-pre-wrap">{displayedText}<span className="animate-pulse">|</span></p>;
};

// --- BOSS CHARACTER (DYNAMIC ANIMATIONS) ---
const BossCharacter: React.FC<{ isRunning: boolean; mode: 'run' | 'swim' | 'stealth' | 'fly' }> = ({ isRunning, mode }) => {
  
  // Dynamic Transforms based on Mode
  const getContainerStyle = () => {
      if (!isRunning) return 'animate-bob';
      switch(mode) {
          case 'swim': return 'animate-float rotate-90 origin-center translate-y-10';
          case 'stealth': return 'animate-walk scale-y-75 origin-bottom';
          case 'fly': return 'animate-bob -translate-y-20';
          default: return 'animate-run';
      }
  };

  return (
    <div className={`relative w-24 h-32 transition-all duration-500 ${getContainerStyle()}`}>
       
       {/* Mode Specific Extras */}
       {isRunning && mode === 'fly' && (
           <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-4 h-10 bg-orange-500 blur-sm animate-pulse rounded-full z-0"></div>
       )}
       {isRunning && mode === 'swim' && (
           <div className="absolute -bottom-4 left-0 w-32 h-10 bg-blue-400/30 blur-md z-30 animate-pulse"></div>
       )}

       {/* Dust Particles (Only for Run) */}
       {isRunning && mode === 'run' && (
           <>
            <div className="absolute bottom-0 -left-6 w-5 h-5 bg-gray-300/50 rounded-full animate-dust"></div>
            <div className="absolute bottom-1 -left-10 w-8 h-8 bg-gray-200/50 rounded-full animate-dust" style={{ animationDelay: '0.1s' }}></div>
           </>
       )}

       {/* SHADOW */}
       {mode !== 'swim' && <div className="absolute bottom-0 left-2 w-20 h-4 bg-black/40 rounded-full blur-sm scale-x-110"></div>}

       {/* LEFT ARM */}
       <div className={`absolute top-14 -left-3 w-5 h-12 bg-[#006400] border-3 border-black rounded-full origin-top z-0 ${isRunning ? 'animate-run-arm' : 'rotate-12'}`} style={{ animationDirection: 'reverse' }}>
          <div className="absolute bottom-0 w-full h-5 bg-[#FFCC99] rounded-full border-t-2 border-black"></div>
       </div>

       {/* BODY */}
       <div className="absolute bottom-6 left-4 w-16 h-16 bg-[#006400] border-4 border-black rounded-xl z-10 flex flex-col items-center overflow-hidden shadow-sm">
          <div className="w-full h-full flex justify-between px-3">
             <div className="w-3 h-full bg-yellow-400 border-x border-black/10"></div>
             <div className="w-3 h-full bg-yellow-400 border-x border-black/10"></div>
          </div>
       </div>

       {/* RIGHT ARM */}
       <div className={`absolute top-14 right-0 w-5 h-12 bg-[#006400] border-3 border-black rounded-full origin-top z-20 ${isRunning ? 'animate-run-arm' : '-rotate-12'}`}>
          <div className="absolute bottom-0 w-full h-5 bg-[#FFCC99] rounded-full border-t-2 border-black"></div>
       </div>

       {/* HEAD */}
       <div className="absolute top-2 left-2 w-20 h-20 bg-[#FFCC99] border-4 border-black rounded-xl z-30 shadow-sm">
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-12 h-4 bg-black rounded-full z-40"></div>
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex gap-1 z-40">
             <div className="w-8 h-6 bg-black rounded-sm border-2 border-white/20"></div>
             <div className="w-8 h-6 bg-black rounded-sm border-2 border-white/20"></div>
             <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-black"></div>
          </div>
       </div>

       {/* BERET */}
       <div className="absolute -top-2 left-0 w-26 h-12 bg-[#DC143C] border-4 border-black rounded-t-lg rounded-bl-3xl z-40 transform -rotate-2 shadow-md">
           <div className="absolute bottom-3 right-4 w-3 h-3 bg-yellow-400 rounded-full border-2 border-black"></div>
       </div>

       {/* LEGS (Hide in swim mode) */}
       {mode !== 'swim' && (
           <>
            <div className={`absolute bottom-0 left-6 w-5 h-8 bg-black z-0 border-2 border-gray-800 rounded-b-md ${isRunning ? 'origin-top animate-run-arm' : ''}`}></div>
            <div className={`absolute bottom-0 right-7 w-5 h-8 bg-black z-0 border-2 border-gray-800 rounded-b-md ${isRunning ? 'origin-top animate-run-arm' : ''}`} style={{ animationDirection: 'reverse' }}></div>
           </>
       )}
    </div>
  );
};

// --- POLICE CAR ---
const PoliceCar: React.FC = () => (
    <div className="relative w-32 h-16 animate-bob">
        <div className="absolute bottom-2 left-0 w-32 h-12 bg-neo-black border-2 border-white rounded-t-xl z-10"></div>
        <div className="absolute top-0 left-8 w-16 h-4 flex animate-pulse">
             <div className="w-1/2 h-full bg-red-600 rounded-l-md shadow-[0_0_15px_#ff0000]"></div>
             <div className="w-1/2 h-full bg-blue-600 rounded-r-md shadow-[0_0_15px_#0000ff]"></div>
        </div>
        <div className="absolute bottom-0 left-4 w-6 h-6 bg-black rounded-full border-2 border-gray-500 z-20 animate-spin"></div>
        <div className="absolute bottom-0 right-4 w-6 h-6 bg-black rounded-full border-2 border-gray-500 z-20 animate-spin"></div>
    </div>
);


// --- BOSS SCENE (VISUAL 2.0) ---
export const BossScene: React.FC<{ tags: string[]; isTransitioning: boolean; riskLevel: number }> = ({ tags, isTransitioning, riskLevel }) => {
  
  const isNight = tags.includes('DARK') || tags.includes('MYSTERY') || tags.includes('SCAM');
  const isNature = tags.includes('ANIMAL') || tags.includes('SURVIVAL') || tags.includes('WATER');
  const isCyber = tags.includes('DIGITAL') || tags.includes('MECH') || tags.includes('ALIEN');
  const isWater = tags.includes('WATER');
  const isSky = tags.includes('SKY');
  const isStealth = tags.includes('STEALTH');
  const isHighRisk = riskLevel > 50;
  
  // Background Color
  const bgColor = isNight ? 'bg-sky-night' : isWater ? 'bg-blue-400' : isNature ? 'bg-green-300' : isCyber ? 'bg-purple-900' : 'bg-sky-day';
  
  // Determine Boss Animation Mode
  const bossMode = isWater ? 'swim' : isSky ? 'fly' : isStealth ? 'stealth' : 'run';

  // Translation Map
  const tagTranslations: Record<string, string> = {
    'CITY': '城市',
    'DANGER': '危险',
    'HUMAN': '人类',
    'DIGITAL': '电子',
    'SKY': '天空',
    'MECH': '机械',
    'SCAM': '诈骗',
    'STEALTH': '潜行',
    'CAMERA': '监控',
    'SOCIAL': '社交',
    'WATER': '环境',
    'SURVIVAL': '生存',
    'MYSTERY': '神秘',
    'ALIEN': '异常',
    'FOOD': '补给',
    'PHONE': '通讯',
    'ANIMAL': '生物',
    'DARK': '黑暗',
    'LIGHT': '强光'
  };

  return (
    <div className={`w-full h-64 relative overflow-hidden border-4 border-black mb-4 shadow-inner-hard transition-colors duration-500 ${bgColor}`}>
       
       {/* Background Grid */}
       {(isNight || isCyber) && <div className="absolute inset-0 bg-grid opacity-30"></div>}
       
       {/* Water Overlay */}
       {isWater && <div className="absolute bottom-0 w-full h-20 bg-blue-500/50 z-20 animate-pulse"></div>}

       {/* High Risk Alarm Overlay */}
       {isHighRisk && (
           <div className="absolute inset-0 z-0 animate-pulse opacity-20 bg-red-600 mix-blend-overlay pointer-events-none"></div>
       )}

       {/* Celestial Bodies */}
       <div className="absolute top-6 right-10 animate-float z-10">
          {isNight ? <Moon size={48} className="text-yellow-200 fill-yellow-200" /> : <Sun size={48} className="text-yellow-400 fill-yellow-400" />}
       </div>

       {/* Clouds / BG Objects */}
       <div className="absolute top-8 left-10 opacity-80 animate-bounce-slow">
           <Cloud size={60} className="text-white fill-white/80" />
       </div>

       {/* Moving Background Elements (Parallax) */}
       <div className={`flex gap-12 absolute bottom-8 left-0 w-[200%] items-end opacity-90 ${isTransitioning ? 'animate-scroll-bg-fast' : 'animate-scroll-bg'}`}>
           {[...Array(10)].map((_, i) => (
                <div key={i} className={`w-12 h-${30 + (i%3)*10} border-2 border-black ${isWater ? 'bg-blue-800 rounded-t-full h-10 opacity-50' : isNature ? 'bg-green-700 rounded-t-full h-16' : 'bg-gray-500 h-20'}`}></div>
           ))}
       </div>

       {/* Road/Ground */}
       <div className="absolute bottom-0 w-full h-10 bg-[#333] border-t-4 border-black z-10">
           {/* Road Stripes */}
           {!isWater && <div className={`absolute top-3 left-0 w-[200%] h-0 border-t-4 border-dashed border-gray-400 ${isTransitioning ? 'animate-scroll-bg-fast' : 'animate-scroll-bg'}`}></div>}
           {isWater && <Waves className="text-white w-full h-full opacity-50" />}
       </div>

       {/* The Boss Character */}
       <div className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 transition-all duration-500 ease-in-out ${isTransitioning ? 'left-[70%] scale-110' : 'left-[30%]'}`}>
          <BossCharacter isRunning={isTransitioning} mode={bossMode} />
          
          {/* Reaction Bubble */}
          {!isTransitioning && (
             <div className="absolute -top-12 -right-12 animate-pop-in">
                <div className="bg-white border-2 border-black px-2 py-1 rounded-lg shadow-sm">
                   {isHighRisk ? <span className="text-red-600 font-black text-xl">!</span> : <MessageCircle size={20} />}
                </div>
             </div>
          )}
       </div>

       {/* Chasing Police Car (Only on land) */}
       {isHighRisk && isTransitioning && !isWater && !isSky && (
           <div className="absolute bottom-6 left-[-150px] z-20 animate-slide-up" style={{ animationDuration: '1.5s' }}>
               <PoliceCar />
           </div>
       )}

       {/* Speed Lines */}
       {isTransitioning && (
           <div className="absolute inset-0 z-30 pointer-events-none">
             <div className="absolute top-10 w-full h-[2px] bg-white opacity-50 animate-speed-line"></div>
             <div className="absolute top-1/2 w-full h-[1px] bg-white opacity-40 animate-speed-line" style={{ animationDelay: '0.1s' }}></div>
             <div className="absolute bottom-20 w-full h-[3px] bg-white opacity-60 animate-speed-line" style={{ animationDelay: '0.2s' }}></div>
           </div>
       )}

       {/* Tags Display */}
       <div className="absolute top-3 left-3 flex flex-wrap gap-2 items-start z-30 max-w-[70%]">
         {tags.map((t) => (
           <div key={t} className="bg-black/90 text-white text-xs px-2 py-1 font-mono border border-white/50 shadow-sm">
             #{tagTranslations[t] || t}
           </div>
         ))}
       </div>
    </div>
  );
};

// --- RESULT CARD ---
export const ResultCard: React.FC<{ text: string; deltas: StatDeltas }> = ({ text, deltas }) => {
    return (
        <div className="w-full flex flex-col items-center animate-slide-up z-20">
            <div className="w-full bg-white border-4 border-black p-4 shadow-hard mb-4 relative">
                {/* Paper Texture */}
                <div className="absolute inset-0 bg-stripes opacity-10 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b-2 border-black pb-2">
                        <span className="font-black text-xl italic bg-neo-yellow px-2 border border-black transform -rotate-1">事件结算</span>
                        <span className="font-mono text-xs text-gray-500">{new Date().toLocaleTimeString()}</span>
                    </div>

                    {/* Stat Changes */}
                    <div className="flex flex-wrap gap-3">
                        {deltas.money !== 0 && (
                            <div className={`flex items-center gap-1 font-bold ${deltas.money && deltas.money > 0 ? 'text-green-700' : 'text-red-600'}`}>
                                <div className={`w-2 h-2 rounded-full ${deltas.money && deltas.money > 0 ? 'bg-green-600' : 'bg-red-600'}`}></div>
                                资金 {deltas.money && deltas.money > 0 ? '+' : ''}{Math.abs(deltas.money! / 10000).toFixed(1)}w
                            </div>
                        )}
                        {deltas.risk !== 0 && (
                            <div className={`flex items-center gap-1 font-bold ${deltas.risk && deltas.risk > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                                <div className={`w-2 h-2 rounded-full ${deltas.risk && deltas.risk > 0 ? 'bg-red-600' : 'bg-blue-600'}`}></div>
                                曝光 {deltas.risk && deltas.risk > 0 ? '+' : ''}{deltas.risk}%
                            </div>
                        )}
                         {deltas.sanity !== 0 && (
                            <div className={`flex items-center gap-1 font-bold ${deltas.sanity && deltas.sanity > 0 ? 'text-purple-600' : 'text-gray-600'}`}>
                                <div className={`w-2 h-2 rounded-full ${deltas.sanity && deltas.sanity > 0 ? 'bg-purple-600' : 'bg-gray-600'}`}></div>
                                理智 {deltas.sanity && deltas.sanity > 0 ? '+' : ''}{deltas.sanity}
                            </div>
                        )}
                    </div>

                    {/* Story Text */}
                    <div className="bg-gray-50 border-2 border-black p-3 font-medium min-h-[60px] flex items-center">
                        <TypewriterText text={text} />
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2 text-gray-500 font-mono text-sm animate-pulse">
                <span>RUNNING TO NEXT AREA</span>
                <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>
        </div>
    );
}
