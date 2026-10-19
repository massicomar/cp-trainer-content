# Contributing problems

Each problem is one JSON file: `problems/<intended subject>/<id>.json`. Start from `templates/problem.template.json`, or copy an existing problem in the same subject. Run `npm run validate` before opening a pull request; CI runs the same check.

## Workflow for a new or draft problem

1. **Pick an id**: `<source>-<code>` in lowercase, e.g. `cses-1158`, `cf-166b`, `atcoder-dp-e`. Ids are permanent: never rename or reuse one.
2. **Read the original statement** on the judge.
3. **Write `summary` in your own words**: 2–4 sentences on what's given and what's asked. Never paste the statement, and never name the technique. The validator rejects words like "DP", "Dijkstra" and "segment tree" in ready summaries.
4. **Copy the limits into `constraints.text`.** The limits are the main clue, so be exact. Set `verified: true` once you've checked them on the judge page.
5. **Fill `answers`**: exactly one `intended` subject and one `intended` technique inside it. Add any other correct approach as `accepted`, and approaches that work but are heavier than needed as `overkill`.
6. **Add `distractors`**: the techniques someone would plausibly but wrongly pick. These become the wrong options.
7. **Write `explanation`, `traps` and `pairWith`.** `pairWith` lists problems with the same story but different constraints.
8. For DP problems, add the **`dp-state`** and **`dp-transition`** layers.
9. Set `status` to `"ready"` when it's done. Drafts never appear in the app.

To retire a problem, set `"deprecated": true`. CI fails if a file that exists on `main` is deleted.

## Fields

| Field | Required | Notes |
|---|---|---|
| `schemaVersion` | yes | Always `1` for now |
| `id` | yes | Must match the file name |
| `status` | yes | `draft` or `ready`. A `ready` problem needs a summary (≥ 20 characters) |
| `title` | yes | Original title; the app hides it until the problem is finished |
| `source`, `url` | yes | The URL host must be on the allowlist in `scripts/validate.ts` |
| `difficulty.tier` | yes | `easy` / `medium` / `hard`: what sessions filter on |
| `difficulty.scale`, `.value` | yes | The original rating: `cf` + `"1700"`, `usaco` + `"E"`, `kattis` + `"3.6"`, or `estimate` + `"M"` when the judge has no rating |
| `summary` | yes | Your paraphrase. May be `""` while the problem is a draft |
| `constraints.text`, `.verified` | yes | |
| `answers.subjects` | yes | `[{ "id": "dp", "role": "intended" }, …]` |
| `answers.techniques` | yes | Technique ids from `taxonomy.json`. Each one must belong to a subject listed in `answers.subjects` |
| `appearsIn` | no | Extra sessions to show the problem in. Distractors in `problems/other/` use this |
| `distractors` | no | Technique ids to prefer as wrong options. They can't also be correct answers |
| `explanation` | yes | Shown after the technique layer |
| `traps` | no | Shown in the problem recap |
| `pairWith` | no | Must reference existing ids |
| `extraLayers` | no | Layers 3+ (see below) |
| `notes` | no | For authors only |
| `deprecated` | yes | `false` unless the problem is retired |

## How the app turns a file into questions

- **Layer 1, subject.** The options are the six subjects plus "None of these". It's only asked when the session includes more than one subject.
- **Layer 2, technique.** The options are the intended technique, then your `distractors`, then the taxonomy's `confusableWith`, then other techniques of the same subject, up to four in total. `accepted` and `overkill` techniques are never marked wrong.
- **Layers 3+** come from `extraLayers`. Each layer has:
  - `key`: unique within the file, e.g. `dp-state`. `subject` and `technique` are reserved for layers 1 and 2.
  - `kind`: one of `dp-state`, `dp-transition`, `complexity`, `observation`, `node-stores`, `trap`, `custom`.
  - `prompt`: the question shown to the player.
  - `options`: 2–6 entries, each with an `id` (a single letter), a `text`, and an optional `why`. The player sees `why` when they pick that option, so write it for the wrong options.
  - `accepted`: the ids of the correct options.
  - `explanation`: shown after the player answers.

## Writing good DP layers

- **State options.** The wrong states should be ones people actually try:
  - a state that **loses information** (`dp[i]` when the last choice matters);
  - one that is **too big** (`dp[mask]` with n = 1000, a table over 1e9 values);
  - one with the **wrong objective** (counting instead of minimizing);
  - **the state from the paired problem** (Knapsack 1's state on Knapsack 2).
- **Transition options.** Use real bugs:
  - wrong loop order (permutations vs combinations);
  - reusing an item;
  - a greedy shortcut;
  - a correct but too-slow recurrence (say so in its `why`).
- When two states are both correct (for example `dp[i][t]` vs `dp[i][j]` in Sleeping Schedule), list both in `accepted`.

## Taxonomy

`taxonomy.json` defines subjects and techniques. Technique ids are `<subject>.<slug>` and are permanent, like problem ids. The `other` subject is hidden: it holds greedy and ad hoc answers for distractor problems and is never a session choice.
