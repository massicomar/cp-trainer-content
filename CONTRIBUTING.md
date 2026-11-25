# Contributing problems and drills

Each problem is one JSON file: `problems/<intended subject>/<id>.json`. Start from `templates/problem.template.json`, or copy an existing problem in the same subject. Run `npm run validate` before opening a pull request; CI runs the same check.

## Workflow for a new or draft problem

1. **Pick an id**: `<source>-<code>` in lowercase, e.g. `cses-1158`, `cf-166b`, `atcoder-dp-e`. Ids are permanent: never rename or reuse one.
   - **Set `author`** to your GitHub username.
   - **Set `collection`** to `"community"`. Maintainers can promote a problem to `"official"` after review. Players choose whether community problems appear in their sessions.
   - **Shortcut:** the app's **Contribute** page (`/contribute`) has a form that writes the whole file for you, with dropdowns for subjects and techniques and the same checks CI runs. Paste the problem's link under **From a link** and the id, judge and link are filled in; for CSES, AtCoder and Kattis the statement, title, constraints and difficulty are too.
2. **Read the original statement** on the judge.
3. **Copy the statement into `summary`, exactly as the judge shows it** (the app is for private use). **From a link** on `/contribute` does this for CSES, AtCoder and Kattis; Codeforces and SPOJ block automatic fetching, so paste those by hand (maintainers can also run `node ace content:fetch-statements` in the app repo, see its README). Leave out the title, the samples and the limits section; the limits go in `constraints`. Keep the judge's LaTeX (`$N$`, `\leq`) as it is rather than the rendered symbols. The validator warns if the statement contains technique words like "DP" or "segment tree", since that gives the answer away.
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
| `author` | yes | Your GitHub username; shown as "Added by @author" |
| `collection` | yes | `community` for new problems; maintainers promote them to `official` |
| `title` | yes | Original title; the app hides it until the problem is finished |
| `source`, `url` | yes | The URL host must be on the allowlist in `scripts/validate.ts` |
| `difficulty.tier` | yes | `easy` / `medium` / `hard`: what sessions filter on |
| `difficulty.scale`, `.value` | yes | The original rating: `cf` + `"1700"`, `usaco` + `"E"`, `kattis` + `"3.6"`, or `estimate` + `"M"` when the judge has no rating |
| `summary` | yes | The original statement, copied exactly. May be `""` while the problem is a draft |
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
| `es` | no | Spanish versions of the texts (see below). Keep it as the last key |

## How the app turns a file into questions

- **Layer 1, subject.** The options are the six subjects plus "None of these". It's only asked when the session includes more than one subject.
- **Layer 2, technique.** Up to four options: the intended technique plus three wrong ones, shuffled.
  - The wrong ones come from your `distractors` first (any subject is fine), then the intended technique's `confusableWith`, then other techniques of the same subject.
  - Greedy and ad hoc can show up as a wrong option on any problem, about a third of the time, because brute force or a greedy idea looks plausible whenever the limits are small.
  - Each `overkill` technique takes one of the wrong-option slots about half the time.
  - `accepted` and `overkill` techniques are never marked wrong.
  - If the player picks an `accepted` subject in layer 1 and the file lists a technique for that subject, layer 2 asks about that subject instead.
- **Layers 3+** come from `extraLayers`. They're asked when the session includes the problem's intended subject; a session that only reached the problem through an `accepted` subject skips them. Each layer has:
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

## Spanish (`es`)

Players with the UI in Spanish see Spanish texts where they exist and the English ones otherwise, field by field. Usually only the texts that explain are translated. A problem used in a lesson's `apply` step also translates its statement (`summary`) and each layer's `prompt` and `options`; CI requires them once that lesson is `ready`. `constraints` and technique names stay in English.

```json
"es": {
  "summary": "…",
  "explanation": "…",
  "traps": ["…", ""],
  "layers": { "dp-state": { "prompt": "…", "options": { "a": "…", "b": "…" }, "explanation": "…", "why": { "b": "…" } } }
}
```

- `summary` translates the statement: same sections (Entrada, Salida), same LaTeX, the input-format block as it is. Don't name the technique in it either: the validator warns about words like "mochila" or "programación dinámica".

- `traps` has one entry per English trap, in the same order. An empty string means "use the English one".
- `layers` is keyed by the extra layer's `key`, and `options` and `why` by option id. CI checks that they exist.
- Write in neutral Latin American Spanish with *tú*, like the app's UI ("prueba", "fíjate"). Keep the usual CP terms in English where Spanish-speaking competitors do (DP, greedy, bitmask, BFS, segment tree…), and leave math and problem names as they are.
- `/contribute` has a Spanish box next to the statement, each explanation, trap, layer prompt, option and "why".

## Drills

Drills are the short "quick questions" between problems. They live in `drills/`:

