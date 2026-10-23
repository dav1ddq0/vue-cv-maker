/** Raw inline SVG so `currentColor` resolves to the accent (see modern/thumbnail.ts). */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160">
  <rect width="120" height="160" fill="#fff"/>
  <rect x="6" y="6" width="108" height="42" rx="9" fill="currentColor" opacity="0.92"/>
  <circle cx="22" cy="22" r="8" fill="#fff" opacity="0.85"/>
  <rect x="14" y="34" width="44" height="6" rx="2" fill="#fff"/>
  <g fill="#fff" opacity="0.8">
    <rect x="76" y="18" width="32" height="3" rx="1.5"/>
    <rect x="76" y="26" width="26" height="3" rx="1.5"/>
    <rect x="76" y="34" width="30" height="3" rx="1.5"/>
  </g>
  <rect x="10" y="60" width="38" height="5" rx="2" fill="currentColor"/>
  <g fill="#d1d5db">
    <rect x="10" y="72" width="62" height="4" rx="2" fill="#1f2937" opacity="0.8"/>
    <rect x="10" y="80" width="64" height="3" rx="1.5"/>
    <rect x="10" y="87" width="58" height="3" rx="1.5"/>
    <rect x="10" y="94" width="48" height="3" rx="1.5"/>
    <rect x="10" y="108" width="62" height="4" rx="2" fill="#1f2937" opacity="0.8"/>
    <rect x="10" y="116" width="64" height="3" rx="1.5"/>
    <rect x="10" y="123" width="52" height="3" rx="1.5"/>
  </g>
  <rect x="82" y="60" width="28" height="5" rx="2" fill="currentColor"/>
  <g fill="#d1d5db">
    <rect x="82" y="72" width="28" height="3" rx="1.5"/>
    <rect x="82" y="79" width="24" height="3" rx="1.5"/>
    <rect x="82" y="86" width="28" height="3" rx="1.5"/>
  </g>
  <g fill="currentColor">
    <circle cx="84" cy="106" r="1.8"/><circle cx="89" cy="106" r="1.8"/><circle cx="94" cy="106" r="1.8"/>
    <circle cx="99" cy="106" r="1.8" opacity="0.35"/><circle cx="104" cy="106" r="1.8" opacity="0.35"/>
    <circle cx="84" cy="116" r="1.8"/><circle cx="89" cy="116" r="1.8"/>
    <circle cx="94" cy="116" r="1.8" opacity="0.35"/><circle cx="99" cy="116" r="1.8" opacity="0.35"/><circle cx="104" cy="116" r="1.8" opacity="0.35"/>
  </g>
</svg>`

export default svg
