# Design notes, v1

## Visual thesis
Apple-style restraint in green, black and white: big quiet headlines, generous space, rounded bento tiles, one dark band for contrast, and a translucent navigation bar. Nothing decorative that does not help someone find their way.

## Palette (from Blueprint v2 and the Task Tracker)
| Token | Hex | Use |
| --- | --- | --- |
| Ink | `#111a15` | Dark band, text on light |
| Forest | `#0b5d45` | Primary actions, area tile |
| Mint | `#dcebe2` | Soft panels |
| Paper | `#f4f7f3` | Page background |
| White | `#ffffff` | Cards |

Dark mode follows the system setting (accent becomes `#5fcfa5`). No amber in v1: the brief is green, black and white. Status is never color alone.

## Type
System font stack (SF Pro on Apple devices, Segoe UI on Windows), from ccs-design. Same as the Task Tracker and Grant Support System. No web fonts are downloaded.

## Motion thesis
Calm and precise. Press feedback 160 ms (`scale(0.97)`), hover and color 200 ms, side menu 320 ms with a drawer curve, one scroll reveal (10 px rise and fade, 60 ms stagger, 420 ms). CSS only, no animation library. Only `transform`, `opacity` and color are animated.

Allowed patterns: translucent blurred nav, bento tiles, dark Jubilee band, four-point compass mark, scroll reveal, sample-content dashed borders.

Not animated on purpose: search opens instantly (keyboard-driven, used often). Reduced motion removes movement and keeps a short fade. Hover effects only apply on devices with a real pointer.

## Easing
- `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` for press and reveal
- `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)` for the side menu

## Access preview
`data-access="key"` on any element adds a badge from the matrix in `config.js`. It is a preview of the blueprint's View, Use and Manage rules.

## Next
1. Confirm area labels and portal name (blueprint decisions 1 and 2).
2. Real sign-in and roles; move the access matrix to the server.
3. Embed or deep-link Task Tracker and Grant Support System once each is deployed.
4. News and events with the approval flow.
5. Admin dashboards.
