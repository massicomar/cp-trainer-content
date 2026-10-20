/**
 * Fills `summary` with each problem's original statement (D-061: the app is
 * for private use, so statements are copied exactly).
 *
 *   npm run statements                     fetch CSES / AtCoder / Kattis problems with an empty summary
 *   npm run statements -- --force          also overwrite summaries that are already filled
 *   npm run statements -- --only cses-1158,atcoder-dp-a
 *   npm run statements -- --snippet        write statements-snippet.js for Codeforces / SPOJ
 *   npm run statements -- --from ~/Downloads/codeforces-statements.json
 *
 * Codeforces and SPOJ sit behind a bot check that scripts can't pass, so their
 * pages are collected in your own browser: run the snippet in the console on
 * codeforces.com (and on spoj.com), it downloads a JSON file, and `--from`
 * imports it.
 *
 * What goes in: the statement, then its Input and Output sections. Left out:
 * the title, limits, Constraints (they live in `constraints`), samples and
 * notes. Math stays as the judge's LaTeX, written `$…$` (`$$…$$` for display).
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse as parseHtml, type HTMLElement, type Node } from 'node-html-parser'

const ROOT = join(import.meta.dirname, '..')
const DELAY_MS = 1500
const USER_AGENT = 'cp-trainer-content statement fetcher (private study tool)'

type Judge = 'CSES' | 'AtCoder' | 'Kattis' | 'Codeforces' | 'SPOJ'
const DIRECT: Judge[] = ['CSES', 'AtCoder', 'Kattis']
const BROWSER: Record<string, string> = { Codeforces: 'codeforces.com', SPOJ: 'www.spoj.com' }

interface ProblemEntry {
  path: string
  data: Record<string, any>
}

// ---------------------------------------------------------------------------
// HTML → text with LaTeX
// ---------------------------------------------------------------------------

/** Like node-html-parser's parse, but also parses inside <pre> (input formats use <var>). */
function parse(html: string) {
  return parseHtml(html, { blockTextElements: { script: true, noscript: true, style: true } })
}

const ELEMENT = 1
const TEXT = 3
const BLOCK_TAGS = new Set([
  'p', 'div', 'section', 'ul', 'ol', 'pre', 'table', 'center', 'blockquote',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
])

function isElement(node: Node): node is HTMLElement {
  return node.nodeType === ELEMENT
}

function tag(node: HTMLElement) {
  return (node.rawTagName ?? '').toLowerCase()
}

function hasClass(node: HTMLElement, name: string) {
  return (node.getAttribute('class') ?? '').split(/\s+/).includes(name)
}

/**
 * Inline content: text plus math, as one string. Line breaks in the HTML
 * source are just spaces (as a browser shows them); only <br> breaks a line.
 * Inside <pre>, text is kept as is.
 */
function inline(node: Node, pre = false): string {
  if (node.nodeType === TEXT) return pre ? node.text : node.text.replace(/\s+/g, ' ')
  if (!isElement(node)) return ''
  const name = tag(node)
  if (name === 'br') return '\n'
  if (name === 'img') return '[image]'
  if (name === 'var') return `$${node.text}$` // AtCoder
  if (hasClass(node, 'math-inline')) return `$${node.text}$` // CSES
  if (hasClass(node, 'math-display')) return `$$${node.text}$$` // CSES
  if (hasClass(node, 'tex2jax_process')) return node.text // Kattis: already $…$
  return node.childNodes.map((child) => inline(child, pre)).join('')
}

function tidy(text: string) {
  return (
    text
      // Codeforces writes math as $$$…$$$ (and $$$$$$…$$$$$$ for display).
      .replace(/\${6}([\s\S]+?)\${6}/g, '$$$$$1$$$$')
      .replace(/\${3}([\s\S]+?)\${3}/g, '$$$1$$')
      .replace(/[ \t\r\f\v]+/g, ' ')
      .replace(/ *\n */g, '\n')
      .trim()
  )
}

/** Block content: paragraphs, lists and preformatted text, in order. */
function blocks(node: HTMLElement | Node[]): string[] {
  const nodes = Array.isArray(node) ? node : node.childNodes
  const out: string[] = []
  let pending = ''
  const flush = () => {
    const text = tidy(pending)
    if (text) out.push(text)
    pending = ''
  }

  for (const child of nodes) {
    if (!isElement(child) || !BLOCK_TAGS.has(tag(child))) {
      pending += inline(child)
      continue
    }
    flush()
    const name = tag(child)
    if (name === 'ul' || name === 'ol') {
      const items = child.childNodes.filter((n) => isElement(n) && tag(n) === 'li')
      const lines = items.map((li, i) => `${name === 'ol' ? `${i + 1}.` : '-'} ${tidy(inline(li))}`)
      if (lines.length) out.push(lines.join('\n'))
    } else if (name === 'pre') {
      // Input formats: keep the line breaks exactly.
      const text = child.childNodes.map((n) => inline(n, true)).join('').replace(/\s+$/, '')
      if (text.trim()) out.push(text)
    } else if (name === 'table') {
      // Statements don't put prose in tables; samples are handled per judge.
      continue
    } else if (/^h[1-6]$/.test(name)) {
      const text = tidy(inline(child))
      if (text) out.push(text)
    } else {
      out.push(...blocks(child))
    }
  }
  flush()
  return out
}

