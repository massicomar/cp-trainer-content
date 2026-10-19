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
 *  6. url host is on the allowlist
 *  7. ready problems have a summary that doesn't leak the technique
 *  8. (optional) no problem id that exists on BASE_REF has been deleted
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
  extraLayers?: Layer[]
  deprecated: boolean
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

// 1. taxonomy
const taxonomy = readJson<Taxonomy>(join(ROOT, 'taxonomy.json'))
if (!validateTaxonomy(taxonomy)) {
  for (const e of validateTaxonomy.errors ?? []) err('taxonomy.json', `${e.instancePath} ${e.message}`)
}
const subjectIds = new Set(taxonomy.subjects.map((s) => s.id))
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
      if (re.test(text)) err(file, `summary gives the technique away ("${w}")`)
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
if (process.argv.includes('--verbose')) for (const w of warnings) console.log(`warning  ${w}`)
else if (warnings.length) console.log(`${warnings.length} warnings (run with --verbose to list)`)
for (const e of errors) console.error(`error    ${e}`)
if (errors.length) {
  console.error(`\n${errors.length} error(s)`)
  process.exit(1)
}
console.log('OK')
