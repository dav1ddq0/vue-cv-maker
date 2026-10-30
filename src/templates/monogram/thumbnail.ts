/**
 * Raw inline SVG markup, not a data: URI — `currentColor` only resolves when the
 * SVG belongs to the host document.
 */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160">
  <rect width="120" height="160" fill="#fff"/>
  <rect width="42" height="160" fill="currentColor" opacity="0.14"/>
  <rect x="42" width="78" height="42" fill="currentColor" opacity="0.14"/>
  <polygon points="0,0 42,0 0,42" fill="currentColor"/>
  <polygon points="42,0 42,42 0,42" fill="currentColor" opacity="0.7"/>
  <rect x="9" y="9" width="24" height="24" fill="none" stroke="#fff" stroke-width="1.2"/>
  <line x1="9" y1="33" x2="33" y2="9" stroke="#fff" stroke-width="1"/>
  <rect x="50" y="13" width="56" height="7" rx="1" fill="#1f2937"/>
  <rect x="50" y="24" width="12" height="1" fill="#1f2937"/>
  <g fill="#9ca3af">
    <rect x="50" y="30" width="60" height="2.4" rx="1.2"/>
    <rect x="50" y="36" width="48" height="2.4" rx="1.2"/>
  </g>
  <rect x="7" y="52" width="26" height="2.6" rx="1.3" fill="#1f2937"/>
  <g fill="#1f2937">
    <rect x="7" y="62" width="4" height="4"/><rect x="7" y="71" width="4" height="4"/><rect x="7" y="80" width="4" height="4"/>
  </g>
  <g fill="#9ca3af">
    <rect x="14" y="62.8" width="22" height="2.4" rx="1.2"/>
    <rect x="14" y="71.8" width="18" height="2.4" rx="1.2"/>
    <rect x="14" y="80.8" width="24" height="2.4" rx="1.2"/>
    <rect x="9" y="102" width="26" height="2.4" rx="1.2"/>
    <rect x="9" y="108" width="20" height="2.4" rx="1.2"/>
  </g>
  <rect x="50" y="52" width="30" height="2.6" rx="1.3" fill="#1f2937"/>
  <g fill="#d1d5db">
    <rect x="50" y="60" width="62" height="2.4" rx="1.2"/>
    <rect x="50" y="66" width="48" height="2.4" rx="1.2"/>
  </g>
  <rect x="50" y="78" width="62" height="0.8" fill="#1f2937"/>
  <rect x="50" y="86" width="40" height="2.6" rx="1.3" fill="#1f2937"/>
  <g fill="#d1d5db">
    <rect x="50" y="94" width="62" height="2.4" rx="1.2"/>
    <rect x="50" y="100" width="56" height="2.4" rx="1.2"/>
    <rect x="50" y="106" width="62" height="2.4" rx="1.2"/>
    <rect x="50" y="112" width="44" height="2.4" rx="1.2"/>
  </g>
</svg>`

export default svg
