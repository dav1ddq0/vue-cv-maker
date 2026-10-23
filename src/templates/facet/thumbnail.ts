/** Raw inline SVG so `currentColor` resolves to the accent (see modern/thumbnail.ts). */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160">
  <rect width="120" height="160" fill="#fff"/>
  <path d="M0 0 H34 A34 34 0 0 1 0 34 Z" fill="currentColor" opacity="0.92"/>
  <polygon points="84,0 120,0 120,36" fill="currentColor" opacity="0.5"/>
  <circle cx="98" cy="22" r="11" fill="#fff"/><circle cx="98" cy="22" r="9" fill="currentColor" opacity="0.3"/>
  <rect x="12" y="46" width="52" height="8" rx="2" fill="#1f2937"/>
  <rect x="12" y="58" width="34" height="4" rx="2" fill="currentColor"/>
  <rect x="78" y="70" width="1.4" height="76" fill="currentColor"/>
  <g fill="currentColor">
    <rect x="12" y="74" width="30" height="4" rx="2"/><rect x="12" y="110" width="30" height="4" rx="2"/>
    <rect x="86" y="74" width="24" height="4" rx="2"/><rect x="86" y="108" width="24" height="4" rx="2"/>
  </g>
  <g fill="#d1d5db">
    <rect x="12" y="83" width="58" height="3" rx="1.5"/><rect x="12" y="90" width="54" height="3" rx="1.5"/>
    <rect x="12" y="97" width="42" height="3" rx="1.5"/>
    <rect x="12" y="119" width="58" height="3" rx="1.5"/><rect x="12" y="126" width="50" height="3" rx="1.5"/>
    <rect x="86" y="83" width="26" height="3" rx="1.5"/><rect x="86" y="90" width="22" height="3" rx="1.5"/>
    <rect x="86" y="117" width="26" height="3" rx="1.5"/>
  </g>
  <g fill="currentColor">
    <circle cx="88" cy="128" r="1.8"/><circle cx="93" cy="128" r="1.8"/><circle cx="98" cy="128" r="1.8"/>
    <circle cx="103" cy="128" r="1.8" opacity="0.35"/><circle cx="108" cy="128" r="1.8" opacity="0.35"/>
  </g>
</svg>`

export default svg
