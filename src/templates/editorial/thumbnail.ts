/**
 * Raw inline SVG markup, not a data: URI — `currentColor` only resolves when the
 * SVG belongs to the host document.
 */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160">
  <rect width="120" height="160" fill="#fff"/>
  <rect x="34" y="20" width="52" height="8" rx="1" fill="#1f2937"/>
  <rect x="42" y="33" width="36" height="3" rx="1.5" fill="currentColor"/>
  <rect x="24" y="43" width="72" height="1" fill="currentColor"/>
  <rect x="38" y="48" width="44" height="2.5" rx="1.25" fill="#9ca3af"/>
  <rect x="24" y="60" width="72" height="1" fill="currentColor"/>
  <g fill="#d1d5db">
    <rect x="24" y="66" width="72" height="2.6" rx="1.3"/>
    <rect x="24" y="72" width="72" height="2.6" rx="1.3"/>
    <rect x="24" y="78" width="54" height="2.6" rx="1.3"/>
  </g>
  <rect x="24" y="92" width="26" height="3" rx="1.5" fill="currentColor"/>
  <rect x="24" y="98" width="72" height="0.8" fill="currentColor"/>
  <g fill="#d1d5db">
    <rect x="24" y="104" width="50" height="2.6" rx="1.3" fill="#9ca3af"/>
    <rect x="24" y="110" width="72" height="2.4" rx="1.2"/>
    <rect x="24" y="116" width="66" height="2.4" rx="1.2"/>
  </g>
  <rect x="24" y="130" width="26" height="3" rx="1.5" fill="currentColor"/>
  <rect x="24" y="136" width="72" height="0.8" fill="currentColor"/>
  <g fill="#d1d5db">
    <rect x="24" y="142" width="58" height="2.4" rx="1.2"/>
    <rect x="24" y="148" width="44" height="2.4" rx="1.2"/>
  </g>
</svg>`

export default svg
