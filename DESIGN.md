# Climate Mythbusters design rules

## Current direction: Cut-paper club

Selected by the user on November 21, 2026. This supersedes the earlier blue-workbench styling decisions below: warm paper, black cut-out wordmark, yellow highlight, taped editor and red/blue cut-out category labels. Georgia is used for the heading and myth cards; editable fields and evidence keep a plain sans face. Evidence cards show small numbers; myth cards show matching evidence numbers without a myth number. Footers remain removed. The teacher key pairs full card text.

Content policy: preserve source myth/evidence wording. Newly written text is limited to essential interface labels, technical print guidance, validation and state feedback. Remove the earlier generated marketing, gameplay adaptations and discussion prompts. Do not add substantive teaching content without source text or explicit user approval.

Verified: six data tests, Pages assembly test, initial 36-card generation, 12 full-text answer mappings, zero card-ID/footer elements, desktop inspection and 360px layout without horizontal page overflow. The Google Doc transcription is unchanged. Saved-PDF rendering and physical output are not verified.

## Earlier synthesis and design history

This is the consolidated design contract for the card-builder app. It synthesizes the core rule sets and applicable supporting guidance of four systems, rather than installing four incompatible runtimes or copying a reference site's appearance. Retrieved 2026-11-21.

## Sources

- **I — Impeccable**: [core skill](https://github.com/pbakaus/impeccable/blob/main/.agents/skills/impeccable/SKILL.md), craft-floor, mode-operate, operate, typography, color and layout references. Contribution: deliberate identity, task-appropriate hierarchy, anti-template discipline and rendered verification.
- **A — apple-design by Emil Kowalski**: [full skill](https://github.com/emilkowalski/skills/blob/main/skills/apple-design/SKILL.md). Contribution: immediate feedback, agency, spatial continuity, typography, restrained motion and accessible materials. This is the apple-design implementation selected for this task; it is not an official Apple package.
- **T — Taste Skill**: [core skill](https://github.com/Leonxlnx/taste-skill/blob/main/skills/taste-skill/SKILL.md), copy, copy-voice, system and motion references. Contribution: coherent visual language, actual product content, concrete copy and cross-viewport quality checks.
- **V — Vercel Web Interface Guidelines**: [full guidelines](https://github.com/vercel-labs/web-interface-guidelines/blob/main/README.md). Contribution: web semantics, forms, keyboard support, state coverage, responsive resilience and performance.

## Priority and conflict resolution

User requirements and content truth come first, then accessibility and task completion, then predictable web behavior, then visual expression. Rules specific to operating an app outrank rules for advertising one. These are synthesis decisions, not claims that the sources agree.

| Conflict | Adopted rule and reason |
| --- | --- |
| T requires full-screen marketing sections, hero entrances and spectacle; I Operate rejects them | Editing starts in the first viewport. No marketing hero, section-height quotas, shaders, obligatory photographs or page-load choreography. |
| A favors translucent functional chrome; T requires opaque navigation | Opaque navigation and controls: text editing on classroom displays benefits from stable contrast. There is no overlapping layer that needs glass. |
| A favors springs for manipulation; V prefers CSS; T requires a motion kit | Native controls and short CSS press/state feedback. No gesture-driven components, so no spring library. If dragging is introduced, use pointer capture, velocity-aware interruptible springs, projected endpoints and keyboard alternatives. |
| I craft-floor rejects system display fonts; I Operate and A endorse system UI type | One system sans for this working tool; its hierarchy uses size, weight and spacing. No ornamental display face or external font dependency. |
| I has fixed product type; some T/A examples use fluid display type | Fixed rem roles with structural responsive breakpoints. Body and fields remain at least 1rem. |
| I craft-floor suggests themed scrollbars; I Operate rejects custom controls | Native scrollbars and controls, themed selection/caret/focus. Familiar interaction wins. |
| I says border OR shadow; V suggests layering both | Dividers for lists, borders for controls, a soft shadow only for the physical card proof. No double elevation on UI containers. |
| T forbids captions; V prefers inline help | Retain functional card size, fit, print and provenance explanations. They help a teacher make a decision. |
| T bans all-caps; I bans heading eyebrows | Sentence-case UI; no eyebrows. Card type labels are sentence case too. Numbering is retained only for actual myth/evidence IDs and sheets. |
| A suggests inline validation; T prefers checking on submit | Validate blanks on blur and generation, then clear errors while correcting. Never interrupt typing. Generation focuses the first invalid field. |
| A recommends scarce confirmation; V accepts confirmation or Undo | Undo for removal, reset and import. Confirmation only for replacing an existing unexported backup where recovery is unavailable. |
| V says deep-link state; local deck data should stay private | Section navigation uses anchors. Private editable content stays in localStorage or downloaded files, never URL parameters. |
| V suggests minimum spinner times; A rejects artificial latency | This local computation completes immediately. No spinner or imposed delay. Prevent concurrent generation while fonts/measurement settle. |
| T prescribes site assets, scripts and random visual deals; the user requested a minimal static app | Borrow design principles, not its dependencies or random selection workflow. Use the existing HTML/CSS/JS stack and grounded decisions. |
| T limits prose/number of actions for marketing; this is an editor | Preserve full scientific statements and every necessary control. Progressive disclosure reduces visual load without cutting content. |
| V favors Title Case and ampersands as brand preferences | Sentence case and ordinary English fit teachers. Use consistent product nouns rather than importing Vercel's voice. |

## Consolidated checklist

1. Identify the user's task before style: review evidence, edit a deck, generate and print. [I,A,T]
2. Preserve factual content, IDs, relationships, file formats and working functionality during redesign. [I,T]
3. Use real deck data in previews. No fabricated quotations, impact statistics, endorsements or partnerships. [I,T,V]
4. Keep the main action discoverable and the editor visible near the top. [I,A,T]
5. Let the actual card be the visual signature: typography, category label, stable ID and physical proportions. [I,T]
6. Build one coherent system of semantic color, spacing, radius, type and component tokens. [I,T,V]
7. Use a light workspace suited to reading and editing in daylight classrooms. [I,A]
8. Reserve blue for primary action, focus and selection; distinguish myth/evidence with text and color. [I,V]
9. Meet 4.5:1 contrast for body/placeholder text and 3:1 for large text, controls and focus. [I,V]
10. Keep interface text at 16px where routinely read; secondary metadata may be 13–14px. [I,T,V]
11. Build hierarchy with weight, size, line height and proximity together. [I,A]
12. Tighten heading tracking moderately; leave body tracking natural. Never below -0.04em. [I,A]
13. Use a fixed rem type scale and a 4px-based spacing scale. [I,T]
14. Keep explanatory prose to a comfortable measure; preserve complete editable evidence. [I,V]
15. Balance headings and allow user text to wrap, including long unbroken strings. [I,V]
16. Use tabular numerals for IDs, counts and sheet positions. [I,V]
17. Align related content to consistent edges; let the content determine density. [I,T,V]
18. Group by task and relationship before adding boxes. No nested decorative cards or repeated feature tiles. [I,T]
19. Use one expanded editor per myth to avoid an undifferentiated wall of inputs. Keep every summary discoverable. [I,A]
20. Put controls beside the item they affect; keep backup/reset actions secondary. [A,V]
21. Show a live proof of the focused card, using the same renderer as print output. [A,T]
22. Use progressive disclosure for optional file controls and print instructions, not the main task. [I,A]
23. Reflow columns on small screens; maintain DOM and keyboard reading order. [I,V]
24. Fit print previews to their container; do not crop card edges or require page-wide horizontal scrolling. [T,V]
25. Use at least 44px hit targets for controls; do not disable pinch or browser zoom. [A,T,V]
26. Use native buttons, links, details, inputs and labels before ARIA. [V]
27. Include a skip link, logical heading hierarchy and visible persistent field labels. [T,V]
28. Keep focus visible and unobscured. Move focus meaningfully after add, remove, validation and generation. [A,V]
29. Preserve input focus and cursor during typing; never re-render the whole form for a keystroke. [A,V]
30. Accept pasted text and unfinished drafts. Blank draft fields must survive refresh. [A,V]
31. Give specific inline error messages connected with aria-describedby and aria-invalid. [A,V]
32. Announce meaningful completion, error and Undo updates politely; avoid announcing every keystroke. [A,V]
33. Keep generation enabled for validation; show why an incomplete deck cannot print. [V]
34. Make removal and replacement recoverable. Keep an Undo action until the next meaningful edit. [A,V]
35. Provide useful empty and no-results states with a next action. [I,V]
36. Preserve content on failure, including failed import or unavailable storage; offer export as recovery. [A,V]
37. Acknowledge pointer-down immediately, commit with native click behavior, and allow cancellation. [A,T]
38. Keep transitions short and interruptible; use explicit properties, never transition: all. [A,V]
39. Motion must explain a state change; no autoplay, looping decoration, confetti, tilt or scroll-jacking. [I,A,T,V]
40. Respect reduced motion, reduced transparency, increased contrast and forced colors. [A,V]
41. Use ordinary, concrete headings and verb/object action labels. Cut slogans, eyebrow text and generic marketing promises. [I,T,V]
42. Use the same name for the same thing everywhere: myth, evidence, deck, card, sheet. [A,T,V]
43. Explain the next action and recovery, not internal implementation, in user-facing copy. [I,V]
44. Show provenance and local-saving scope honestly; do not imply draft evidence has been independently verified. [I,A,T]
45. Keep no-account, browser-local behavior; add no analytics, network dependency or server requirement for design alone. [A,V]
46. Batch layout reads/writes and keep typing cheap; reserve dimensions to avoid layout shifts. [A,V]
47. Keep all text selectable and genuine HTML, with semantic metadata and an accurate document title. [T,V]
48. Preserve 2.5 × 3.5 inch cards, 9 per Letter sheet, with clear cut lines and single-sided output. [Product requirement]
49. Measure text fit at physical print size. Identify overflow by card ID and offer a direct correction path. [I,V,Product]
50. Maintain legibility in monochrome; printed cards must not require background graphics or color recognition. [Product,V]
51. Keep teacher-only answer mappings off the player cards and on the guide. [Product]
52. Verify real content, empty fields, long content, deletion/Undo, reload, imports, generation and responsive layouts. [I,A,T,V]
53. Inspect actual rendered output at desktop, tablet and narrow mobile sizes; automated checks cannot establish visual quality. [I,T,V]
54. Record observed limits honestly: do not claim print/PDF or accessibility checks that were not performed. [I,T]

## Conditional rules retained for future features

Apple's drag physics, sound/haptic synchronization, modal material hierarchy, velocity blending, rubber-banding and animated sheets apply only if those interactions are introduced. Vercel's server latency, optimistic request handling, auth/password managers, media captions, charts, internationalization and virtualized large lists apply when those features exist. Taste's photography licensing, commercial offers, addresses, booking, marketing section recipes, shaders and logo rules do not require introducing those features into a local card editor. The consolidated checklist is authoritative when source-specific house styles conflict.

## Implemented direction

**Purpose:** a card workbench for high-school teachers preparing a printable climate activity.
**Composition:** compact product heading and blue action bar, searchable myth list on the left, the current card proof on the right. One myth expands into editable text and its matching evidence. Generated sheets follow below.
**Character:** cobalt structure, white working surfaces, pale blue selection, muted clay myth labels and dark teal evidence labels. Plain sans type, aligned numerals, softly rounded physical cards. No decorative illustration.
**Signature:** focusing any myth/evidence field immediately shows its actual printable card in the proof pane.
**Motion:** immediate proof updates and short color/press feedback; no entrance sequence. Reduced motion removes movement.
**Print:** a separate physical-size layout with no editor chrome, black text, dotted cut boundaries and a teacher key.

## Verification — November 21, 2026

- Six Node tests pass, covering source integrity, validation, pagination, incomplete drafts and malformed objects. JavaScript syntax checks pass.
- Browser checks: initial 36-card generation; blank-field validation with focus; blank draft survives reload; evidence removal and Undo; search empty state and clearing; overlong text blocks printing and identifies the field; restored original text generates successfully.
- No horizontal page overflow at measured CSS viewport widths of 320, 325, 769, 1200 and 1400 pixels. Desktop and phone layouts inspected visually. No browser console errors observed.
- Initial source text was restored after interaction tests.
- Native Save PDF output and physical printing were not verified in this redesign pass. JSON import/export and a full assistive-technology audit were not browser-tested in this pass.
