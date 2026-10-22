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
- `activities.csv` — the list of activities, parsed in the browser at load
  time. No build step: edit it, commit, and the live site picks it up. It
  lives at the repo root (not buried in a folder) so it's easy to find.

### Editing the activity list

Open `activities.csv` on GitHub and click the pencil (edit) icon — GitHub
shows CSV files as an editable spreadsheet grid, so you can add, remove or
tweak rows without touching any code. Each row is one activity:

| column | meaning |
|---|---|
| `id` | unique slug, e.g. `cook-new-recipe` (lowercase, hyphens, no spaces) |
| `activity` | one short sentence shown on the result card — what it is and the one detail that makes it specific |
| `location` | `home`, `indoor`, `outdoor`, or `any` |
| `timeOfDay` | `morning`, `afternoon`, `evening`, or `any` — for more than one, separate with a semicolon, e.g. `morning;afternoon`. Only checked on weekends; weekdays assume an evening slot. |
| `effort` | `low`, `medium`, or `high` — this means **distance from home, not exertion**: `low` = doorstep/at home, `medium` = an outing in town, `high` = a proper trip further out. We're not an "exercise together" household beyond a long walk, so don't add dedicated workouts (cycling, running, swimming laps, climbing, skating) regardless of tier. |
| `tag` | short sticker label on the result card, e.g. `cozy` |
| `link` | optional — a URL shown as "more info →" on the result card. Leave blank if none. |

If a field contains a comma, GitHub's spreadsheet editor handles the quoting
for you automatically.

## Local preview

```bash
npm run serve        # serves the site at http://localhost:8080
```

or just point any static file server at this directory.
