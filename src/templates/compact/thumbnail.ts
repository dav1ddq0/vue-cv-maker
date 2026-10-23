/**
 * Raw inline SVG markup, not a data: URI.
 *
 * `currentColor` only resolves when the SVG is part of the host document; inside
 * a data: URI it is an isolated document and the accent never arrives, which
 * left every accent stripe painted black.
 */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160">
  <rect width="120" height="160" fill="#fff"/>
  <rect x="12" y="14" width="50" height="6" rx="2" fill="#1f2937"/>
  <rect x="12" y="23" width="76" height="3" rx="1.5" fill="#9ca3af"/>
  <g fill="#d1d5db">
    <rect x="12" y="36" width="22" height="3" rx="1.5" fill="currentColor"/>
    <rect x="40" y="36" width="68" height="3" rx="1.5"/>
    <rect x="40" y="42" width="58" height="3" rx="1.5"/>
    <rect x="12" y="54" width="22" height="3" rx="1.5" fill="currentColor"/>
    <rect x="40" y="54" width="68" height="3" rx="1.5"/>
    <rect x="40" y="60" width="64" height="3" rx="1.5"/>
    <rect x="12" y="72" width="22" height="3" rx="1.5" fill="currentColor"/>
    <rect x="40" y="72" width="68" height="3" rx="1.5"/>
    <rect x="40" y="78" width="50" height="3" rx="1.5"/>
    <rect x="12" y="90" width="22" height="3" rx="1.5" fill="currentColor"/>
    <rect x="40" y="90" width="68" height="3" rx="1.5"/>
    <rect x="40" y="96" width="60" height="3" rx="1.5"/>
    <rect x="12" y="108" width="22" height="3" rx="1.5" fill="currentColor"/>
    <rect x="40" y="108" width="68" height="3" rx="1.5"/>
    <rect x="40" y="114" width="44" height="3" rx="1.5"/>
  </g>
</svg>`

export default svg