function join_(parts: string[]) {
  return parts.join('\n\n').trim()
}

// ---------------------------------------------------------------------------
// Per judge: which part of the page is the statement
// ---------------------------------------------------------------------------

/** Keeps the statement plus its Input / Output sections, by heading. */
const KEEP = new Set(['input', 'output'])

function cses(html: string) {
  const md = parse(html).querySelector('div.md')
  if (!md) throw new Error('no div.md on the page')
  const kept: string[] = []
  let section = 'statement'
  for (const child of md.childNodes) {
    if (isElement(child) && tag(child) === 'h1') {
      section = tidy(child.text).toLowerCase()
      if (KEEP.has(section)) kept.push(tidy(child.text))
      continue
    }
    if (section !== 'statement' && !KEEP.has(section)) continue
    kept.push(...blocks([child]))
  }
  return join_(kept)
}

function atcoder(html: string) {
  const root = parse(html)
  const english = root.querySelector('#task-statement span.lang-en') ?? root.querySelector('#task-statement')
  if (!english) throw new Error('no #task-statement on the page')
  const kept: string[] = []
  for (const section of english.querySelectorAll('section')) {
    const heading = section.querySelector('h3')
    const title = heading ? tidy(heading.text) : ''
    const key = title.toLowerCase()
    if (key !== 'problem statement' && !KEEP.has(key)) continue
    heading?.remove()
    if (KEEP.has(key)) kept.push(title)
    kept.push(...blocks(section))
  }
  return join_(kept)
}

function kattis(html: string) {
  const body = parse(html).querySelector('div.problembody')
  if (!body) throw new Error('no div.problembody on the page')
  for (const extra of body.querySelectorAll('.illustration, table.sample')) extra.remove()
  const kept: string[] = []
  let section = 'statement'
  for (const child of body.childNodes) {
    if (isElement(child) && /^h[23]$/.test(tag(child))) {
      section = tidy(child.text).toLowerCase()
      if (KEEP.has(section)) kept.push(tidy(child.text))
      continue
    }
    if (section !== 'statement' && !KEEP.has(section)) continue
    kept.push(...blocks([child]))
  }
  return join_(kept)
}

function codeforces(html: string) {
  const statement = parse(html).querySelector('.problem-statement')
  if (!statement) throw new Error('no .problem-statement in the captured page')
  const kept: string[] = []
  for (const child of statement.childNodes) {
    if (!isElement(child)) continue
    if (hasClass(child, 'header') || hasClass(child, 'sample-tests') || hasClass(child, 'note')) continue
    const title = child.querySelector('.section-title')
    if (hasClass(child, 'input-specification') || hasClass(child, 'output-specification')) {
      kept.push(title ? tidy(title.text) : '')
      title?.remove()
    } else if (title) {
      continue // other titled sections (interaction, scoring…): not part of the statement
    }
    kept.push(...blocks(child))
  }
  return join_(kept.filter(Boolean))
}

function spoj(html: string) {
  const body = parse(html).querySelector('#problem-body')
  if (!body) throw new Error('no #problem-body in the captured page')
  const kept: string[] = []
  let section = 'statement'
  for (const child of body.childNodes) {
    if (isElement(child) && /^h[1-4]$/.test(tag(child))) {
      section = tidy(child.text).toLowerCase()
      if (KEEP.has(section)) kept.push(tidy(child.text))
      continue
    }
    if (section !== 'statement' && !KEEP.has(section)) continue
    kept.push(...blocks([child]))
  }
  return join_(kept)
}

const EXTRACT: Record<Judge, (html: string) => string> = {
  CSES: cses,
  AtCoder: atcoder,
  Kattis: kattis,
  Codeforces: codeforces,
  SPOJ: spoj,
}

// ---------------------------------------------------------------------------
// Problems on disk
// ---------------------------------------------------------------------------

function problems(): ProblemEntry[] {
  const entries: ProblemEntry[] = []
  for (const subject of readdirSync(join(ROOT, 'problems'))) {
    for (const file of readdirSync(join(ROOT, 'problems', subject))) {
      if (!file.endsWith('.json')) continue
      const path = join(ROOT, 'problems', subject, file)
      entries.push({ path, data: JSON.parse(readFileSync(path, 'utf8')) })
    }
  }
  return entries.sort((a, b) => a.data.id.localeCompare(b.data.id))
}

function save(entry: ProblemEntry, summary: string) {
  entry.data.summary = summary
  writeFileSync(entry.path, `${JSON.stringify(entry.data, null, 2)}\n`)
}

