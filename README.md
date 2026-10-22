# We Do Things — what should we do together?

## Goal

Decision fatigue kills free time together before it starts — "what do you
want to do?" / "I dunno, what do you want to do?" on repeat. This app skips
that: answer a few quick questions (where, weekday or weekend, time of day,
effort) step by step, and it hands you a random activity for the two of you.
Not the vibe? Adjust an answer in the top bar and spin again.

## How it works

A tiny static site, no build step, no framework — plain HTML/CSS/JS,
deployed straight to GitHub Pages.

- `index.html`, `style.css`, `app.js` — the whole app.
- `data/activities.json` — the list of activities the app reads at runtime.

## Local preview

```bash
npm run serve        # serves the site at http://localhost:8080
```

or just point any static file server at this directory.
