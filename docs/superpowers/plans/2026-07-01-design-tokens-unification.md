# Design Tokens Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every scattered inline `font-size:Npx` and hardcoded warning/success/danger/muted hex color across `public/index.html`, `public/styles.css`, and `public/wizard-doc.js` with the approved semantic tokens, so every tool panel shares one visual criterion.

**Architecture:** Pure value substitution — no HTML structure, JS logic, or layout changes. Add the new tokens to the existing `:root` block in `styles.css`, then mechanically replace old values with `var(--token-name)` in all three files using exact string matches (verified with `grep` before and after each task).

**Tech Stack:** Plain CSS custom properties, static HTML, vanilla JS (no build step, no test framework — this repo has none for the frontend, so verification here is grep-based value checks plus a manual visual pass, not unit tests).

## Global Constraints

- No layout, HTML structure, or JS behavior changes — visual values only.
- Font-size scale is fixed at 6 steps: `--fs-sm:12px`, `--fs-md:14px`, `--fs-base:15px`, `--fs-lg:16px`, `--fs-xl:22px`, `--fs-2xl:28px`.
- New color tokens: `--warn-d:#92400e`, `--code-bg:#f8fafc`, `--code-text:#1e293b`. Reused existing tokens: `--muted:#636768`, `--green:#059669`/`--green-l:#ECFDF5`, `--red:#c42e2c`/`--red-l:#fdf3f3`, `--warn:#D97706`/`--warn-l:#FFFBEB`.
- Exception (do NOT touch): the V3 version tag override `background:#dcfce7;color:#166534` on `.vf-tag` in `wizard-doc.js` — categorical V3/V4 distinction, not a semantic state color.
- Exception (do NOT touch): decorative one-off icon sizes `34px` (`.ok-icon`), `36px` (`.act-icon`), `56px` (Próximamente emoji in `index.html`).
- Exception (do NOT touch): any hex not explicitly listed in this plan's mapping tables (e.g. `#9a9a9a`, `#f0bcbc`, plain `#fff`/`#f5f5f5`) — out of scope, not part of the catalogued drift.
- Spec reference: `docs/superpowers/specs/2026-07-01-design-tokens-unification-design.md`

---

### Task 1: Add new tokens to `:root` in styles.css

**Files:**
- Modify: `public/styles.css:2-9`

**Interfaces:**
- Produces: CSS custom properties `--fs-sm`, `--fs-md`, `--fs-base`, `--fs-lg`, `--fs-xl`, `--fs-2xl`, `--warn-d`, `--code-bg`, `--code-text`, consumed by Tasks 2–7.

- [ ] **Step 1: Confirm current `:root` block**

Run: `sed -n '2,9p' public/styles.css`
Expected output:
```
:root{
  --blue:#c42e2c;--blue-h:#9e2423;--blue-l:#fdf3f3;
  --green:#059669;--green-l:#ECFDF5;
  --red:#c42e2c;--red-l:#fdf3f3;
  --warn:#D97706;--warn-l:#FFFBEB;
  --text:#121418;--muted:#636768;--border:#c6c7c7;--bg:#f2f2f2;
  --r:12px;--shadow:0 8px 40px rgba(18,20,24,.14)
}
```

- [ ] **Step 2: Add the new tokens**

Edit `public/styles.css`, replacing:
```css
  --text:#121418;--muted:#636768;--border:#c6c7c7;--bg:#f2f2f2;
  --r:12px;--shadow:0 8px 40px rgba(18,20,24,.14)
}
```
with:
```css
  --text:#121418;--muted:#636768;--border:#c6c7c7;--bg:#f2f2f2;
  --r:12px;--shadow:0 8px 40px rgba(18,20,24,.14);
  --warn-d:#92400e;--code-bg:#f8fafc;--code-text:#1e293b;
  --fs-sm:12px;--fs-md:14px;--fs-base:15px;--fs-lg:16px;--fs-xl:22px;--fs-2xl:28px
}
```