function pageUrl(data: Record<string, any>) {
  // AtCoder serves both languages; ask for English.
  return data.source === 'AtCoder' ? `${data.url}?lang=en` : data.url
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

const args = process.argv.slice(2)
const flag = (name: string) => args.includes(name)
const option = (name: string) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
const force = flag('--force')
const only = option('--only')?.split(',')

function wanted(entry: ProblemEntry) {
  if (only) return only.includes(entry.data.id)
  return force || !entry.data.summary
}

async function fetchDirect() {
  const todo = problems().filter((e) => DIRECT.includes(e.data.source) && wanted(e))
  const skipped = problems().filter((e) => e.data.source in BROWSER && wanted(e)).length
  console.log(`${todo.length} problems to fetch from CSES / AtCoder / Kattis`)
  let failed = 0
  for (const [i, entry] of todo.entries()) {
    const { id, source } = entry.data
    try {
      const response = await fetch(pageUrl(entry.data), { headers: { 'user-agent': USER_AGENT } })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const summary = EXTRACT[source as Judge](await response.text())
      if (summary.length < 20) throw new Error('statement came out empty')
      save(entry, summary)
      console.log(`[${i + 1}/${todo.length}] ${id}: ${summary.length} chars`)
    } catch (error) {
      failed++
      console.error(`[${i + 1}/${todo.length}] ${id}: FAILED (${(error as Error).message})`)
    }
    if (i < todo.length - 1) await new Promise((resolve) => setTimeout(resolve, DELAY_MS))
  }
  console.log(`done: ${todo.length - failed} filled, ${failed} failed`)
  if (skipped) {
    console.log(`${skipped} Codeforces / SPOJ problems need the browser: npm run statements -- --snippet`)
  }
}

function writeSnippet() {
  const pages: Record<string, Record<string, string>> = {}
  for (const entry of problems()) {
    const host = BROWSER[entry.data.source]
    if (!host || !wanted(entry)) continue
    pages[host] ??= {}
    pages[host][entry.data.id] = new URL(entry.data.url).pathname
  }
  const snippet = `// Paste into the browser console on ${Object.keys(pages).join(' and on ')}.
// It opens each problem page of that site (one every ${DELAY_MS / 1000}s) and downloads a JSON file with
// the statements. Then: npm run statements -- --from <that file>
(async () => {
  const pages = ${JSON.stringify(pages, null, 2)}
  const mine = pages[location.host]
  if (!mine) return console.error('Run this on: ' + Object.keys(pages).join(', '))
  const selector = location.host.includes('codeforces') ? '.problem-statement' : '#problem-body'
  const out = {}
  for (const [id, path] of Object.entries(mine)) {
    const html = await (await fetch(path, { credentials: 'include' })).text()
    const node = new DOMParser().parseFromString(html, 'text/html').querySelector(selector)
    out[id] = node ? node.outerHTML : null
    console.log(id, node ? 'ok' : 'NOT FOUND')
    await new Promise((resolve) => setTimeout(resolve, ${DELAY_MS}))
  }
  const name = location.host.replace(/^www\\./, '').split('.')[0] + '-statements.json'
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([JSON.stringify(out, null, 1)], { type: 'application/json' }))
  link.download = name
  link.click()
  console.log('Saved ' + name)
})()
`
  writeFileSync(join(ROOT, 'statements-snippet.js'), snippet)
  const count = Object.values(pages).reduce((n, p) => n + Object.keys(p).length, 0)
  console.log(`wrote statements-snippet.js (${count} problems on ${Object.keys(pages).join(', ')})`)
}

function importCaptured(file: string) {
  const captured: Record<string, string | null> = JSON.parse(readFileSync(file, 'utf8'))
  const byId = new Map(problems().map((e) => [e.data.id, e]))
  let filled = 0
  for (const [id, html] of Object.entries(captured)) {
    const entry = byId.get(id)
    if (!entry) {
      console.error(`${id}: not a problem in this repo`)
      continue
    }
    if (!wanted(entry)) {
      console.log(`${id}: already has a summary (use --force to overwrite)`)
      continue
    }
    try {
      if (!html) throw new Error('the page had no statement')
      const summary = EXTRACT[entry.data.source as Judge](html)
      if (summary.length < 20) throw new Error('statement came out empty')
      save(entry, summary)
      filled++
      console.log(`${id}: ${summary.length} chars`)
    } catch (error) {
      console.error(`${id}: FAILED (${(error as Error).message})`)
    }
  }
  console.log(`done: ${filled} filled from ${file}`)
}

// For testing the extractors on a saved page: --extract <judge> <file.html>
if (flag('--extract')) {
  const [judge, file] = [option('--extract'), args[args.indexOf('--extract') + 2]]
  console.log(EXTRACT[judge as Judge](readFileSync(file!, 'utf8')))
} else if (flag('--snippet')) {
  writeSnippet()
} else if (option('--from')) {
  importCaptured(option('--from')!)
} else {
  await fetchDirect()
}
