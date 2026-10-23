/** Raw inline SVG so `currentColor` resolves to the accent (see modern/thumbnail.ts). */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160">
  <rect width="120" height="160" fill="#fff"/>
  <polygon points="0,0 120,0 120,34 60,52 0,34" fill="currentColor" opacity="0.92"/>
  <g fill="#fff" opacity="0.8">
    <rect x="8" y="8" width="22" height="3" rx="1.5"/><rect x="8" y="15" width="18" height="3" rx="1.5"/>
    <rect x="90" y="8" width="22" height="3" rx="1.5"/>
  </g>
  <circle cx="60" cy="32" r="13" fill="#fff"/><circle cx="60" cy="32" r="10.5" fill="currentColor" opacity="0.3"/>
  <rect x="34" y="62" width="52" height="7" rx="2" fill="#1f2937"/>
  <rect x="44" y="73" width="32" height="4" rx="2" fill="currentColor"/>
  <rect x="10" y="88" width="30" height="4" rx="2" fill="currentColor"/>
  <rect x="80" y="88" width="26" height="4" rx="2" fill="currentColor"/>
  <g fill="#d1d5db">
    <rect x="10" y="97" width="62" height="3" rx="1.5"/><rect x="10" y="104" width="58" height="3" rx="1.5"/>
    <rect x="10" y="111" width="46" height="3" rx="1.5"/>
    <rect x="10" y="125" width="62" height="3" rx="1.5"/><rect x="10" y="132" width="54" height="3" rx="1.5"/>
    <rect x="80" y="97" width="28" height="3" rx="1.5"/><rect x="80" y="104" width="24" height="3" rx="1.5"/>
    <rect x="80" y="111" width="28" height="3" rx="1.5"/>
  </g>
  <g fill="currentColor">
    <circle cx="82" cy="125" r="1.8"/><circle cx="87" cy="125" r="1.8"/><circle cx="92" cy="125" r="1.8"/>
    <circle cx="97" cy="125" r="1.8" opacity="0.35"/><circle cx="102" cy="125" r="1.8" opacity="0.35"/>
  </g>
</svg>`

export default svg
