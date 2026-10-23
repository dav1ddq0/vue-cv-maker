/**
 * Raw inline SVG markup, not a data: URI — `currentColor` only resolves when the
 * SVG belongs to the host document.
 */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160">
  <rect width="120" height="160" fill="#fff"/>
  <rect width="44" height="160" fill="currentColor" opacity="0.1"/>
  <rect x="43.4" width="0.8" height="160" fill="currentColor" opacity="0.55"/>
  <circle cx="22" cy="30" r="13" fill="#fff"/>
  <circle cx="22" cy="30" r="13" fill="none" stroke="currentColor" stroke-width="1"/>
  <rect x="10" y="52" width="20" height="2.6" rx="1.3" fill="currentColor"/>
  <g fill="#9ca3af">
    <rect x="10" y="60" width="26" height="2.4" rx="1.2"/>
    <rect x="10" y="66" width="22" height="2.4" rx="1.2"/>
    <rect x="10" y="72" width="25" height="2.4" rx="1.2"/>
  </g>
  <rect x="10" y="86" width="20" height="2.6" rx="1.3" fill="currentColor"/>
  <g fill="#9ca3af">
    <rect x="10" y="94" width="24" height="2.4" rx="1.2"/>
    <rect x="10" y="100" width="27" height="2.4" rx="1.2"/>
  </g>
  <rect x="56" y="22" width="50" height="7" rx="1" fill="#1f2937"/>
  <rect x="56" y="34" width="32" height="3" rx="1.5" fill="currentColor"/>
  <rect x="56" y="48" width="22" height="2.8" rx="1.4" fill="currentColor"/>
  <rect x="56" y="54" width="50" height="0.8" fill="currentColor" opacity="0.4"/>
  <g fill="#d1d5db">
    <rect x="56" y="60" width="50" height="2.4" rx="1.2"/>
    <rect x="56" y="66" width="50" height="2.4" rx="1.2"/>
    <rect x="56" y="72" width="36" height="2.4" rx="1.2"/>
  </g>
  <rect x="56" y="88" width="22" height="2.8" rx="1.4" fill="currentColor"/>
  <rect x="56" y="94" width="50" height="0.8" fill="currentColor" opacity="0.4"/>
  <g fill="#d1d5db">
    <rect x="56" y="100" width="50" height="2.4" rx="1.2"/>
    <rect x="56" y="106" width="44" height="2.4" rx="1.2"/>
    <rect x="56" y="112" width="50" height="2.4" rx="1.2"/>
  </g>
</svg>`

export default svg
