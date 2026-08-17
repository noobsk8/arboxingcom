# AR Boxing Website Attribution

This site uses TelemetryDeck for privacy-friendly website acquisition analytics.

## TelemetryDeck

- Website App ID: `989FD1F8-1036-48DD-991A-6BE578E1F6BE`
- Organization namespace: `com.rudeus`
- Signal prefix: `ar_boxing_web.`

## Events

- `ar_boxing_web.page_viewed`
- `ar_boxing_web.app_store_clicked`
- `ar_boxing_web.pricing_viewed`

The autoplay hero video is not tracked. Add `ar_boxing_web.video_played` only if the site later has a meaningful user-initiated video play action.

## Current Campaign Paths

- `https://arboxing.app/tiktok` maps to TikTok organic founder traffic.
- `https://arboxing.app/instagram` maps to Instagram organic founder traffic.
- `https://arboxing.app/youtube` maps to YouTube organic founder traffic.
- `https://arboxing.app/mikeboxing` maps to the sample creator campaign.

Unknown creator-style paths are handled by `404.html` and passed to the home page as `campaign_path`. Asset-like 404 paths are not redirected as campaign visits.

## UTM Campaigns

UTMs are supported as the fallback after recognized clean paths:

```text
https://arboxing.app/?utm_source=tiktok&utm_medium=paid_social&utm_campaign=launch_paid&utm_content=timer_video_01
```

Mapped values:

- `utm_source` -> `source`
- `utm_medium` -> `medium`
- `utm_campaign` -> `campaign`
- `utm_content` -> `content`

Malformed values are cleaned and limited to short controlled strings.

## Attribution Order

1. Recognized campaign path
2. Valid UTM values
3. Normalized referrer domain
4. Direct traffic

Attribution is preserved in `sessionStorage` during the visit.

## App Store Links

All App Store CTAs use `assets/telemetry.js`.

The app is currently pre-launch, so `DEFAULT_APP_STORE_URL` is empty and CTAs fall back to `#pricing` while logging `destination = app_store_pending`.

When the App Store product page exists:

1. Set `DEFAULT_APP_STORE_URL` in `assets/telemetry.js`.
2. Add Apple-generated campaign URLs to individual campaign objects when available.
3. Do not invent Apple campaign link parameters.

## Manual Test Checklist

- Root direct visit: `https://arboxing.app/`
- Organic TikTok path: `https://arboxing.app/tiktok`
- Organic Instagram path: `https://arboxing.app/instagram`
- Organic YouTube path: `https://arboxing.app/youtube`
- Known creator path: `https://arboxing.app/mikeboxing`
- Unknown creator path: `https://arboxing.app/coach_james`
- Valid UTM URL
- Malformed UTM URL
- App Store CTA before and after navigating within the page
- Missing Apple campaign mapping
- TelemetryDeck blocked or unavailable
- Mobile Safari
- Desktop browser
