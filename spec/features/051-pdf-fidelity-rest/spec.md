# 051 · What spec 050 left: Palatino, Tahoma, Verdana and soft shadows

**Status:** implemented ✅

## What it does

Spec 050 left two things out of the PDF download; both are now covered.

1. **Palatino, Tahoma and Verdana** went out in a PDF standard font. Now:
   - Tahoma and Verdana are drawn in **DejaVu Sans** (`@fontsource/dejavu-sans` 5.3.0 exact, OFL,
     installed with `--ignore-scripts`; Latin subset, 400 / 700 and italic 400). It is the wide humanist
     sans both are usually mapped to. Their stacks already named it, so the font select now marks them
     bundled, and the page itself can show DejaVu Sans where a computer has neither.
   - Palatino, Palatino Linotype and Book Antiqua are drawn in **Gelasio**, already bundled: no
     Fontsource package clones Palatino's metrics, and Gelasio (Georgia's widths) is closer to its
     width than Times is. No new dependency for that.
   - Every option of the font select now has a bundled face for the PDF (a unit test checks it).
2. **Soft box-shadows** (blurred) were dropped. They are now drawn as 24 nested translucent shapes
   placed where a Gaussian of σ = blur / 2 reaches each step of the opacity (`shadowLayers`), under
   the box, with the shadow's offset and spread. PDF has no blur, so this is an approximation:
   smooth enough for the page's soft shadows, with a faint stepped edge when zoomed in. Inset
   shadows are still not drawn, and the `fidelity` scan still flags them, with gradients, filters,
   text shadows, underlines, outlines, mixed corner radii and non-string generated content.

## Dead code to decide

Every font of the select now has a stand-in, so the "depends on each computer" note of the export
dialog (`systemFont` in `useCvExport`, `exportView.systemFontNote`) can no longer show for a font the
select offers. It stays for now (a font outside the list, or a future one without a stand-in); removing
it is a separate decision.

## Acceptance criteria

1. [x] Palatino, Tahoma, Verdana, Arial, Helvetica and Times New Roman are embedded in the PDF
   (checked on real downloads: Gelasio, DejaVu Sans, DejaVu Sans, Arimo, Arimo, Tinos).
2. [x] A soft shadow, a ring, an SVG disc and a round stroke ink the PDF as much as Chrome's print
   (`qa:pdf` look fixture, within 8 %; measured 3.5 %).

## Verification

- 651 unit tests (stand-ins for every option, the shadow layers, the outer-shadow parser, the
  export note), `vue-tsc`, `qa:pdf` 128/128 (new look fixture), `qa:e2e` 118/118, `qa:roundtrip`
  420/420, `qa:consistency` 10/10, `qa:security` 55/55.
