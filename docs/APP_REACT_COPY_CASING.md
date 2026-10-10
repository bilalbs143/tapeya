# app-react UI copy casing

Chicago-style **Title Case** for short UI chrome; **sentence case** for long descriptive copy; **ALL CAPS** for form/section eyebrows (via CSS).

## Title Case (chrome)

Capitalize major words. Keep these small words lowercase mid-phrase unless first or last: *a, an, the, and, or, of, to, for, in, on, vs*.

Examples: `Edit Profile`, `Teams, Squads and Fixtures`, `Couldn't Load This Stream`, `Save Fixture`.

Apply to:

| Surface | Examples |
|---|---|
| Screen titles | `Match Settings`, `Create Tournament`, `Go Live` |
| Short subtitles | `Help and Feedback`, `Text or Photo` (≤ ~8 words, not a full sentence) |
| Dialog / sheet titles | `Cancel Match`, `Declare Result`, `Edit Ball` |
| Buttons / CTAs | `Start Match`, `Save Changes`, `Toss & Start Match` |
| Tab / chip / menu chrome labels | `Playing Role`, `Top Players` |
| Empty / error **titles** | `Couldn't Load Rankings`, `Tournament Not Found` |
| Toast **titles** (short status) | `Profile Saved`, `Team Added to Tournament` |
| Short highlighted control names in helper lines | `Start Match`, `Save Fixture` |

Hardcode correct strings. Do **not** add a runtime `toTitleCase()` for display (API / user labels must stay as returned).

## ALL CAPS eyebrows (CSS)

Keep `uppercase` on Field / Form section / SectionLabel / drawer nav section headers. Source strings may be Title or sentence case; CSS still renders **FULL NAME**, etc. Do not remove those classes to show Title Case.

## Sentence case (leave as-is)

- Long body / descriptions: `DialogDescription`, Empty/Error `description`, AuthShell description, helpers, legal, banners
- Toast `description=` and multi-sentence status lines
- Placeholders (`Share your cricket moment…`)
- API / user / domain data (names, handles, server enum labels, scores)
- Scoring codes: `WD`, `NB`, `BYE`, `LB`, `Wkt`
- `aria-label` unless it mirrors short visible chrome

**Long** if it has a period/question mark/em-dash explaining something, reads as a full sentence, or is > ~12 words and descriptive.

## Checklist when porting a screen

1. `ScreenBar` title / short subtitle  
2. `DialogTitle` / sheet `h2`  
3. Button / StickyActionBar labels  
4. Empty / Error **titles** only  
5. Toast **titles** (short)  
6. Skip descriptions, hints, placeholders, API labels  

See also: [APP_REACT_FORM_MIGRATION.md](./APP_REACT_FORM_MIGRATION.md), `.cursor/skills/app-react-standards/SKILL.md`.
