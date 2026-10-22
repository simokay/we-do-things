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
- `data/activities.json` — the list of activities. Edit this file directly
  to add, remove, or tweak ideas; the app reads it at runtime.

Each entry needs: `id` (unique slug), `name`, `description`, `location`
(`indoor` / `outdoor` / `any`), `timeOfDay` (array of `morning` /
`afternoon` / `evening`, or `["any"]` — only checked on weekends, weekdays
assume an evening slot), `effort` (`low` / `medium` / `high`), and `tag`
(short sticker label shown on the result card, e.g. `"cozy"`).

## Local preview

```bash
npm run serve        # serves the site at http://localhost:8080
```

or just point any static file server at this directory.
