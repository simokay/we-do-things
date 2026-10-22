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
(`home` / `indoor` / `outdoor` / `any`), `timeOfDay` (array of `morning` /
`afternoon` / `evening`, or `["any"]` — only checked on weekends, weekdays
assume an evening slot), `effort`, and `tag` (short sticker label shown on
the result card, e.g. `"cozy"`). `link` is optional — a URL shown as
"more info →" on the result card, for activities tied to a real place or
event.

`effort` is about **distance from home, not physical exertion** —
`low` = doorstep/at home, `medium` = a local outing nearby, `high` = a
proper trip further out (a different part of London, or a day trip like
Brighton). We're not an "exercise together" household beyond a long walk,
so don't add dedicated workouts (cycling, running, swimming laps, climbing,
skating) regardless of effort tier.

## Local preview

```bash
npm run serve        # serves the site at http://localhost:8080
```

or just point any static file server at this directory.
