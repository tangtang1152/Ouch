# ouch

A simple web tool for quickly expressing pain location during massage.

## Background

During a massage session, it can be hard to immediately describe where the pain is strongest.

The painful point may shift quickly.  
Saying things like “a little left”, “a little up”, or constantly correcting the location can interrupt the interaction and make communication inefficient.

This project explores a very small but practical solution:

- one large **OUCH** button
- four direction buttons: **up / down / left / right**
- audio cues to help communicate pain quickly

## MVP Features

- Large center **OUCH** button
- Direction buttons for pain adjustment
- Audio playback for each button
- Mobile-friendly simple layout

## Design Decisions

### Why not React for the first version?

The first version only needs a few buttons and simple audio playback.  
Using plain HTML, CSS, and JavaScript keeps the setup lightweight and helps validate the core interaction faster.

### Why start with click input instead of gyroscope or motion?

Click input is more reliable, easier to debug, and easier to test with users.  
Sensor-based interaction is interesting, but should come after the core product value is confirmed.

### Why start with Web instead of an App?

A web version has the lowest development and deployment cost.  
It is faster to build, easier to share, and more suitable for rapid iteration.

## Future Ideas

- motion / tap / flip detection
- vibration feedback
- customizable sound packs
- user feedback and voting
- donation page
- mobile app version

## Tech Stack

- HTML
- CSS
- JavaScript
- GitHub Pages

## Status

Early MVP prototype.

## Author

Created by [tcy / tangtang1152]