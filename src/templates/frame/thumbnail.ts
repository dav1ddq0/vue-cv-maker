/** Raw inline SVG so `currentColor` resolves to the accent (see modern/thumbnail.ts). */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160">
  <rect width="120" height="160" fill="#fff"/>
  <rect x="8" y="8" width="104" height="40" rx="5" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <rect x="14" y="14" width="26" height="28" rx="4" fill="currentColor" opacity="0.25"/>
  <rect x="48" y="16" width="52" height="7" rx="2" fill="#1f2937"/>
  <rect x="48" y="27" width="34" height="4" rx="2" fill="currentColor"/>
  <rect x="48" y="35" width="48" height="3" rx="1.5" fill="#d1d5db"/>
  <g fill="currentColor">
    <rect x="10" y="58" width="30" height="4" rx="2"/><rect x="10" y="98" width="30" height="4" rx="2"/>
    <rect x="10" y="126" width="20" height="4" rx="2"/><rect x="64" y="126" width="20" height="4" rx="2"/>
  </g>
  <g stroke="currentColor" stroke-width="0.7">
    <line x1="10" y1="65" x2="110" y2="65"/><line x1="10" y1="105" x2="110" y2="105"/>
    <line x1="10" y1="133" x2="55" y2="133"/><line x1="64" y1="133" x2="110" y2="133"/>
  </g>
  <g fill="#d1d5db">
    <rect x="10" y="70" width="98" height="3" rx="1.5"/><rect x="10" y="77" width="92" height="3" rx="1.5"/>
    <rect x="10" y="84" width="70" height="3" rx="1.5"/>
    <rect x="10" y="110" width="98" height="3" rx="1.5"/><rect x="10" y="117" width="84" height="3" rx="1.5"/>
    <rect x="10" y="138" width="22" height="3" rx="1.5"/><rect x="64" y="138" width="22" height="3" rx="1.5"/>
  </g>
  <g fill="currentColor">
    <rect x="36" y="138" width="4" height="3" rx="0.8"/><rect x="41" y="138" width="4" height="3" rx="0.8"/>
    <rect x="46" y="138" width="4" height="3" rx="0.8" opacity="0.35"/>
    <rect x="90" y="138" width="4" height="3" rx="0.8"/><rect x="95" y="138" width="4" height="3" rx="0.8"/>
    <rect x="100" y="138" width="4" height="3" rx="0.8"/>
  </g>
</svg>`

export default svg