- **`drills/big-o.json`**: the time table. The app generates three kinds of drills from it: the largest complexity that fits a bound, up to which n a complexity fits, and whether a (complexity, n) pair fits. Every generated case is clear: the table's verdict and the arithmetic (against `opsPerSecond`) must agree with a 2× margin, so nothing hinges on 1.2·10⁸ operations. The explanations show that arithmetic. You'd only edit this file to tune a `maxN` threshold or the `nValues` drills ask about; `maxN` must not grow along the list, which goes from the slowest-growing complexity to the fastest.
- **`drills/<subject>.json`**: algorithms of one subject with their time complexity. Lessons that include the subject ask "What's the time complexity of …?" with the right complexity and the three wrong ones, shuffled.

```json
{
  "id": "dijkstra-heap",
  "name": "Dijkstra with a binary heap",
  "complexity": "O((n + m) \\log n)",
  "wrong": ["O(n \\cdot m)", "O(n + m)", "O(n^2 \\log n)"],
  "explanation": "Each edge can push one heap entry, and each heap operation costs O(log n).",
  "es": { "explanation": "Cada arista puede agregar una entrada al heap, y cada operación del heap cuesta O(log n)." }
}
```

- **`name`** is English and specific enough to have one complexity: "Dijkstra with a binary heap", not "Dijkstra"; say what n, m, q are when it isn't obvious.
- **`complexity` and `wrong`** are LaTeX without `$`. Wrong options should be mistakes people make: the naive version's complexity, a missing log factor, a related algorithm's bound (say which in the explanation). Never a bound that is also true for the named algorithm.
- **`id`** is unique within the file. Removing an algorithm retires it in the app; nothing breaks.
- CI checks the schema, unique ids, that the subject exists and isn't hidden, and that no wrong option equals the right one.

## Lessons (Lecciones)

Lessons teach one technique at a time. The app doesn't show them yet (that's L3); for now they're content only.

- **`courses/<subject>.json`** orders a subject's lessons into sections (`basico`, later `intermedio`, `avanzado`). The order is a suggestion: nothing is ever locked. Every unit is in exactly one course.
- **`units/<subject>/<name>.json`** is one lesson, with id `<subject>.<name>` (usually its technique id, e.g. `dp.coin-change`). It's a list of cards, in this order: `idea` (1–3, plus a `diagram`), 3–5 `question` or `drill` cards, `signals` and one question about them, `apply`, `recap`. A lesson takes 5–12 minutes.

```json
{ "type": "question", "key": "coins-outside",
  "prompt": "With `for c in [2, 3]: …`, what is `dp[5]`?",
  "options": [{ "id": "a", "text": "1" }, { "id": "b", "text": "2", "why": "…" }],
  "accepted": ["a"], "explanation": "…",
  "es": { "prompt": "…", "options": { "b": "…" }, "why": { "b": "…" }, "explanation": "…" } }
```

- **Card `key`s are permanent,** like problem ids: attempts refer to them. Every card has one.
- **Questions make you use the idea, not repeat it.** Trace a small case, pick the state or the loop, spot a classic bug, recognize the idea in a different story, say the complexity. Not "what did the card say?". Every wrong option gets a `why`.
- **Wrong options are near misses:** the right shape with one detail wrong. An offset off by one, the loop in the wrong direction, a wrong base case, min for max, the last move instead of the first, the same story with one rule changed. Keep the right option about as long as the others: if it's usually the longest, players learn to pick the longest. Shorten the right one rather than padding the wrong ones. Reviewers check this; CI doesn't.
- **`drill`** asks one algorithm from `drills/<subject>.json`, as `"algorithm": "dp:coin-combinations"`.
- **`apply`** lists 1–2 bank problems whose intended technique is the lesson's. They're played without the subject question, so the extra layers are what's left to ask. The technique question offers only the techniques learned on the line, and it's skipped when that leaves one. A Spanish lesson shows the problem in Spanish, so before a lesson is `ready` its apply problems need the full `es` block (see Spanish below).
- **`diagram`** cards give the input and the app computes the steps: `dp-1d` (a recurrence over offsets, ≤ 12 cells), `dp-2d` (`paths`, `lcs`, `knapsack`, ≤ 6 × 6), or hand-written `frames` (≤ 3 rows × 12 cells) for what the generators don't cover. `schema/unit.schema.json` has the exact fields. Use your own inputs, not the apply problems' samples.
- **Texts** take a small Markdown subset (paragraphs, **bold**, *italic*, `` `code` ``, lists, code blocks) and `$…$` for KaTeX. Options are one line.
- **Spanish:** unlike problems, lessons are our own writing, so `es` translates everything: the card texts, prompts and options too. Same style as the problem `es` blocks.
- CI checks the schemas, that every unit is in one course, unique card keys, real options in `accepted` and `es`, that drills and problems exist, that apply problems match the technique (and are ready and in Spanish if the unit is), and that diagram data fits its size.

## Taxonomy

`taxonomy.json` defines subjects and techniques. Technique ids are `<subject>.<slug>` and are permanent, like problem ids. The `other` subject is hidden: it holds greedy and ad hoc answers for distractor problems and is never a session choice.
