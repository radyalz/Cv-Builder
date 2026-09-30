# Styles — notes moved out of `src/styles/`

The comments that used to sit in the stylesheets, kept per file with the rule each one explained.

## `a11y.css`

- -------- Accessibility menu --------
- `.card-top` — The eyebrow sits close above the name, as one heading block.
- `.a11y-trigger` — A frosted-glass disc like the card, with the icon in the accent and a faint accent ring. Hovered, focused or open, it fills with the accent.
- `right: 20px;` — Bottom right in both page languages, so it never moves under the visitor's thumb when they switch to Persian.
- `body.preview-open .a11y-trigger` — Out of the way while the preview fills the window.
- `.a11y-trigger svg` — The figure turns a quarter as the menu opens.
- `transform-origin: 100% 100%;` — Opens and closes with a Web Animation in prefs.js (fade, slide from below, grow from the button's corner); the origin here is only the fallback until it is measured.
- `.font-grid` — Each font option is set in its own face, so the menu is the sample.
- `.font-grid[data-a11y="fa-font"]` — Four Persian fonts sit better as two by two.
- The menu grew with the font pickers; short screens scroll it.
- `.a11y-menu` — Never taller than the room above the accessibility button (52px, 20px from the bottom, 46px and 14px on phones), so it opens above it instead of running down behind it; anything more scrolls.
- `.segment[data-fs="0.9"] { font-size: 12px; }` — the size buttons show their own size, so they are exempt from --fs
- `.reset-icon` — -------- Reset icons -------- A plain reload icon, explained by its tooltip: in the card's top corner it resets the CV options, in the accessibility menu's title row the page settings. Faded when there is nothing to reset.
- `.reset-icon:hover:not(:disabled) svg` — A little turn backwards on hover, like the arrow it draws.
- `.reset-top` — Reset's tablet and phone form: an icon in the CV options menu's header (see responsive.css).
- `.page-shell` — -------- Admiring the background --------
- `.admire-toggle` — The eye button: the way back to the card. Hidden until the background is being admired, then it grows and fades in, beside the accessibility button (above it on phones), filled with the accent.
- `.admire-toggle` — Centred over the 46px accessibility button, 20px from the edge.
- `.wallpaper-toggle` — -------- Saving the background -------- The download button beside the eye (above it on phones) while admiring, and its menu: an image, or a video of 15 to 30 seconds. While a video records, a ring around the button fills with its progress.
- `.install-button` — -------- Installing the app -------- Under Admire in the accessibility menu, only where the site can be installed; on iPhones and iPads it shows the steps below it.
- `.install-offer` — The install offer: bottom-left, clear of the accessibility button in the other corner. It rises in like the How it works popover, stays 30 seconds (the bar along its bottom runs down; hovering or focusing it holds the time) and sinks back out. Out of the way while the preview is expanded or the background admired.
- `.install-offer-time` — The 30 seconds, running down along the bottom edge.

## `actions.css`

- `.actions` — -------- Actions and status --------
- `.secondary-link` — A quiet, tonal button: it leaves the page, so it carries an outbound arrow and stays a step below the two main actions.
- `.build-panel,` — A build's progress sits on the preview itself: a glass strip along the bottom of the preview frame (see .build-status in preview.css), which grows in and shrinks away (builder.js animates it).
- Desktop puts "All published copies" on its own line under the two main buttons; tablets keep all three in a row (responsive.css).
- `.actions` — The break sits on a line of its own, which would put the row gap in twice, so the rows have none: All published copies sets its own 10px under the two main buttons.
- `.action-split` — -------- Split button (tablets and phones) -------- Under 1024px the three actions above are replaced by one row: the main part performs the chosen action (see action-menu.js), the caret opens the menu to choose it. The three originals stay in the page, hidden, because the split button relays to them and mirrors their state.
- `.card-main .actions` — Hidden but kept: still clickable from script, out of sight, out of the tab order and the layout.
- `.split-toggle` — The caret half: a hairline divider and a slightly deeper shade.
- `.action-menu` — The menu of actions.

## `buttons.css`

- `.download-button` — -------- Download button --------
- `.primary-button,` — -------- Ripple -------- A material-style ink ripple from the point of the press.

## `card.css`

- `.page-shell` — -------- Shell and card --------
- `:root[data-theme="light"] .builder-card` — Light glass: a bright sheen across the top, a white rim catching the light, and a hairline outside it so the edge still reads.
- `.controls` — -------- Controls --------
- `.control-reset` — "Reset" ends the row, level with the controls it resets and styled like them: a field-coloured button with a reload icon that turns on hover.
- `:root[lang="fa"] .control-label` — Persian form labels a size up: at the English size they are hard to read.
- `.segmented` — The outline is an inset shadow rather than a border, so the selected option paints over it and fills the group right to its rounded edge instead of sitting inside a dark 1px frame.
- `.segment[lang="fa"]` — Persian letters sit visibly smaller than Latin at the same size.

## `fonts.css`

- `@font-face` — -------- Fonts -------- All self-hosted, and every family is limited to its own script with unicode-range, so one stack serves both page languages: Latin comes from the English font and Persian from the Persian one, each chosen in the accessibility menu. Families carry a "CV" prefix so a copy installed on the visitor's machine is never picked up instead.
- `@font-face` — Persian faces: light for running text, up to each family's heaviest for titles (Yekan Bakh's "Fat", Doran's ExtraBold). Each family draws its letters at a different size (the body of the letters, as in ه م ن س, is 0.40 em tall in Yekan Bakh, 0.42 in Vazirmatn, 0.43 in XB Niloofar and 0.48 in Doran) and reserves different room above and below them, so size-adjust brings every one to the same body height (0.48 em, which sits right beside Inter) and the metric overrides give them all the same line box. Switching the Persian font, or between Persian and English, then keeps text the same size and spacing.

## `main.css`

- `@import "./fonts.css";` — Radman Alizadeh - CV Builder The page is a single non-scrolling viewport: one card, sized to fit. The partials are imported in cascade order: later files override earlier ones, and the responsive rules come last on purpose.

## `menus.css`

- `.menu` — -------- Colour menu (positioned against its trigger) --------

## `preview.css`

- `.card-preview` — -------- Preview --------
- `@media (min-width: 1001px)` — Side by side, the preview is a little taller than the controls' column alone would make it.
- `.pdf-view` — The PDF viewer (src/lib/pdf-view.js): pages stacked in a scrolling box, each a canvas with the document's links laid over it.
- `scrollbar-gutter: stable;` — The scrollbar's room is kept from the start, so it appearing never narrows the box and knocks fit-to-width off by a few pixels.
- `.pdf-page` — Auto margins centre a page narrower than the box without clipping one that is wider, which align-items: center would.
- `.pdf-view.is-hinting .pdf-link` — Lit up for a moment so readers see what can be clicked.
- `.links-hint` — "9 clickable links": a small accent pill under the preview and in the grown card's bar.
- `.preview-frame` — -------- Loading skeletons -------- A page-shaped placeholder that shimmers until the PDF has loaded, in the accent colour so it already looks like the CV it stands in for.
- `background: var(--sk-page);` — % here: cqw inside the root would measure the viewport
- `.preview-meta.is-loading` — The date line under the preview, while the listing loads.
- `.preview-state` — The note on the skeleton when there is no copy to show yet.
- `.preview-foot` — With no copy to show, the footer fades out but keeps its room.
- -------- Expanded preview -------- The card itself grows. Everything else in it fades out first, then the card (fixed, animated from its own rectangle by builder.js) grows to just inside the window with the PDF filling it, and the bar with the title, download and close fades in last. The glass never switches off, so nothing jumps.
- `.card-main,` — The text column leaves away from the preview: it fades as it slides toward the far side (left in English, right in Persian, where the layout is mirrored), and comes back the same way when the card shrinks. The preview's own header and footer just fade.
- `.builder-card.is-expanded.is-growing [data-pinned]` — While the card grows or shrinks, the parts that are fading stay on screen at the place they hold in the small card (set by builder.js).
- `.expanded-bar` — The expanded bar is two glass pills floating over the PDF, on every size: the copy's title and publish date at the top, the tools at the bottom. Desktop keeps the zoom level and full labels, tablets short labels, and phones icons only.
- `.expanded-actions` — Centred contents: while the pill stretches or shrinks to a new width (morph.js), its tools stay where they are.
- `.expanded-info` — The title pill is frosted, so the page shows through it.
- `.info-toggle,` — Only used on the narrowest screens (see the media queries below).
- `.info-details,` — The small dropdowns of the bar: the copy's details under the title pill, and the fit and zoom pickers above the tools. They open with a short rise and fade, and are out of reach (and of the tab order) while closed.
- `.bar-picker` — The pickers are upright pills of round icon buttons, stacked above the button that opens them and as wide as it. They grow up out of it: revealed from the bottom while rising the last few pixels, and fold back down into it when closed.
- `.zoom-menu` — Zoom in on top, zoom out under it.
- `.expanded-bar .ghost-button,` — Everything in the tools pill is one height: buttons, icon buttons and the links pill.
- `.pdf-tools` — Fit and zoom, as small outlined icon buttons.
- `.builder-card.is-expanded .pdf-view` — Room above and below the pages for the two pills, so nothing is hidden for good: the view opens scrolled to the paper's top (see builder.js).
- `@media (max-width: 1023px)` — Tablets and phones: a tighter frame; the zoom level and link count go, and Download and Close keep short labels.
- `.bar-button span` — Short labels, cut with an ellipsis if room runs out.
- `.expanded-info .preview-meta` — Narrow: the date gives way first if the title pill runs out of room.
- `@media (max-width: 399px)` — Under 400px the title pill keeps only the coloured title and a caret; the whole pill opens the details below it.
- `@media (max-width: 599px)` — Phones: zoom out and in fold behind one monocle button, which opens them as a small pill above the tools.
- `@media (max-width: 349px)` — Under 350px the two fit buttons become one picker the same way, its button showing the current fit.
- `.peek-hint` — -------- Phone peek -------- Under 600px the preview shows the top of page one fading out, with a chip saying it opens; tapping anywhere on it grows the card to full screen, where it scrolls and zooms as usual.
- `.builder-card:not(.is-expanded) .peek-hint:not([hidden])` — Centred by its margins, not left: 50%, which would leave it only half the preview's width to fit in (and wrap it onto two lines on narrow phones); it stays on one line.
- `.preview-error` — -------- Preview could not be fetched --------
- `.build-status` — -------- Build progress on the preview --------
- `.preview-frame:has(.build-status > section:not([hidden])) .peek-hint` — The status stands in for the tap hint while it shows.

## `responsive.css`

- -------- Layout by screen size -------- Desktop, 1024px and up: controls and preview side by side. Tablet, 600 to 1023px: stacked, the preview filling all the height left under the controls, scrollable, with its footer and Expand. Phone, under 600px: stacked, the preview a peek at the top of page one that grows to full screen when tapped. Phones held sideways are short, so they keep the side-by-side layout.
- `@media (min-width: 1024px) and (max-width: 1279px)` — The narrow end of desktop: a slimmer preview column, so the controls (Reset included) stay on one line.
- `@media (min-width: 600px) and (max-width: 1023px)` — Tablets: Generate, Download and All published copies in one row of three equal cells, never wrapping; long labels are cut with an ellipsis rather than pushing a button onto a new line.
- `@media (max-width: 1023px)` — Tablets and phones: stacked, in a card of fixed height so the preview row has a definite size to fill.
- `.preview-foot` — The floating accessibility button sits over the card's bottom-right corner here; the preview's footer keeps clear of it.
- `@media (max-width: 1023px) and (orientation: landscape) and (max-height: 600px)` — Phones held sideways: too short to stack, so side by side again, with the controls scrolling if they must.
- `@media (max-width: 599px)` — -------- Phones -------- A calmer, roomier card: less blur than desktop with a little more tint, so the skulls show through without the text losing contrast. Controls sit on a grid (accent on its own row; edition, language and Reset below), every tap target full width.
- `.controls .control` — Each label sits on the top edge of its control, like an outlined field, instead of taking a line of its own above it.
- `.controls .control:first-child .control-label` — Accent keeps its label at the start of the edge, over the colour name; edition and language have theirs centred.
- `:root[lang="fa"] .controls .control-label` — Persian letters need a size more to read at this scale.
- `.actions` — Buttons sized for a thumb but no bigger: 42, 38 and 34px.
- `.preview-head` — The preview is a peek: the top of page one, fading out, that opens to full screen when tapped (see "peek-hint" in PreviewPane). Its date and buttons live in the grown view instead.
- `@media (max-width: 599px) and (max-height: 740px)` — Short phones: spacing tightens, leaving the preview peek room.
- `@media (max-width: 599px)` — Phones keep the lighter 4px blur in the light appearance too, with more white to make up for it.
- `:root[data-glass="flat"] body .builder-card` — -------- Flat frosted glass -------- For browsers without backdrop blur, and for devices the skull renderer finds too slow for it (both set data-glass="flat" on <html>). Instead of blurring what is behind, the card fakes frost: a denser tint, the same sheen and bright edge, a faint grain and a glow of the accent. Written without color-mix() so it also works in the older browsers it is for. Last in the cascade so it wins over every other card background.
- `.lead-tablet,` — -------- How it works -------- An info button at the end of the name's row opens the explanation for the controls on screen and the tour of them.
- `.title-row` — The name at the start of the row, the info button at its end.
- `@media (min-width: 1024px)` — On desktop the controls column scrolls, so it clips at its edge: the button keeps clear of it, leaving its ripples and swell room to show and some space before the preview.
- `.intro-text` — Easy to read: a comfortable size and line height, lines balanced so none ends on a lone word.
- `.tour` — -------- The tour -------- A ring of light on one part at a time, the rest of the page dimmed by the ring's own shadow, and a card beside it (src/scripts/tour.js).
- `.tour.is-light .tour-spot` — Over the background alone the dim is light, so it can be seen.
- `.tour-spot::after` — A soft pulse around the ring, so the eye finds it: the same 12px glow whatever the size of the part.
- `.intro-info` — Easy to spot: the accent's colour on a tint of it. On desktop and tablets it is a pill with its name; on phones, where the name needs the room, just the icon.
- `.intro-info.is-calling` — For the first 30 seconds (intro-info.js), the button calls for attention: it swells gently and sends out rings like ripples on water, two at a time. Hovering, focusing or opening it stops the call.
- `@keyframes info-ripple` — A ring that spreads 14px out and fades, whatever the button's size.
- `.forms-entry` — -------- Tablets and phones: the controls in a menu -------- One field shows the colour, edition and language chosen; it opens the controls in a menu, the way the accessibility button opens its own (src/scripts/forms-menu.js moves them in and out). Reset is the icon in the menu's header there.
- `.forms-entry` — The field's label sits on its top edge, like an outlined field.
- `.lead` — The short intro stays under the name, across the card's full width; the longer explanation is behind How it works.
- `@media (min-width: 600px) and (max-width: 1023px)` — Tablets: in the menu the three controls sit side by side, each filling its share of the row.
- `@media (max-width: 599px)` — Inside the menu there is room, so each control's label sits above it, as on larger screens, instead of on its edge.

## `skulls.css`

- -------- Skull field -------- One canvas drawn by src/lib/skulls.js: the skulls, their strike, laugh and drift. This only places it and fades it in once painted.
- `.tone-field` — The halftone under the skulls: fades in once drawn.
- `.skull-field.is-painted` — Set once the artwork has been drawn, so the field fades in rather than popping in after the page has already drawn.

## `tokens.css`

- `@property --fs` — Registered, so the browser can animate them: every font size is calc(<size> * var(--fs)), and --fa-small enlarges small Persian text, so easing these two eases all the text on the page at once when the text size or page language changes. Browsers that cannot register custom properties simply switch without the animation.
- `--fs: 1;` — text size chosen in the accessibility menu; every font-size scales by it
- `--fa-small: 1;` — An extra factor for small text on the Persian page. The Persian fonts are now matched to the English ones in fonts.css, so it is 1 in both languages; kept as a single place to nudge it if ever needed.
- `:root[data-theme="light"]` — -------- Light appearance -------- Chosen in the accessibility menu, or taken from the system setting.
- `body` — The page's colour: a gradient of the accent, strongest in the bottom corner where reading starts, with a weaker glow in the opposite top corner (the halftone dots in halftone.js follow the same shape). Near black in dark mode; in light mode, a light tint of the accent.
- `html` — Scrollbars in the chosen accent (inherited by every scrolling box).
- `::-webkit-scrollbar` — Browsers without scrollbar-color (older Safari) style them this way.
- `:root[lang="fa"] *` — -------- Persian page -------- Letter-spacing breaks the joins in Persian script, so it is dropped.
- `:root[lang="fa"]` — Persian type uses the full range of weights each font has: the name in its heaviest cut, headings and labels bold, the intro line light. Latin text on the page keeps its own weights.

## `tooltip.css`

- `.tooltip` — -------- Tooltips -------- Modelled on the ERD schema project's floating tooltip: a solid bubble in the page's own appearance (dark on dark, white on light) that follows the cursor on a spring and squashes a little in the direction it is moving (src/lib/tooltip.js drives the motion). Keyboard focus pins it to the control with an arrow instead. Each one carries a title, a line on what the control does and, where useful, the live details it acts on.
- `transition: visibility 0s linear 150ms;` — stays visible for the fade out
- `@media (hover: none)` — Holding a control on touch shows its tooltip; keep the browser's own long-press callout and text selection out of the way.
- `.touch-hint` — The one-off "press and hold" note on a first touch visit.
