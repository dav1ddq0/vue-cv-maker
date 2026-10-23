/**
 * Raw inline SVG markup, not a data: URI — `currentColor` only resolves when the
 * SVG belongs to the host document.
 */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160">
  <rect width="120" height="160" fill="#fff"/>
  <rect x="20" y="24" width="46" height="6" rx="1" fill="#1f2937"/>
  <rect x="20" y="36" width="28" height="2" rx="1" fill="#9ca3af"/>
  <rect x="20" y="48" width="14" height="1.4" fill="currentColor"/>
  <g fill="#d1d5db">
    <rect x="20" y="58" width="80" height="2.4" rx="1.2"/>
    <rect x="20" y="64" width="80" height="2.4" rx="1.2"/>
    <rect x="20" y="70" width="52" height="2.4" rx="1.2"/>
  </g>
  <rect x="20" y="86" width="14" height="1.4" fill="currentColor"/>
  <rect x="20" y="94" width="18" height="2.4" rx="1.2" fill="#9ca3af"/>
  <g fill="#d1d5db">
    <rect x="48" y="94" width="52" height="2.4" rx="1.2"/>
    <rect x="48" y="100" width="46" height="2.4" rx="1.2"/>
  </g>
  <rect x="20" y="112" width="18" height="2.4" rx="1.2" fill="#9ca3af"/>
  <g fill="#d1d5db">
    <rect x="48" y="112" width="52" height="2.4" rx="1.2"/>
    <rect x="48" y="118" width="38" height="2.4" rx="1.2"/>
  </g>
  <rect x="20" y="132" width="14" height="1.4" fill="currentColor"/>
  <g fill="#d1d5db">
    <rect x="20" y="140" width="62" height="2.4" rx="1.2"/>
  </g>
</svg>`

export default svg
