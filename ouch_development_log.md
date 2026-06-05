# Ouch -- Development Log

## Project Origin

The project started from a real-life pain point during massage sessions.
Communicating exact pain positions quickly is difficult, especially when
the massage therapist moves rapidly across the body.

Idea: Create a simple mobile interface with a large **OUCH** button and
direction buttons so the user can instantly signal where the pain is.

------------------------------------------------------------------------

## Version Timeline

### v0.1 -- Basic UI

-   Large OUCH button
-   Direction buttons
-   HTML + CSS + JavaScript
-   Audio playback

### v0.2 -- Motion Trigger

-   Detect phone shaking via DeviceMotionEvent
-   Calculate acceleration magnitude
-   Add cooldown logic to avoid repeated triggers

### v0.3 -- Debug Infrastructure

-   Motion debug panel
-   Audio lifecycle logs
-   Trigger counters
-   Extensive logging for iOS issues

### v0.4 -- PWA Implementation

-   manifest.json
-   service worker
-   install to home screen
-   standalone launch mode
-   offline capability

------------------------------------------------------------------------

## Major Bugs Encountered

### iOS Audio Playback Issue

Sometimes `audio.play()` succeeded but produced no sound.

Debug result: Audio lifecycle finished instantly.

Mitigation: Reuse audio objects and apply warmup logic.

------------------------------------------------------------------------

### Motion Permission Issue

Safari sometimes refused to re-request motion permission.

Solution: Clear Safari website data.

------------------------------------------------------------------------

### PWA Cache Issue

Even after pushing new code, iOS Safari served old files.

Final solution: Clear **all Safari website data**, not only github.io
entries.

------------------------------------------------------------------------

## Key Technical Lessons

### Event-driven Programming

Frontend systems do not run sequentially like traditional programs. They
wait for events such as clicks, sensor input, or browser lifecycle
events.

### Browser Environment Complexity

Mobile browsers involve: - OS restrictions - power management - audio
policies - sensor permissions - caching layers

### Importance of Debug Instrumentation

Debug panels dramatically improved visibility during testing.
