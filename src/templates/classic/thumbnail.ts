/**
 * Raw inline SVG markup, not a data: URI.
 *
 * `currentColor` only resolves when the SVG is part of the host document; inside
 * a data: URI it is an isolated document and the accent never arrives, which
 * left every accent stripe painted black.
 */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160">
  <rect width="120" height="160" fill="#fff"/>
  <rect x="16" y="18" width="60" height="7" rx="2" fill="#1f2937"/>
  <rect x="16" y="30" width="42" height="4" rx="2" fill="#9ca3af"/>
  <rect x="16" y="44" width="88" height="2" fill="currentColor"/>
  <g fill="#d1d5db">
    <rect x="16" y="54" width="88" height="3" rx="1.5"/>
    <rect x="16" y="61" width="78" height="3" rx="1.5"/>
    <rect x="16" y="78" width="34" height="4" rx="2" fill="currentColor"/>
    <rect x="16" y="88" width="88" height="3" rx="1.5"/>
    <rect x="16" y="95" width="88" height="3" rx="1.5"/>
    <rect x="16" y="102" width="64" height="3" rx="1.5"/>
    <rect x="16" y="118" width="34" height="4" rx="2" fill="currentColor"/>
    <rect x="16" y="128" width="88" height="3" rx="1.5"/>
    <rect x="16" y="135" width="72" height="3" rx="1.5"/>
  </g>
</svg>`

export default svg
