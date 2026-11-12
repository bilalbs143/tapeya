# iOS YouTube overlay — device checklist

Rebuild the iOS app after Swift plugin changes. Embed rotate/cover lives on the API (`/embed/youtube`).

## Shared contract

| Surface              | `controls` | Stack                         | Full Exit     |
| -------------------- | ---------- | ----------------------------- | ------------- |
| Watch / live         | off        | Underlay (Cap above video)    | Native button |
| Highlights / episode | on         | Interactive (video above Cap) | Native button |

## Watch / live

- [ ] Connecting cover clears when video plays
- [ ] No YouTube controls / taps (underlay + Android iframe `pointer-events-none`)
- [ ] Badges / hearts / chat tappable
- [ ] Full — rotated video; LIVE ~10px from landscape top; native Exit; TopNav hidden
- [ ] Leave route — audio stops
- [ ] Light mode — chrome stays light; only player hole is clear

## Highlights / episode

- [ ] Portrait — scrubber / pause receive taps
- [ ] Full — scrubber / pause still tappable; loader rotates; native Exit
- [ ] Exit → portrait controls return
- [ ] Try Again after timeout is tappable (overlay hides while retry shows)

## Regression

- [ ] Android / web still use the iframe path
- [ ] Upload (non-YouTube) players unchanged
