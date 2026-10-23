/** Raw inline SVG so `currentColor` resolves to the accent (see modern/thumbnail.ts). */
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160">
  <rect width="120" height="160" fill="#fff"/>
  <rect width="40" height="160" fill="currentColor" opacity="0.92"/>
  <circle cx="20" cy="26" r="11" fill="#fff" opacity="0.85"/>
  <g fill="#fff" opacity="0.75">
    <rect x="7" y="48" width="26" height="3" rx="1.5"/>
    <rect x="7" y="56" width="20" height="3" rx="1.5"/>
  </g>
  <g fill="#fff">
    <rect x="7" y="76" width="18" height="3" rx="1.5" opacity="0.75"/>
    <rect x="7" y="84.5" width="4" height="3" rx="0.8"/><rect x="12" y="84.5" width="4" height="3" rx="0.8"/><rect x="17" y="84.5" width="4" height="3" rx="0.8"/>
    <rect x="22" y="84.5" width="4" height="3" rx="0.8" opacity="0.35"/><rect x="27" y="84.5" width="4" height="3" rx="0.8" opacity="0.35"/>
    <rect x="7" y="94" width="18" height="3" rx="1.5" opacity="0.75"/>
    <rect x="7" y="102.5" width="4" height="3" rx="0.8"/><rect x="12" y="102.5" width="4" height="3" rx="0.8"/>
    <rect x="17" y="102.5" width="4" height="3" rx="0.8" opacity="0.35"/><rect x="22" y="102.5" width="4" height="3" rx="0.8" opacity="0.35"/><rect x="27" y="102.5" width="4" height="3" rx="0.8" opacity="0.35"/>
  </g>
  <rect x="50" y="18" width="54" height="7" rx="2" fill="#1f2937"/>
  <rect x="50" y="30" width="34" height="4" rx="2" fill="currentColor"/>
  <rect x="50" y="46" width="30" height="4" rx="2" fill="currentColor"/>
  <rect x="54" y="58" width="1.5" height="82" fill="currentColor" opacity="0.4"/>
  <g fill="currentColor">
    <circle cx="54.8" cy="62" r="3"/><circle cx="54.8" cy="92" r="3"/><circle cx="54.8" cy="120" r="3"/>
  </g>
  <g fill="#d1d5db">
    <rect x="62" y="59" width="42" height="4" rx="2"/>
    <rect x="62" y="67" width="40" height="3" rx="1.5"/>
    <rect x="62" y="74" width="34" height="3" rx="1.5"/>
    <rect x="62" y="89" width="42" height="4" rx="2"/>
    <rect x="62" y="97" width="40" height="3" rx="1.5"/>
    <rect x="62" y="117" width="42" height="4" rx="2"/>
    <rect x="62" y="125" width="36" height="3" rx="1.5"/>
  </g>
</svg>`

export default svg
