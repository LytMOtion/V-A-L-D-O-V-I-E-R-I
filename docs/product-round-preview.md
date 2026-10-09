# Product round Preview operation

Authorized target is Vercel Preview only. Production branch main and original deployment remain unchanged; no merge or promotion is authorized. Branch visual/product-round-2026-10-09 is isolated from clean rejected checkpoint 15c79585.

Build produces the collection page and six product/color routes with selected images, color, inquiry subject and Private Access context. Preview forms validate locally and report the selected piece/color without a network submission. Existing production Formspree behavior is exercised only with mocks.

Verification: npm run lint; npm test (builds first, ten meaningful tests). Additional actual desktop/mobile browser checks and two independent reviews are required for the final frozen commit/deployment. Native-resolution gallery opens a modal for useful textile inspection and supports Close/Escape/focus return. Content is visible immediately; no scroll reveal dependency.
