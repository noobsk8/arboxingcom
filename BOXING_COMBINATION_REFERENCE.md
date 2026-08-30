# AR Boxing Combination Reference

Use this document as the source of truth for boxing-combination articles, QR codes, short-form scripts, and featured examples. Any new article should follow these rules unless it explicitly identifies a different stance, defensive strategy, or coaching source.

## Default stance

AR Boxing content defaults to an orthodox stance:

- Left hand and left foot are the lead side.
- Right hand and right foot are the rear side.
- Punch numbers follow the common orthodox numbering system.

If content is written for a southpaw stance, say so clearly and verify the mirrored sequence before publishing.

## Defensive follow-up rule

Use the last punch to choose the defensive movement that follows it:

| Last punch | Common number | Follow-up | App token |
| --- | --- | --- | --- |
| Lead jab | 1 | Slip left | `sl` |
| Rear cross | 2 | Slip right | `sr` |
| Lead hook | 3 | Roll left | `rolll` |

This is a practical content rule for our orthodox examples, not a universal boxing law. A qualified coach may choose a different defensive response depending on range, angle, opponent, or drill purpose.

## Common combinations

Use these as reliable starting points for beginner and shadow-boxing content:

| Name | Sequence | AR Boxing URL code |
| --- | --- | --- |
| 1-2 | Jab, cross | `ljh-rch` |
| 1-1-2 | Jab, jab, cross | `ljh-ljh-rch` |
| 1-2-3 | Jab, cross, lead hook | `ljh-rch-lhh` |
| 2-3-2 | Cross, lead hook, cross | `rch-lhh-rch` |
| 1-2-slip-right-2 | Jab, cross, slip right, cross | `ljh-rch-sr-rch` |
| 1-2-3-roll-left | Jab, cross, lead hook, roll left | `ljh-rch-lhh-rolll` |
| 1-2-3-2-slip-right | Jab, cross, lead hook, cross, slip right | `ljh-rch-lhh-rch-sr` |
| Body jab-cross-hook | Body jab, cross to head, lead hook | `ljb-rch-lhh` |
| Jab-cross-body-hook-lead-hook | Jab, cross, lead body hook, lead hook | `ljh-rch-lhb-lhh` |

## App token rules

Public combo URLs must use the existing V1 format:

`https://arboxing.app/combo?v=1&c=ljh-rch-lhh`

Only use tokens accepted by `assets/shared-combo.js`. Keep the moves in their training order, use one to twelve moves, and preserve the HTTPS URL for QR codes, copy links, articles, and public sharing. The custom `arboxing://` scheme is only for the “Open in AR Boxing” action.

Do not invent tokens, include custom titles, or imply that article text transfers BPM, sets, or combo names into the app unless the app format has been updated.

## Article publishing checklist

Before publishing a new combination article:

1. Identify the stance. Use orthodox unless the article says otherwise.
2. Confirm the last punch before every slip or roll.
3. Apply the defensive follow-up rule or explain why a coach may use another response.
4. Verify every token against `assets/shared-combo.js`.
5. Generate the QR code from the exact canonical HTTPS combo URL.
6. Add an original AR Boxing app demonstration when available.
7. Link to the combo builder and App Store page.
8. Include a short safety and coaching disclaimer.

## Content boundaries

Describe these as training prompts, not guaranteed fight tactics or personalized coaching. Avoid claims about punch power, certified accuracy, opponent prediction, or medical results. Use original AR Boxing footage for the app portion and link to outside creators rather than downloading or re-uploading their videos.
