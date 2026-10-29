/**
 * Raw inline SVG markup, not a data: URI — `currentColor` only resolves when the
 * SVG belongs to the host document.
 */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160">
  <rect width="120" height="160" fill="#fff"/>
  <rect width="50" height="160" fill="currentColor" opacity="0.08"/>
  <rect width="120" height="37" fill="currentColor" opacity="0.24"/>
  <circle cx="25" cy="34" r="15" fill="#fff" opacity="0.6"/>
  <circle cx="25" cy="30" r="13" fill="currentColor" opacity="0.55"/>
  <rect x="58" y="12" width="48" height="8" rx="1.5" fill="currentColor"/>
  <rect x="58" y="24" width="34" height="8" rx="1.5" fill="currentColor"/>
  <rect x="58" y="35" width="26" height="1.8" rx="0.9" fill="currentColor"/>
  <rect x="9" y="56" width="22" height="2.8" rx="1.4" fill="currentColor"/>
  <rect x="9" y="62" width="10" height="1.2" fill="currentColor"/>
  <g fill="currentColor">
    <circle cx="12" cy="72" r="3.2"/><circle cx="12" cy="82" r="3.2"/><circle cx="12" cy="92" r="3.2"/>
  </g>
  <g fill="#9ca3af">
    <rect x="19" y="70.8" width="22" height="2.4" rx="1.2"/>
    <rect x="19" y="80.8" width="25" height="2.4" rx="1.2"/>
    <rect x="19" y="90.8" width="20" height="2.4" rx="1.2"/>
    <rect x="12" y="110" width="26" height="2.4" rx="1.2"/>
    <rect x="12" y="116" width="22" height="2.4" rx="1.2"/>
  </g>
  <rect x="58" y="56" width="24" height="2.8" rx="1.4" fill="currentColor"/>
  <rect x="58" y="62" width="10" height="1.2" fill="currentColor"/>
  <g fill="#d1d5db">
    <rect x="58" y="70" width="50" height="2.4" rx="1.2"/>
    <rect x="58" y="76" width="50" height="2.4" rx="1.2"/>
    <rect x="58" y="82" width="36" height="2.4" rx="1.2"/>
  </g>
  <rect x="58" y="96" width="30" height="2.8" rx="1.4" fill="currentColor"/>
  <rect x="58" y="102" width="10" height="1.2" fill="currentColor"/>
  <g fill="#d1d5db">
    <rect x="58" y="110" width="50" height="2.4" rx="1.2"/>
    <rect x="58" y="116" width="44" height="2.4" rx="1.2"/>
    <rect x="58" y="122" width="50" height="2.4" rx="1.2"/>
  </g>
</svg>`

export default svg
