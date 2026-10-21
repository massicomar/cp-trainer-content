/**
 * Validates the content repo. Run with `npm run validate`.
 *
 * Checks:
 *  1. taxonomy.json and every problems/**\/*.json match their JSON Schemas
 *  2. ids are unique and match the file name; files live in problems/<intended subject>/
 *  3. answer roles: exactly one intended subject and one intended technique (inside that subject);
 *     accepted/overkill techniques belong to a listed subject
 *  4. every referenced subject / technique / pairWith id exists
 *  5. extra layers: unique keys, unique option ids, accepted ⊆ options
 *  5b. the Spanish block (es): its layer keys and option ids exist, traps has as many entries as the English list
 *  6. url host is on the allowlist
 *  7. warns when a ready summary (the original statement) names the technique
 *  8. (optional) no problem id that exists on BASE_REF has been deleted
 *  9. drills/: big-o.json and drills/<subject>.json match their schemas; complexity thresholds
 *     don't grow with the complexity; algorithm ids unique; 3 wrong options, none equal to the
 *     right one; the subject exists and is visible
 *
 * Exit code 1 on any error. Warnings (e.g. drafts, unverified constraints) don't fail the run.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, basename, relative } from 'node:path'
import { execSync } from 'node:child_process'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

type Role = 'intended' | 'accepted' | 'overkill'
interface RoleRef { id: string; role: Role }
interface Layer {
  key: string
  kind: string
  prompt: string
  options: { id: string; text: string; why?: string }[]
  accepted: string[]
  explanation: string
}
interface Problem {
  id: string
  status: 'draft' | 'ready'
  title: string
  url: string
  summary: string
  constraints: { text: string; verified: boolean }
  answers: { subjects: RoleRef[]; techniques: RoleRef[] }
  appearsIn?: string[]
  distractors?: string[]
  pairWith?: string[]
  traps?: string[]
  extraLayers?: Layer[]
  deprecated: boolean
  es?: {
    explanation?: string
    traps?: string[]
    layers?: Record<string, { explanation?: string; why?: Record<string, string> }>
  }
}
interface BigO {
  opsPerSecond: number
  complexities: { id: string; label: string; maxN: number }[]
  nValues: number[]
}
interface SubjectDrills {
  subject: string
  algorithms: { id: string; name: string; complexity: string; wrong: string[]; explanation: string }[]
}
interface Taxonomy {
  subjects: { id: string; name: string; hidden?: boolean; techniques: { id: string; name: string; confusableWith?: string[] }[] }[]
}

const ROOT = join(import.meta.dirname, '..')
const ALLOWED_HOSTS = [
  'cses.fi', 'codeforces.com', 'atcoder.jp', 'www.spoj.com', 'spoj.com', 'open.kattis.com',
  'leetcode.com', 'usaco.org', 'www.usaco.org', 'acm.timus.ru', 'judge.yosupo.jp', 'oj.uz',
  'www.luogu.com.cn', 'szkopul.edu.pl',
]
// Words that give the answer away if they appear in a summary.
const LEAK_WORDS = [
  'dynamic programming', 'dp', 'memoiz', 'knapsack', 'bitmask', 'digit dp',
  'bfs', 'dfs', 'breadth-first', 'depth-first', 'dijkstra', 'bellman', 'floyd', 'kruskal', 'prim',
  'spanning tree', 'topological', 'union-find', 'union find', 'disjoint set', 'dsu', 'lca',
  'strongly connected', 'scc', '2-sat', 'max flow', 'maximum flow', 'min cut', 'bipartite matching',
  'convex hull', 'rotating calipers', 'cross product', 'shoelace', "pick's theorem", 'sweep line', 'line sweep',
  'sieve', 'totient', 'euler phi', 'chinese remainder', 'crt', 'modular inverse', 'fermat', 'miller', 'pollard',
  'inclusion-exclusion', 'inclusion exclusion', 'möbius', 'mobius', 'extended euclid',
  'binary search', 'ternary search', 'divide and conquer', 'divide & conquer', 'meet in the middle',
  'two pointers', 'sliding window', 'merge sort',
  'segment tree', 'fenwick', 'binary indexed', 'bit tree', 'lazy propagation', 'sparse table',
  'prefix sum', 'persistent', "mo's algorithm", 'greedy',
]

const errors: string[] = []
const warnings: string[] = []
const err = (file: string, msg: string) => errors.push(`${file}: ${msg}`)
const warn = (file: string, msg: string) => warnings.push(`${file}: ${msg}`)

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.json') ? [p] : []
  })
}

const ajv = new Ajv2020({ allErrors: true, strict: true })
addFormats(ajv)
const validateProblem = ajv.compile(readJson(join(ROOT, 'schema/problem.schema.json')))
const validateTaxonomy = ajv.compile(readJson(join(ROOT, 'schema/taxonomy.schema.json')))
const validateBigO = ajv.compile(readJson(join(ROOT, 'schema/big-o.schema.json')))
const validateSubjectDrills = ajv.compile(readJson(join(ROOT, 'schema/subject-drills.schema.json')))

// 1. taxonomy
const taxonomy = readJson<Taxonomy>(join(ROOT, 'taxonomy.json'))
if (!validateTaxonomy(taxonomy)) {
  for (const e of validateTaxonomy.errors ?? []) err('taxonomy.json', `${e.instancePath} ${e.message}`)
}
const subjectIds = new Set(taxonomy.subjects.map((s) => s.id))
if (subjectIds.size !== taxonomy.subjects.length) err('taxonomy.json', 'duplicate subject id')
const techniqueSubject = new Map<string, string>()
for (const s of taxonomy.subjects) {
  for (const t of s.techniques) {
    if (techniqueSubject.has(t.id)) err('taxonomy.json', `duplicate technique ${t.id}`)
    if (!t.id.startsWith(s.id + '.')) err('taxonomy.json', `technique ${t.id} must start with "${s.id}."`)
    techniqueSubject.set(t.id, s.id)
  }
}
for (const s of taxonomy.subjects) {
  for (const t of s.techniques) {
    for (const c of t.confusableWith ?? []) {
      if (!techniqueSubject.has(c)) err('taxonomy.json', `${t.id}.confusableWith references unknown technique ${c}`)
    }
  }
}

// 2–7. problems
const files = walk(join(ROOT, 'problems'))
const problems = new Map<string, { file: string; p: Problem }>()

for (const path of files) {
  const file = relative(ROOT, path)
  let p: Problem
  try {
    p = readJson<Problem>(path)
  } catch (e) {
    err(file, `invalid JSON: ${(e as Error).message}`)
    continue
  }
  if (!validateProblem(p)) {
    for (const e of validateProblem.errors ?? []) err(file, `schema ${e.instancePath || '/'} ${e.message}`)
    continue
  }
  if (basename(path) !== `${p.id}.json`) err(file, `file name must be ${p.id}.json`)
  if (problems.has(p.id)) err(file, `duplicate id ${p.id} (also in ${problems.get(p.id)!.file})`)
  problems.set(p.id, { file, p })

  // answer roles
  const subj = p.answers.subjects
  const tech = p.answers.techniques
  const intendedSubjects = subj.filter((s) => s.role === 'intended')
  const intendedTechs = tech.filter((t) => t.role === 'intended')
  if (intendedSubjects.length !== 1) err(file, 'answers.subjects needs exactly one "intended"')
  if (intendedTechs.length !== 1) err(file, 'answers.techniques needs exactly one "intended"')
  const listedSubjects = new Set(subj.map((s) => s.id))
  for (const s of subj) if (!subjectIds.has(s.id)) err(file, `unknown subject ${s.id}`)
  for (const t of tech) {
    const owner = techniqueSubject.get(t.id)
    if (!owner) err(file, `unknown technique ${t.id}`)
    else if (!listedSubjects.has(owner)) err(file, `technique ${t.id} belongs to subject ${owner}, which isn't in answers.subjects`)
  }
  const mainSubject = intendedSubjects[0]?.id
  if (mainSubject && intendedTechs[0] && techniqueSubject.get(intendedTechs[0].id) !== mainSubject) {
    err(file, `the intended technique must belong to the intended subject (${mainSubject})`)
  }
  const folder = basename(join(path, '..'))
  if (mainSubject && folder !== mainSubject) err(file, `must live in problems/${mainSubject}/`)
  if (new Set(subj.map((s) => s.id)).size !== subj.length) err(file, 'duplicate subject in answers')
  if (new Set(tech.map((t) => t.id)).size !== tech.length) err(file, 'duplicate technique in answers')

  for (const s of p.appearsIn ?? []) if (!subjectIds.has(s)) err(file, `appearsIn: unknown subject ${s}`)
  for (const d of p.distractors ?? []) {
    if (!techniqueSubject.has(d)) err(file, `distractors: unknown technique ${d}`)
    if (tech.some((t) => t.id === d)) err(file, `distractor ${d} is also a correct answer`)
  }

  // extra layers
  const keys = new Set<string>()
  for (const l of p.extraLayers ?? []) {
    if (keys.has(l.key)) err(file, `duplicate layer key ${l.key}`)
    keys.add(l.key)
    const optIds = l.options.map((o) => o.id)
    if (new Set(optIds).size !== optIds.length) err(file, `layer ${l.key}: duplicate option ids`)
    for (const a of l.accepted) if (!optIds.includes(a)) err(file, `layer ${l.key}: accepted "${a}" is not an option`)
    if (l.accepted.length === l.options.length) err(file, `layer ${l.key}: every option is accepted`)
    // the app generates layers with these keys (<id>:subject, <id>:technique)
    if (l.key === 'subject' || l.key === 'technique') err(file, `layer key "${l.key}" is reserved`)
  }

  // Spanish block: it can only translate what exists in English
  if (p.es) {
    if (p.es.traps && p.es.traps.length !== (p.traps ?? []).length) {
      err(file, `es.traps has ${p.es.traps.length} entries, traps has ${(p.traps ?? []).length}`)
    }
    for (const [key, layer] of Object.entries(p.es.layers ?? {})) {
      const english = p.extraLayers?.find((l) => l.key === key)
      if (!english) {
        err(file, `es.layers: no extra layer with key ${key}`)
        continue
      }
      for (const id of Object.keys(layer.why ?? {})) {
        if (!english.options.some((o) => o.id === id)) err(file, `es.layers.${key}.why: no option ${id}`)
      }
    }
  }

  // url
  try {
    const host = new URL(p.url).host
    if (!ALLOWED_HOSTS.includes(host)) err(file, `url host ${host} is not on the allowlist`)
  } catch {
    err(file, 'url is not a valid URL')
  }

  // summary
  if (p.status === 'ready') {
    const text = p.summary.toLowerCase()
    for (const w of LEAK_WORDS) {
      const re = new RegExp(`(^|[^a-z0-9])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`)
      if (re.test(text)) warn(file, `summary gives the technique away ("${w}")`)
    }
    if (!p.constraints.verified) warn(file, 'ready, but constraints are not verified')
  }
}

// cross-file references
for (const { file, p } of problems.values()) {
  for (const id of p.pairWith ?? []) {
    if (id === p.id) err(file, 'pairWith references itself')
    else if (!problems.has(id)) err(file, `pairWith references unknown problem ${id}`)
  }
}

// 9. drills
const drillsDir = join(ROOT, 'drills')
let algorithmCount = 0
let drillFiles: string[] = []
try {
  drillFiles = readdirSync(drillsDir).filter((name) => name.endsWith('.json')).sort()
} catch {
  // no drills yet
}
const sameLatex = (a: string, b: string) => a.replace(/\s+/g, '') === b.replace(/\s+/g, '')
for (const name of drillFiles) {
  const file = `drills/${name}`
  let data: unknown
  try {
    data = readJson(join(drillsDir, name))
  } catch (e) {
    err(file, `invalid JSON: ${(e as Error).message}`)
    continue
  }
  if (name === 'big-o.json') {
    if (!validateBigO(data)) {
      for (const e of validateBigO.errors ?? []) err(file, `schema ${e.instancePath || '/'} ${e.message}`)
      continue
    }
    const table = data as BigO
    const ids = table.complexities.map((c) => c.id)
    if (new Set(ids).size !== ids.length) err(file, 'duplicate complexity id')
    table.complexities.forEach((c, i) => {
      const prev = table.complexities[i - 1]
      if (prev && c.maxN > prev.maxN) err(file, `${c.id}: maxN ${c.maxN} is larger than ${prev.id}'s (${prev.maxN}), which grows slower`)
    })
    continue
  }
  if (!validateSubjectDrills(data)) {
    for (const e of validateSubjectDrills.errors ?? []) err(file, `schema ${e.instancePath || '/'} ${e.message}`)
    continue
  }
  const drills = data as SubjectDrills
  const subject = taxonomy.subjects.find((s) => s.id === drills.subject)
  if (name !== `${drills.subject}.json`) err(file, `file name must be ${drills.subject}.json`)
  if (!subject) err(file, `unknown subject ${drills.subject}`)
  else if (subject.hidden) err(file, `subject ${drills.subject} is hidden, so its drills would never be asked`)
  const seen = new Set<string>()
  for (const a of drills.algorithms) {
    if (seen.has(a.id)) err(file, `duplicate algorithm id ${a.id}`)
    seen.add(a.id)
    if (a.wrong.some((w) => sameLatex(w, a.complexity))) err(file, `${a.id}: a wrong option equals the right complexity`)
    if (new Set(a.wrong.map((w) => w.replace(/\s+/g, ''))).size !== a.wrong.length) err(file, `${a.id}: two wrong options are the same`)
  }
  algorithmCount += drills.algorithms.length
}

// 8. deleted ids
const baseRef = process.env.BASE_REF
if (baseRef) {
  try {
    const listing = execSync(`git ls-tree -r --name-only ${baseRef} -- problems`, { cwd: ROOT, encoding: 'utf8' })
    for (const line of listing.split('\n').filter((l) => l.endsWith('.json'))) {
      const id = basename(line, '.json')
      if (!problems.has(id)) err(line, `problem ${id} exists on ${baseRef} but was deleted; set "deprecated": true instead`)
    }
  } catch (e) {
    warn('git', `could not compare against ${baseRef}: ${(e as Error).message.split('\n')[0]}`)
  }
}

// report
const all = [...problems.values()].map((x) => x.p)
const drafts = all.filter((p) => p.status === 'draft').length
const unverified = all.filter((p) => !p.constraints.verified).length
console.log(`${all.length} problems (${all.length - drafts} ready, ${drafts} draft, ${unverified} with unverified constraints)`)
console.log(`${algorithmCount} algorithm drills in ${drillFiles.filter((f) => f !== 'big-o.json').length} subject files${drillFiles.includes('big-o.json') ? ', plus the Big O table' : ''}`)
if (process.argv.includes('--verbose')) for (const w of warnings) console.log(`warning  ${w}`)
else if (warnings.length) console.log(`${warnings.length} warnings (run with --verbose to list)`)
for (const e of errors) console.error(`error    ${e}`)
if (errors.length) {
  console.error(`\n${errors.length} error(s)`)
  process.exit(1)
}
console.log('OK')
