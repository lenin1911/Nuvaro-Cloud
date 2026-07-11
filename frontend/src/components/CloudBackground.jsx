import React from 'react';
import { useTheme } from '../context/ThemeContext';

const CloudBackground = () => {
  const { isDark } = useTheme();

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Dynamic Background Sky Gradients (Light / Dark Mode) */}
      <div 
        className="absolute inset-0 transition-all duration-1000 dark:bg-gradient-to-tr dark:from-[#090d16] dark:via-[#0b1329] dark:to-[#17153b]" 
        style={{
          background: isDark 
            ? undefined 
            : 'radial-gradient(circle at 50% 25%, rgba(37,99,235,0.15), transparent 55%), radial-gradient(circle at top left, rgba(37,99,235,0.08), transparent 45%), linear-gradient(180deg, #DDEEFF 0%, #E6F2FF 30%, #FFFFFF 85%)'
        }}
      />
      
      {/* Light Rays / Soft Glow Layer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vw] h-[60vh] bg-gradient-to-b from-blue-500/5 to-transparent dark:from-brand-500/5 dark:to-transparent rounded-full filter blur-[120px] opacity-70" />
      
      {/* Floating Particles for Depth (Very faint in Light Mode) */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${isDark ? 'opacity-55' : 'opacity-15'}`}>
        {[...Array(15)].map((_, i) => {
          const size = Math.random() * 5 + 2;
          const delay = Math.random() * 20;
          const duration = Math.random() * 20 + 20;
          const left = Math.random() * 100;
          return (
            <div
              key={i}
              className="absolute bg-white dark:bg-brand-400/35 rounded-full filter blur-[1px]"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                bottom: `-20px`,
                animation: `floatParticle ${duration}s linear infinite`,
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}
      </div>

      {/* Parallax Moving Faint Cloud Textures */}
      {/* Layer 1: Foreground (Fastest, Largest, Very low opacity) */}
      <div className="absolute top-[15%] w-[450px] h-[200px] bg-white/10 dark:bg-slate-800/10 rounded-full filter blur-[90px] mix-blend-overlay"
           style={{ animation: 'moveCloud 60s linear infinite' }} />
      <div className="absolute top-[55%] w-[500px] h-[250px] bg-white/10 dark:bg-slate-800/10 rounded-full filter blur-[100px] mix-blend-overlay"
           style={{ animation: 'moveCloud 90s linear infinite', animationDelay: '-30s' }} />

      {/* Layer 2: Midground (Moderate speed, soft blur) */}
      <div className="absolute top-[30%] w-[350px] h-[150px] bg-white/15 dark:bg-slate-700/10 rounded-full filter blur-[70px] mix-blend-overlay"
           style={{ animation: 'moveCloud 130s linear infinite', animationDelay: '-15s' }} />
      <div className="absolute top-[70%] w-[400px] h-[180px] bg-white/12 dark:bg-slate-700/10 rounded-full filter blur-[80px] mix-blend-overlay"
           style={{ animation: 'moveCloud 160s linear infinite', animationDelay: '-80s' }} />

      {/* Layer 3: Background (Slowest, smallest, deepest blur) */}
      <div className="absolute top-[5%] w-[250px] h-[100px] bg-white/15 dark:bg-slate-600/10 rounded-full filter blur-[60px] mix-blend-overlay"
           style={{ animation: 'moveCloud 220s linear infinite', animationDelay: '-50s' }} />
      <div className="absolute top-[45%] w-[280px] h-[120px] bg-white/15 dark:bg-slate-600/10 rounded-full filter blur-[75px] mix-blend-overlay"
           style={{ animation: 'moveCloud 280s linear infinite', animationDelay: '-140s' }} />

      {/* Inject Keyframe Animations inline */}
      <style>{`
        @keyframes moveCloud {
          0% {
            transform: translateX(-550px);
          }
          100% {
            transform: translateX(110vw);
          }
        }
        @keyframes floatParticle {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-110vh) translateX(50px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default CloudBackground;
