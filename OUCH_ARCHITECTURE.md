# Ouch -- System Architecture

## Overview

Ouch is a mobile‑first web tool designed to communicate pain locations
quickly during massage. The system relies on motion sensors, button
interactions, and audio feedback.

Core components:

-   UI interaction layer
-   Motion detection pipeline
-   Audio playback system
-   Debug instrumentation
-   PWA runtime layer

------------------------------------------------------------------------

# High Level Architecture

User Interaction │ ├── Button Click │ └── playSound() │ └── Motion Event
(devicemotion) └── handleMotion()

↓

Cooldown Filter

↓

Trigger Event

↓

Audio Engine

↓

HTML Audio Element

↓

Speaker Output

------------------------------------------------------------------------

# Motion Detection Pipeline

Motion events arrive from the browser:

DeviceMotionEvent

The pipeline:

devicemotion event\
↓\
handleMotion()\
↓\
Compute magnitude from acceleration vector\
↓\
Cooldown filter\
↓\
Trigger audio playback

Magnitude formula:

magnitude = sqrt(x² + y² + z²)

Cooldown prevents rapid retriggering.

------------------------------------------------------------------------

# Audio Playback Pipeline

playSound(name)

↓

Select audio object from sound pool

↓

Reset playback pointer

audio.currentTime = 0

↓

Play

audio.play()

Lifecycle events observed during debugging:

playing → seeking → seeked → pause → ended

Abnormal playback sometimes collapses immediately.

------------------------------------------------------------------------

# Debug Instrumentation

A built‑in debug system was created to observe runtime behavior.

Panels include:

motion panel audio state panel audio lifecycle panel

Captured signals:

motion magnitude cooldown timing trigger counters audio lifecycle events

Debug mode enabled through:

?dev

------------------------------------------------------------------------

# PWA Architecture

The app supports installation through Progressive Web App technology.

Key components:

manifest.json service-worker.js

Flow:

Browser ↓ Service Worker ↓ Cache Storage ↓ Offline Load

Capabilities:

Home screen install\
Standalone launch mode\
Offline capability

------------------------------------------------------------------------

# Known System Challenges

## iOS Audio Behavior

Audio playback occasionally succeeds without sound.

Observed pattern:

playing → seeking → seeked → ended

All timestamps near zero.

Normal playback:

pause / ended ≈ audio duration

------------------------------------------------------------------------

## Mobile Browser Cache Layers

Mobile Safari caches assets aggressively.

Affected layers:

Safari cache\
Service worker cache\
githubassets CDN cache

Resolution often requires clearing full Safari website data.

------------------------------------------------------------------------

# Key Design Philosophy

The project emphasizes:

instrumentation\
observability\
real‑world debugging\
event‑driven design

Rather than treating the browser as a simple UI layer, the project
treats it as a runtime environment.
