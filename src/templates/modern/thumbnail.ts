/**
 * Raw inline SVG markup, not a data: URI.
 *
 * `currentColor` only resolves when the SVG is part of the host document; inside
 * a data: URI it is an isolated document and the accent never arrives, which
 * left every accent stripe painted black.
 */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160">
  <rect width="120" height="160" fill="#fff"/>
  <rect width="42" height="160" fill="currentColor" opacity="0.92"/>
  <circle cx="21" cy="28" r="12" fill="#fff" opacity="0.85"/>
  <g fill="#fff" opacity="0.75">
    <rect x="8" y="50" width="26" height="3" rx="1.5"/>
    <rect x="8" y="58" width="20" height="3" rx="1.5"/>
    <rect x="8" y="74" width="24" height="3" rx="1.5"/>
    <rect x="8" y="82" width="28" height="3" rx="1.5"/>
    <rect x="8" y="90" width="18" height="3" rx="1.5"/>
  </g>
  <rect x="52" y="20" width="52" height="7" rx="2" fill="#1f2937"/>
  <rect x="52" y="32" width="36" height="4" rx="2" fill="currentColor"/>
  <g fill="#d1d5db">
    <rect x="52" y="48" width="30" height="4" rx="2" fill="currentColor"/>
    <rect x="52" y="58" width="52" height="3" rx="1.5"/>
    <rect x="52" y="65" width="52" height="3" rx="1.5"/>
    <rect x="52" y="72" width="40" height="3" rx="1.5"/>
    <rect x="52" y="88" width="30" height="4" rx="2" fill="currentColor"/>
    <rect x="52" y="98" width="52" height="3" rx="1.5"/>
    <rect x="52" y="105" width="46" height="3" rx="1.5"/>
  </g>
</svg>`

export default svg
