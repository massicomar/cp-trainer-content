# cp-trainer-content

The problem bank for CP Trainer, a Duolingo-style app for practicing *recognizing* which algorithm solves a competitive programming problem.

```
taxonomy.json                  subjects → techniques
problems/<subject>/<id>.json   one file per problem
drills/big-o.json              the time table quick questions are generated from
drills/<subject>.json          algorithms of a subject with their complexity
courses/<subject>.json         the order of a subject's lessons, in sections
units/<subject>/<name>.json    one lesson (Lecciones): idea, questions, signals, apply, recap
schema/                        JSON Schemas (the contract with the app)
templates/                     copy this to add a problem
scripts/validate.ts            CI checks (npm run validate)
SELECTION.md                   overview of the starter set (contains answers!)
```

The starter set has 107 problems:

| Subject | Easy | Medium | Hard | Extra layers |
|---|---|---|---|---|
| Dynamic Programming | 10 | 10 | 10 | DP state + transition on every problem |
| Graphs, Geometry, Number Theory, Binary Search / D&C, Segment Tree | 5 each | 5 each | 5 each | none |
| Distractors (greedy, shown in DP sessions) | 2 | – | – | none |

Every problem has its statement in `summary`, copied from the judge, and a Spanish `es` block with its explanations (drafts to review). Some still need their limits re-checked on the judge page (`constraints.verified: false`); see `CONTRIBUTING.md`.

`drills/` has the Big O table plus 58 algorithms across the six subjects (about 10 each).

`courses/dp.json` has the first section of lessons, DP básico: 6 units in `units/dp/`, all drafts to review. The app doesn't play lessons yet.

```bash
npm ci
npm run validate          # errors fail; warnings are summarized
npm run validate:verbose  # list warnings too
```

**License suggestion:** CC BY-SA 4.0 for the content. Problem statements belong to their judges; we only link to them.
