/**
 * Seamless Easter doodle pattern for the storefront background.
 * Renders as a fixed full-screen SVG with repeating pattern tiles.
 */
export default function StorefrontDoodles() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="easter-pattern" x="0" y="0" width="220" height="260" patternUnits="userSpaceOnUse">
            {/* Carrot 1 */}
            <g transform="translate(20, 30) rotate(-15)" opacity="0.13">
              <path d="M8 12 L14 42 L2 42 Z" fill="hsl(25, 70%, 60%)" />
              <path d="M8 6 Q5 0 2 4 Q5 7 8 6Z" fill="hsl(140, 40%, 55%)" />
              <path d="M8 6 Q11 0 14 4 Q11 7 8 6Z" fill="hsl(140, 40%, 50%)" />
              <path d="M8 8 Q8 2 8 0 Q9 3 8 8Z" fill="hsl(140, 40%, 48%)" />
              <line x1="4" y1="22" x2="12" y2="22" stroke="hsl(25, 50%, 50%)" strokeWidth="0.8" opacity="0.5" />
              <line x1="5" y1="28" x2="11" y2="28" stroke="hsl(25, 50%, 50%)" strokeWidth="0.8" opacity="0.5" />
              <line x1="6" y1="34" x2="10" y2="34" stroke="hsl(25, 50%, 50%)" strokeWidth="0.8" opacity="0.5" />
            </g>

            {/* Easter egg 1 - striped */}
            <g transform="translate(80, 20)" opacity="0.12">
              <ellipse cx="14" cy="18" rx="14" ry="18" fill="hsl(340, 60%, 80%)" />
              <path d="M3 12 Q14 8 25 12" stroke="hsl(340, 50%, 70%)" strokeWidth="2" fill="none" />
              <path d="M2 18 Q14 22 26 18" stroke="hsl(340, 50%, 70%)" strokeWidth="2" fill="none" />
              <path d="M3 24 Q14 20 25 24" stroke="hsl(340, 50%, 70%)" strokeWidth="2" fill="none" />
              <circle cx="8" cy="10" r="1.5" fill="hsl(340, 50%, 68%)" />
              <circle cx="20" cy="10" r="1.5" fill="hsl(340, 50%, 68%)" />
            </g>

            {/* Chocolate bar */}
            <g transform="translate(155, 55) rotate(10)" opacity="0.10">
              <rect x="0" y="0" width="28" height="38" rx="3" fill="hsl(25, 50%, 42%)" />
              <rect x="2" y="2" width="11" height="16" rx="1" fill="hsl(25, 45%, 48%)" />
              <rect x="15" y="2" width="11" height="16" rx="1" fill="hsl(25, 45%, 48%)" />
              <rect x="2" y="20" width="11" height="16" rx="1" fill="hsl(25, 45%, 48%)" />
              <rect x="15" y="20" width="11" height="16" rx="1" fill="hsl(25, 45%, 48%)" />
            </g>

            {/* Carrot 2 */}
            <g transform="translate(150, 170) rotate(20)" opacity="0.11">
              <path d="M8 12 L14 42 L2 42 Z" fill="hsl(25, 70%, 60%)" />
              <path d="M8 6 Q5 0 2 4 Q5 7 8 6Z" fill="hsl(140, 40%, 55%)" />
              <path d="M8 6 Q11 0 14 4 Q11 7 8 6Z" fill="hsl(140, 40%, 50%)" />
              <path d="M8 8 Q8 2 8 0 Q9 3 8 8Z" fill="hsl(140, 40%, 48%)" />
              <line x1="4" y1="22" x2="12" y2="22" stroke="hsl(25, 50%, 50%)" strokeWidth="0.8" opacity="0.5" />
              <line x1="5" y1="28" x2="11" y2="28" stroke="hsl(25, 50%, 50%)" strokeWidth="0.8" opacity="0.5" />
            </g>

            {/* Easter egg 2 - dotted */}
            <g transform="translate(45, 130) rotate(-8)" opacity="0.12">
              <ellipse cx="12" cy="16" rx="12" ry="16" fill="hsl(150, 30%, 78%)" />
              <circle cx="6" cy="10" r="2" fill="hsl(150, 25%, 68%)" />
              <circle cx="18" cy="10" r="2" fill="hsl(150, 25%, 68%)" />
              <circle cx="12" cy="16" r="2" fill="hsl(150, 25%, 68%)" />
              <circle cx="6" cy="22" r="2" fill="hsl(150, 25%, 68%)" />
              <circle cx="18" cy="22" r="2" fill="hsl(150, 25%, 68%)" />
            </g>

            {/* Chocolate truffle */}
            <g transform="translate(110, 140)" opacity="0.10">
              <circle cx="12" cy="12" r="12" fill="hsl(20, 45%, 38%)" />
              <path d="M4 8 Q12 4 20 8" stroke="hsl(20, 40%, 50%)" strokeWidth="1.5" fill="none" />
              <path d="M6 14 Q12 18 18 14" stroke="hsl(20, 40%, 50%)" strokeWidth="1.5" fill="none" />
              <circle cx="12" cy="5" r="1" fill="hsl(20, 40%, 50%)" />
            </g>

            {/* Easter egg 3 - zigzag */}
            <g transform="translate(10, 200) rotate(12)" opacity="0.11">
              <ellipse cx="13" cy="17" rx="13" ry="17" fill="hsl(45, 60%, 82%)" />
              <polyline points="3,12 8,8 13,12 18,8 23,12" stroke="hsl(45, 50%, 70%)" strokeWidth="1.8" fill="none" />
              <polyline points="3,20 8,16 13,20 18,16 23,20" stroke="hsl(45, 50%, 70%)" strokeWidth="1.8" fill="none" />
            </g>

            {/* Small chocolate egg */}
            <g transform="translate(190, 220) rotate(-5)" opacity="0.09">
              <ellipse cx="8" cy="10" rx="8" ry="10" fill="hsl(20, 50%, 45%)" />
              <path d="M2 7 Q8 3 14 7" stroke="hsl(20, 45%, 55%)" strokeWidth="1.2" fill="none" />
            </g>

            {/* Tiny hearts scattered */}
            <g opacity="0.08">
              <path d="M68 95 Q68 91 72 91 Q76 91 76 95 Q76 99 72 103 Q68 99 68 95Z" fill="hsl(340, 60%, 75%)" />
              <path d="M195 125 Q195 121 199 121 Q203 121 203 125 Q203 129 199 133 Q195 129 195 125Z" fill="hsl(340, 60%, 75%)" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#easter-pattern)" />
      </svg>
    </div>
  );
}
