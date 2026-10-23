/** Raw inline SVG so `currentColor` resolves to the accent (see modern/thumbnail.ts). */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160">
  <rect width="120" height="160" fill="#fff"/>
  <rect x="12" y="14" width="60" height="8" rx="2" fill="#1f2937"/>
  <rect x="12" y="27" width="38" height="4" rx="2" fill="currentColor"/>
  <rect x="12" y="35" width="70" height="3" rx="1.5" fill="#d1d5db"/>
  <g stroke="currentColor" stroke-width="0.8" stroke-dasharray="3 2">
    <line x1="12" y1="46" x2="108" y2="46"/><line x1="12" y1="78" x2="108" y2="78"/>
    <line x1="12" y1="112" x2="108" y2="112"/>
  </g>
  <g fill="currentColor">
    <rect x="12" y="52" width="20" height="4" rx="2"/><rect x="12" y="84" width="20" height="4" rx="2"/>
    <rect x="12" y="118" width="20" height="4" rx="2"/>
  </g>
  <g fill="#d1d5db">
    <rect x="42" y="52" width="66" height="3" rx="1.5"/><rect x="42" y="59" width="60" height="3" rx="1.5"/>
    <rect x="42" y="66" width="48" height="3" rx="1.5"/>
    <rect x="42" y="84" width="66" height="3" rx="1.5"/><rect x="42" y="91" width="56" height="3" rx="1.5"/>
    <rect x="42" y="98" width="62" height="3" rx="1.5"/>
    <rect x="42" y="118" width="30" height="3" rx="1.5"/>
    <rect x="42" y="125" width="30" height="3" rx="1.5"/>
  </g>
  <g fill="currentColor">
    <rect x="86" y="118" width="4" height="1.4"/><rect x="91" y="118" width="4" height="1.4"/><rect x="96" y="118" width="4" height="1.4"/>
    <rect x="101" y="118" width="4" height="1.4" opacity="0.35"/>
    <rect x="86" y="125" width="4" height="1.4"/><rect x="91" y="125" width="4" height="1.4"/>
    <rect x="96" y="125" width="4" height="1.4" opacity="0.35"/><rect x="101" y="125" width="4" height="1.4" opacity="0.35"/>
  </g>
</svg>`

export default svg
