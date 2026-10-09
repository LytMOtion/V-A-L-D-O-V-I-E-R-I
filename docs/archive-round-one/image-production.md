# VALDOVIERI image production evidence

Produced on the 2026-10-09 task context using the approved built-in `image_gen.imagegen` tool and the imagegen skill. Three primary concept assets form a coherent selection: landscape complete-look hero, full-body portrait companion, and a blank tonal cap base. A closer portrait variant and source-derived lighting study are retained as optional evidence.

No website files were edited by this specialist. Manual deliverable writes are confined to `evidence/image-production`; the built-in tool created its default originals in the task's `generated_images` folder. Selected outputs were copied without modification, and `cmp` returned exit code 0 for all five copies. No CLI/API fallback, Python raster editing, new credentials, purchases, subscriptions, focus changes, external form sends or pending approval requests occurred.

## Materialized assets

| File under `assets/` | Native pixels | Classification and use |
| --- | --- | --- |
| `valdovieri-hero-concept-v1.png` | 1536 × 1024 | Recommended landscape editorial concept; complete look, quiet copy space left |
| `valdovieri-fullbody-portrait-concept-v2.png` | 1122 × 1402 | Recommended portrait/mobile editorial concept; complete head-to-shoes fit |
| `valdovieri-blank-cap-concept-v1.png` | 1122 × 1402 | Recommended blank cap concept base; authentic native mark application remains separate |
| `valdovieri-halfzip-lighting-study-v1.png` | 1254 × 1254 | Optional AI-generated source-derived lighting study; not certified pixel-only exposure correction |
| `valdovieri-portrait-concept-v1.png` | 1122 × 1402 | Optional head-to-thigh story crop; superseded for a complete-look mobile hero |

The five exact prompts are in `prompts/01-hero.txt` through `prompts/05-fullbody-portrait.txt`. `provenance.json` records per-image tool, reference roles/paths, native generated path, saved copy, dimensions, SHA-256, classification, selection status and limitations. `SHA256SUMS.txt` records deliverables, prompts, all six source photographs and authentic Version 2 SVG/PNG.

## Source facts and boundaries

Personally inspected all six canonical JPGs before production. `vv-hero.jpg` and `vv-detail.jpg` show the same beanie still life and have identical SHA-256 hashes. `vv-overshirt.jpg` shows a black matte top on a black mannequin with a high collar, visible shoulder seams and a single silver HALF-ZIP ending on the chest. Its source crop does not verify lower sleeves, cuffs, waistband/hem, lining, pockets or material composition. The generated full look therefore deliberately carries an editorial-concept classification. Inferred cuffs and waistband/hem are never evidence of manufactured garment specifications.

Personally inspected authentic `evidence/original-icon/extracted/PNG/V Version 2.png` and read the matching SVG. Its genuine path geometry is preserved in the existing native file. The oversized embroidery visible in original `vv-cap.jpg` differs from that exact icon and is not accepted as a logo reference. The generated cap is intentionally blank. No mark was redrawn, approximated, generated, embossed or raster-composited by this specialist.

## Per-image visual QA

**Landscape hero — approved concept candidate.** Personally inspected the displayed generation at 1536 × 1024. Both shoes, head and full top/trouser silhouette remain in frame. Model posture has a supported forearm/ledge and believable crossed-feet balance, with coherent contact shadows and architecture perspective. Exposed right-hand fingers, partially occluded thumb, wrist, skin, jaw and ear look natural; the other hand is naturally in a trouser pocket. Collar, shoulders, chest-ending half-zip, cuffs, hem and cloth folds are readable. Black cloth remains matte and separates from cool-gray architecture. There is no headwear or fabricated logo. Quiet left wall is suitable for copy. Art direction independently inspected and approved this candidate, while explicitly recording the inferred rib cuff/waistband boundary.

**Full-body portrait v2 — approved concept candidate.** Personally inspected the saved native 1122 × 1402 image with `view_image` at original detail. Same face, dark hair, supported pose, black half-zip, charcoal trousers, black shoes and location visibly match the hero. Head and both shoes remain inside the frame, with air above and below; the model occupies roughly 84% of height. Right-hand anatomy appears plausible, shoulder and sleeve folds follow the pose, shoes contact the paving and the same matte fabric is exposed. Use the whole image or a crop that keeps head, hem and both shoes visible. A tight center `cover` crop can undermine the complete-look objective.

**Blank cap — approved concept base.** Personally inspected the saved native 1122 × 1402 image at original detail. Cap front is completely blank, with no ghost V, patch, graphic or invented text. Fine woven surface, tonal panel seams, eyelets, top button and curved brim remain readable under cool directional light. Brim/crown and all outer boundaries are inside the frame. Front has a slight three-quarter turn and a curved surface; a flat CSS/native SVG overlay is a digital application concept, not proof of physical embroidery. A small authentic mark may be placed around approximately x 46–48%, y 39–42% of the image, with careful visual adjustment by integration owner; keep its width restrained. If the projection looks unconvincing, retain the blank cap and use the exact mark adjacent in native UI.

**Source-derived half-zip lighting study — qualified derivative.** Personally inspected original and generated output. Visually retains normalized source framing, mannequin neck fitting, high collar, shoulder seam locations, chest-ending single silver zipper and upper-garment crop. Cloth is more readable, while black background and tonal character remain. The built-in tool resynthesizes pixels and changed native resolution; exact pixel, stitch, texture and hardware invariance cannot be certified. Do not call this a verified lighting-only correction or verified product photo. Keep `valdovieri-original/vv-overshirt.jpg` as canonical source. For exact source display preservation, the integration owner can use the untouched source with a reversible display exposure treatment instead of replacing its pixels.

**Closer portrait v1 — approved optional story concept.** Personally inspected the displayed 1122 × 1402 generation. Same model, location, clothing and light remain coherent with the hero. Fine cloth, collar, chest-ending zip and natural resting hand are clearly exposed. Its head-to-thigh crop is suited to a supporting editorial frame, while full-body v2 is the complete-look mobile companion.

## Integration handoff and remaining limits

Integration owner `/root` may convert/resize these actual saved PNGs to its planned `assets/look-wide.webp`, `assets/look-portrait.webp`, `assets/half-zip-study.webp` and `assets/cap-study.webp`, recording the derivative paths separately. Explicit concept labels must follow each generated asset, including the source-derived lighting study. The lower garment construction, model, trousers, footwear and cap application cannot establish physical product truth.

There is no image-production blocker or pending approval. Authentic native SVG application, final responsive crop checks and website integration remain the integration owner's work. Exact logo geometry has not been applied inside any raster; no logo-accuracy claim is made for a proposed cap application.
