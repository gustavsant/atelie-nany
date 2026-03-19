import { motion } from 'framer-motion';

const Carrot = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 60" fill="none" className={className}>
    {/* Leaves */}
    <path d="M20 18 C16 8, 10 4, 8 2 C10 6, 12 12, 14 16" stroke="hsl(var(--sage))" strokeWidth="1.5" strokeLinecap="round" fill="hsl(var(--sage))" fillOpacity="0.3" />
    <path d="M20 18 C20 6, 20 2, 20 0 C20 4, 20 12, 20 16" stroke="hsl(var(--sage))" strokeWidth="1.5" strokeLinecap="round" fill="hsl(var(--sage))" fillOpacity="0.3" />
    <path d="M20 18 C24 8, 30 4, 32 2 C30 6, 28 12, 26 16" stroke="hsl(var(--sage))" strokeWidth="1.5" strokeLinecap="round" fill="hsl(var(--sage))" fillOpacity="0.3" />
    {/* Body */}
    <path d="M12 20 Q10 35, 20 55 Q30 35, 28 20 Q26 16, 20 16 Q14 16, 12 20Z" fill="#F4915B" fillOpacity="0.6" stroke="#E8824A" strokeWidth="1" />
    <path d="M16 26 L18 24 M22 30 L24 28 M18 36 L20 34" stroke="#E8824A" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
  </svg>
);

const EasterEgg = ({ className, pattern = 0 }: { className?: string; pattern?: number }) => {
  const patterns = [
    // Zigzag pattern - pink
    <>
      <ellipse cx="20" cy="28" rx="13" ry="18" fill="hsl(var(--primary))" fillOpacity="0.2" stroke="hsl(var(--primary))" strokeWidth="1" />
      <path d="M8 24 L12 20 L16 24 L20 20 L24 24 L28 20 L32 24" stroke="hsl(var(--primary))" strokeWidth="0.8" fill="none" opacity="0.5" />
      <path d="M10 32 L14 28 L18 32 L22 28 L26 32 L30 28" stroke="hsl(var(--primary))" strokeWidth="0.8" fill="none" opacity="0.5" />
      <circle cx="20" cy="18" r="1.5" fill="hsl(var(--primary))" fillOpacity="0.4" />
    </>,
    // Dots pattern - sage green
    <>
      <ellipse cx="20" cy="28" rx="13" ry="18" fill="hsl(var(--sage-light))" stroke="hsl(var(--sage))" strokeWidth="1" />
      <circle cx="15" cy="22" r="2" fill="hsl(var(--sage))" fillOpacity="0.4" />
      <circle cx="25" cy="22" r="2" fill="hsl(var(--sage))" fillOpacity="0.4" />
      <circle cx="20" cy="30" r="2" fill="hsl(var(--sage))" fillOpacity="0.4" />
      <circle cx="15" cy="36" r="1.5" fill="hsl(var(--sage))" fillOpacity="0.3" />
      <circle cx="25" cy="36" r="1.5" fill="hsl(var(--sage))" fillOpacity="0.3" />
    </>,
    // Stripes pattern - mixed
    <>
      <ellipse cx="20" cy="28" rx="13" ry="18" fill="hsl(var(--secondary))" stroke="hsl(var(--primary))" strokeWidth="1" />
      <path d="M9 22 Q20 20 31 22" stroke="hsl(var(--sage))" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M8 28 Q20 26 32 28" stroke="hsl(var(--primary))" strokeWidth="1.5" fill="none" opacity="0.4" />
      <path d="M9 34 Q20 32 31 34" stroke="hsl(var(--sage))" strokeWidth="1.5" fill="none" opacity="0.5" />
    </>,
  ];

  return (
    <svg viewBox="0 0 40 50" fill="none" className={className}>
      {patterns[pattern % patterns.length]}
    </svg>
  );
};

const Heart = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M10 17 C6 13, 2 10, 2 6.5 C2 4, 4 2, 6.5 2 C8 2, 9.5 3, 10 4.5 C10.5 3, 12 2, 13.5 2 C16 2, 18 4, 18 6.5 C18 10, 14 13, 10 17Z" fill="hsl(var(--primary))" fillOpacity="0.25" />
  </svg>
);

interface DoodleConfig {
  type: 'carrot' | 'egg' | 'heart';
  x: string;
  y: string;
  size: string;
  rotate: number;
  pattern?: number;
  delay: number;
}

const doodles: DoodleConfig[] = [
  // Top area
  { type: 'carrot', x: '5%', y: '3%', size: '28px', rotate: -15, delay: 0 },
  { type: 'egg', x: '88%', y: '2%', size: '24px', rotate: 10, pattern: 0, delay: 0.2 },
  { type: 'heart', x: '75%', y: '5%', size: '16px', rotate: 0, delay: 0.4 },
  { type: 'carrot', x: '92%', y: '15%', size: '22px', rotate: 25, delay: 0.1 },
  
  // Middle scattered
  { type: 'egg', x: '3%', y: '30%', size: '20px', rotate: -8, pattern: 1, delay: 0.3 },
  { type: 'heart', x: '95%', y: '35%', size: '14px', rotate: 15, delay: 0.5 },
  { type: 'carrot', x: '96%', y: '55%', size: '26px', rotate: -20, delay: 0.15 },
  { type: 'egg', x: '2%', y: '60%', size: '22px', rotate: 12, pattern: 2, delay: 0.35 },
  
  // Bottom area
  { type: 'heart', x: '8%', y: '80%', size: '14px', rotate: -10, delay: 0.25 },
  { type: 'egg', x: '90%', y: '78%', size: '20px', rotate: -5, pattern: 0, delay: 0.45 },
  { type: 'carrot', x: '4%', y: '92%', size: '24px', rotate: 30, delay: 0.1 },
];

export default function EasterDoodles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {doodles.map((d, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: d.delay, duration: 0.5, ease: 'easeOut' }}
          className="absolute"
          style={{
            left: d.x,
            top: d.y,
            width: d.size,
            height: d.size,
            transform: `rotate(${d.rotate}deg)`,
          }}
        >
          {d.type === 'carrot' && <Carrot className="w-full h-full" />}
          {d.type === 'egg' && <EasterEgg className="w-full h-full" pattern={d.pattern} />}
          {d.type === 'heart' && <Heart className="w-full h-full" />}
        </motion.div>
      ))}
    </div>
  );
}