- [ ] **Step 3: Verify the tokens exist**

Run: `grep -c -- "--fs-sm\|--fs-2xl\|--warn-d\|--code-bg\|--code-text" public/styles.css`
Expected: `1` (all five appear on the same added line, so the single-line match count is 1 — this just confirms the line was inserted; a `grep -o` count would show 5)

Run: `grep -o -- "--fs-sm\|--fs-md\|--fs-base\|--fs-lg\|--fs-xl\|--fs-2xl\|--warn-d\|--code-bg\|--code-text" public/styles.css | sort -u | wc -l`
Expected: `9`

- [ ] **Step 4: Commit**

```bash
git add public/styles.css
git commit -m "Add font-size and color design tokens to :root"
```

---

### Task 2: Migrate styles.css font-size values to tokens

**Files:**
- Modify: `public/styles.css` (all rules below `:root`)

**Interfaces:**
- Consumes: tokens from Task 1.

- [ ] **Step 1: Baseline check — count raw pixel font-sizes to replace**

Run: `grep -oE "font-size:(10|11|12|13|14|15|16|18|22|25|28)px" public/styles.css | sort | uniq -c`
Expected: non-zero counts for each of `10,11,12,13,14,15,16,18,22,25,28` (matches the inventory: `.ptitle` is 25px, `.ccard-title` is 28px, etc.)

- [ ] **Step 2: Replace every `10px`/`11px`/`12px`/`13px` font-size with `--fs-sm`**

For each of these exact selectors in `public/styles.css`, replace the raw px value with `var(--fs-sm)`:
- `.ccard-badge{...font-size:10px...}`
- `.vf-tag{...font-size:10px...}`
- `.vf-errors{font-size:11px...}`
- `.casing-item-label code{...font-size:11px}`
- `.gen-out{font-size:11px...}`
- `.cres{...font-size:12px...}`
- `.casing-group-hd{font-size:12px...}`
- `.casing-item-label{font-size:12px...}`
- `.casing-opt{...font-size:12px...}`
- `.exec-sub{font-size:12px...}`
- `.param-f label{...font-size:12px...}`
- `.param-f textarea{...font-size:12px...}`
- `.btn-sm{...font-size:12px}`
- `.btn-pill{...font-size:12px...}`
- `.pinput{...font-size:12px...}`
- `.svc-row{...font-size:13px}`

- [ ] **Step 3: Replace every `14px` font-size with `--fs-md`**

Selectors: `.pw-btn`, `.sg-svc-group-name`, `.sg-mtd-item`, `.sg-chk-lbl`, `.exec-lbl`.

- [ ] **Step 4: Replace every `15px` font-size with `--fs-base`**

Selectors: `.sdot`, `.sdot-lb`, `.psub`, `.ccard-desc`, `.field label`, `.field input,.field select`, `.field .hint`, `.add-btn`, `.btn`, `.casing-modal p`, `.close-hint`, `.gen-row`, `.param-card-hd`, `.param-f input`, `.wf-handle`, `.sql-out`.

- [ ] **Step 5: Replace `16px` and `18px` font-size with `--fs-lg`**

Selectors: `.wiz-hd-title`, `.gen-ic`, `.casing-modal h3` (16px); `.svc-rm`, `.pin-rm` (18px — consolidating into the `--fs-lg` step, per approved scale).

- [ ] **Step 6: Replace `22px` font-size with `--fs-xl`**

Selector: `.ok-panel h2`.

- [ ] **Step 7: Replace `25px` and `28px` font-size with `--fs-2xl`**

Selectors: `.ptitle` (25px → consolidated into the 28px step, per approved scale — collapses two near-identical "big heading" sizes into one), `.ccard-title` (28px).

- [ ] **Step 8: Verify no raw pixel font-sizes remain outside the decorative exceptions**

Run: `grep -oE "font-size:[0-9]+px" public/styles.css`
Expected: only `font-size:34px` (`.ok-icon`) and `font-size:36px` (`.act-icon`) remain — every other line uses `var(--fs-*)`.

