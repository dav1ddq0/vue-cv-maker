/** Raw inline SVG so `currentColor` resolves to the accent (see modern/thumbnail.ts). */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160">
  <rect width="120" height="160" fill="#fff"/>
  <rect x="80" width="40" height="160" fill="#1f2937"/>
  <rect x="80" width="40" height="3" fill="currentColor"/>
  <circle cx="100" cy="26" r="11" fill="#fff" opacity="0.85"/>
  <g fill="#fff" opacity="0.75">
    <rect x="87" y="47" width="26" height="3" rx="1.5"/><rect x="87" y="54" width="20" height="3" rx="1.5"/>
    <rect x="87" y="72" width="18" height="3" rx="1.5"/><rect x="87" y="96" width="18" height="3" rx="1.5"/>
  </g>
  <g fill="#fff">
    <circle cx="89" cy="84" r="1.8"/><circle cx="94" cy="84" r="1.8"/><circle cx="99" cy="84" r="1.8"/>
    <circle cx="104" cy="84" r="1.8" opacity="0.35"/><circle cx="109" cy="84" r="1.8" opacity="0.35"/>
    <circle cx="89" cy="108" r="1.8"/><circle cx="94" cy="108" r="1.8"/>
    <circle cx="99" cy="108" r="1.8" opacity="0.35"/><circle cx="104" cy="108" r="1.8" opacity="0.35"/>
  </g>
  <rect x="12" y="16" width="52" height="8" rx="2" fill="#1f2937"/>
  <rect x="12" y="29" width="34" height="4" rx="2" fill="currentColor"/>
  <rect x="12" y="46" width="3" height="5" fill="currentColor"/>
  <rect x="18" y="46" width="30" height="4" rx="2" fill="currentColor"/>
  <g fill="#d1d5db">
    <rect x="12" y="58" width="60" height="3" rx="1.5"/><rect x="12" y="65" width="56" height="3" rx="1.5"/>
    <rect x="12" y="72" width="44" height="3" rx="1.5"/>
    <rect x="12" y="90" width="3" height="5" fill="currentColor"/>
    <rect x="18" y="90" width="30" height="4" rx="2" fill="currentColor"/>
    <rect x="12" y="102" width="60" height="3" rx="1.5"/><rect x="12" y="109" width="52" height="3" rx="1.5"/>
    <rect x="12" y="116" width="58" height="3" rx="1.5"/>
  </g>
</svg>`

export default svg