- [ ] **Step 9: Commit**

```bash
git add public/styles.css
git commit -m "Migrate styles.css font-sizes to design tokens"
```

---

### Task 3: Migrate styles.css color hex values to tokens

**Files:**
- Modify: `public/styles.css`

**Interfaces:**
- Consumes: tokens from Task 1.

- [ ] **Step 1: Baseline check**

Run: `grep -n "#16a34a\|#b45309\|#6b7280\|#f8fafc\|#1e293b\|#F59E0B" public/styles.css`
Expected: 6 matching lines (`.vf-item.ok`, `.vf-item.err .vf-name`, `.vf-errors`, `.sql-out` background, `.sql-out` color, `.exec-toggle` border).

- [ ] **Step 2: Replace each hex with its token**

- `.vf-item.ok{color:#16a34a}` → `color:var(--green)`
- `.vf-item.err .vf-name{color:#b45309;...}` → `color:var(--warn-d);...`
- `.vf-errors{font-size:var(--fs-sm);color:#6b7280;...}` → `color:var(--muted);...`
- `.sql-out{...background:#f8fafc;...color:#1e293b;...}` → `background:var(--code-bg);...color:var(--code-text);...` (note: `.sql-out` declares `color:#1e293b` before `background:#f8fafc` in source order — replace both, order doesn't matter)
- `.exec-toggle{...border:1.5px solid #F59E0B}` → `border:1.5px solid var(--warn)`

- [ ] **Step 3: Verify none of the catalogued hexes remain**

Run: `grep -c "#16a34a\|#b45309\|#6b7280\|#f8fafc\|#1e293b\|#F59E0B" public/styles.css`
Expected: `0`

- [ ] **Step 4: Commit**

```bash
git add public/styles.css
git commit -m "Migrate styles.css hardcoded colors to design tokens"
```

---

### Task 4: Migrate index.html inline font-size values to tokens

**Files:**
- Modify: `public/index.html`

**Interfaces:**
- Consumes: tokens from Task 1 (styles.css already loaded via `<link>` in `index.html`, so `var(--fs-*)` works directly in inline `style` attributes).

- [ ] **Step 1: Baseline check**

Run: `grep -oE "font-size:[0-9]+px" public/index.html | sort | uniq -c`
Expected: `6` at `12px`, `4` at `17px`, `4` at `13px`, `4` at `11px`, `1` at `56px`, `1` at `15px`.

- [ ] **Step 2: Replace `11px`, `12px`, `13px` inline font-sizes with `var(--fs-sm)`**

Applies to: the `db-hist-sel` select (13px), `db-hist-del` button (12px), the "(opcional)" hint span (11px), `conn-name-res` div (11px), `doc-errores-fields` hint paragraph (11px), `sg-svc-loading` div (12px), `val-path` input (13px), `val-output` div (12px), `valSelectAll` buttons x2 (12px), `btn-fix-selected` button (12px), `fix-output` pre (11px).

- [ ] **Step 3: Replace the 4 action-card title `17px` inline styles with `var(--fs-2xl)`**

The 4 `<span class="ccard-title" style="font-size:17px;display:block;margin-bottom:6px">` for "Documentar", "Generar Scripts", "Validar Documentos", "Generar Casos de Prueba" all change `font-size:17px` → `font-size:var(--fs-2xl)`. This unifies them with `.ccard-title`'s existing 28px (`--fs-2xl`) — today these 4 titles render smaller than the V3/V4 card titles despite being the same visual role, which is exactly the drift reported.

- [ ] **Step 4: Replace the remaining `15px` inline font-size with `var(--fs-base)`**

Applies to: the "Próximamente" label div in the Collections panel.

- [ ] **Step 5: Verify**

Run: `grep -oE "font-size:[0-9]+px" public/index.html`
Expected: only `font-size:56px` remains (the Próximamente emoji, decorative exception).

- [ ] **Step 6: Commit**

```bash
git add public/index.html
git commit -m "Migrate index.html inline font-sizes to design tokens"
```

---

### Task 5: Migrate index.html inline color hex values to tokens

**Files:**
- Modify: `public/index.html`

**Interfaces:**
- Consumes: tokens from Task 1.

- [ ] **Step 1: Baseline check**

Run: `grep -n "#dc2626\|#fee2e2\|#fca5a5\|#f59e0b" public/index.html`
Expected: 1 line for the `db-hist-del` button (`#fee2e2`, `#fca5a5`, `#dc2626` all in one `style` attribute) and 1 line for the `btn-fix-selected` button (`#f59e0b`).

- [ ] **Step 2: Replace `db-hist-del` button colors**

`background:#fee2e2;color:#dc2626` → `background:var(--red-l);color:var(--red)`
`border:1px solid #fca5a5` → `border:1px solid var(--red)`

- [ ] **Step 3: Replace `btn-fix-selected` button background**

`background:#f59e0b` → `background:var(--warn)` (the `color:#fff` next to it stays — that's literal white text for contrast, not a semantic token).

- [ ] **Step 4: Verify**

Run: `grep -c "#dc2626\|#fee2e2\|#fca5a5\|#f59e0b" public/index.html`
Expected: `0`

- [ ] **Step 5: Commit**

```bash
git add public/index.html
git commit -m "Migrate index.html inline colors to design tokens"
```

---

### Task 6: Migrate wizard-doc.js font-size values to tokens

**Files:**
- Modify: `public/wizard-doc.js`

**Interfaces:**
- Consumes: tokens from Task 1. `wizard-doc.js` runs in the browser alongside `styles.css`, so `var(--fs-sm)` works the same as in `index.html`.

- [ ] **Step 1: Baseline check**

Run: `grep -oE "font-size:[0-9]+px" public/wizard-doc.js | sort | uniq -c`
Expected: `16` at `12px`, `10` at `11px`, `9` at `10px`, `2` at `13px` — 37 total, all collapsing into `--fs-sm` per the approved scale (no 14/15/16/17px values exist in this file today).

- [ ] **Step 2: Replace every `10px`, `11px`, `12px`, `13px` font-size with `var(--fs-sm)`**

Every occurrence of `font-size:10px`, `font-size:11px`, `font-size:12px`, `font-size:13px` in this file becomes `font-size:var(--fs-sm)`. There is no other font-size value in `wizard-doc.js` to disambiguate against, so this is a safe global replace per literal value (do it as 4 separate `replace_all` passes, one per literal string, not one merged regex, to keep each substitution independently verifiable).

- [ ] **Step 3: Verify**

Run: `grep -oE "font-size:[0-9]+px" public/wizard-doc.js`
Expected: no output (0 matches).

Run: `grep -c "font-size:var(--fs-sm)" public/wizard-doc.js`
Expected: `37`

- [ ] **Step 4: Commit**

```bash
git add public/wizard-doc.js
git commit -m "Migrate wizard-doc.js font-sizes to design tokens"
```

---

### Task 7: Migrate wizard-doc.js color hex values to tokens

**Files:**
- Modify: `public/wizard-doc.js`

**Interfaces:**
- Consumes: tokens from Task 1.

- [ ] **Step 1: Baseline check**

Run: `grep -n "#9a3412\|#92400e\|#fff7ed\|#b45309\|#9ca3af\|#78350f\|#16a34a\|#fffbeb\|#fde68a\|#fcd34d\|#fdba74" public/wizard-doc.js`
Expected: matches at lines ~78-88 (the warnings-summary block), ~658 (`Generado` badge), ~686/692 (validation-error boxes). Confirm `#166534` and `#dcfce7` (the V3 tag, lines ~1387) are **not** in this list — they must stay untouched.

- [ ] **Step 2: Replace the warnings-summary block colors** (around line 78-88)

- `background:#fffbeb;border:1px solid #fcd34d` → `background:var(--warn-l);border:1px solid var(--warn)`
- `color:#92400e` → `color:var(--warn-d)` (appears twice: the summary heading and inline in the `<li>` template)
- `background:#fde68a;color:#92400e` (the "tabla" chip) → `background:var(--warn-l);color:var(--warn-d)`
- `color:#78350f` → `color:var(--warn-d)`
- `color:#b45309` → `color:var(--warn-d)`

- [ ] **Step 3: Replace the "Generado" success badge color** (around line 658)

`color:#16a34a` → `color:var(--green)`

- [ ] **Step 4: Replace the two validation-error box colors** (around lines 686 and 692)

Both occurrences of `background:#fff7ed;border:1px solid #fdba74;...color:#9a3412` → `background:var(--warn-l);border:1px solid var(--warn);...color:var(--warn-d)`

- [ ] **Step 5: Replace `#9ca3af`**

`color:#9ca3af` → `color:var(--muted)`

- [ ] **Step 6: Verify the catalogued hexes are gone, and the V3 tag exception survived untouched**

Run: `grep -c "#9a3412\|#92400e\|#fff7ed\|#b45309\|#9ca3af\|#78350f\|#16a34a\|#fffbeb\|#fde68a\|#fcd34d\|#fdba74" public/wizard-doc.js`
Expected: `0`

Run: `grep -n "#166534\|#dcfce7" public/wizard-doc.js`
Expected: 1 line, unchanged — `<span class="vf-tag" style="background:#dcfce7;color:#166534">V3</span>` (this must still be there; it is the documented exception, not a bug).

- [ ] **Step 7: Commit**

```bash
git add public/wizard-doc.js
git commit -m "Migrate wizard-doc.js hardcoded colors to design tokens"
```

---

### Task 8: Full-sweep verification and visual check

**Files:**
- None modified — verification only.

- [ ] **Step 1: Run the complete grep sweep across all three files**

Run:
```bash
grep -rnE "font-size:(10|11|12|13|14|15|17|18|25)px" public/index.html public/styles.css public/wizard-doc.js
grep -rn "#9a3412\|#92400e\|#b45309\|#9ca3af\|#78350f\|#16a34a\|#dc2626\|#fee2e2\|#fca5a5\|#F59E0B\|#f59e0b\|#6b7280\|#f8fafc\|#1e293b" public/index.html public/styles.css public/wizard-doc.js
```
Expected: no output from either command (0 matches). `34px`, `36px`, `56px` font-sizes and `#166534`/`#dcfce7` (V3 tag) are expected to still show up if you grep for those specifically — they are documented exceptions, not failures.

- [ ] **Step 2: Start the app and visually compare all 4 tools**

Run: `node setup.js` (serves on `http://localhost:3777`, reads files fresh per request — refresh the browser tab after each earlier task if checking incrementally).

Open the app and step through: Documentar, Generar Scripts, Validar Documentos, Generar Casos de Prueba, plus the casing-resolution modal (trigger by validating a doc with a casing mismatch, or open `p4v` and run a validation that surfaces one). Confirm:
- All 4 action-card titles ("Documentar" / "Generar Scripts" / "Validar Documentos" / "Generar Casos de Prueba") now render at the same size as the V3/V4 card titles.
- Warning boxes (validation errors, "no se pudo validar", advertencias) and the amber "Corregir seleccionados" button all share one consistent amber tone.
- The `db-hist-del` "Eliminar" button and any delete-styled UI share one consistent red tone with the rest of the app's error/danger styling.
- No panel looks broken, misaligned, or has unreadable/invisible text.

- [ ] **Step 3: Final commit (only if Step 2 required fixes)**

If Step 2 surfaced any visual regression, fix it, re-run Step 1's grep sweep, then:
```bash
git add public/index.html public/styles.css public/wizard-doc.js
git commit -m "Fix visual regressions found during design-token verification pass"
```
If Step 2 found nothing to fix, skip this step — Task 7's commit is the final one.
