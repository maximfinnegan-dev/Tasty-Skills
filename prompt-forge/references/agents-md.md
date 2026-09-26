# AGENTS.md — what to tell implementing agents

This file is the **spec you write into other artifacts**, not something you produce yourself.

You never write an `AGENTS.md`. You have not seen the repository, so any map you wrote would be invented — and under a read-before-changes contract a confidently wrong map is worse than no map at all, because agents trust it instead of searching. What you write is the standing directive that makes the implementing agent build and maintain one, and the spec of what belongs in it.

The layering:

| Who | Writes | Contains |
|---|---|---|
| **You** | The prompt, `CLAUDE.md`, or skill file | The directive: read it, update it, and what belongs in it |
| **The implementing agent** | `AGENTS.md` | The actual map of the actual repository |

Drop-in directive blocks are in `assets/templates/agents-md-directive.md`, sized for each artifact type. This file is the reasoning behind them — read it when you need to adapt a block, judge whether a user's existing `AGENTS.md` guidance is sound, or explain to a user why their file keeps going stale.

> **Location invariant — no exceptions.** `AGENTS.md` lives at the **root of the repository**, committed to git. It never goes in `.claude/`, `.cursor/`, `.github/`, or any other tool's directory, and it is never gitignored. In a monorepo, additional copies go at the root of each package — still in the repo, still committed. Every directive you emit must name the repository root as the path.

`AGENTS.md` is a project artifact, not a tool configuration file: versioned, reviewed in PRs, and shared across every agent and every human who works in the repo. That is the whole point of it — a file inside one tool's private directory serves one tool and disappears from everyone else's view.

The same applies to the `CLAUDE.md` that carries the directive. Claude Code will load it from either `./CLAUDE.md` or `./.claude/CLAUDE.md`, but put it at the **repository root** so it sits beside the map it refers to and stays visible to anyone reading the project.

**Contents**
- [The two-way contract](#the-two-way-contract)
- [Why reading beats grepping](#why-reading-beats-grepping)
- [Reading it under GPT-6 Astra](#reading-it-under-gpt-6-astra)
- [The map is a router, not an index](#the-map-is-a-router-not-an-index)
- [Staleness is the failure mode](#staleness-is-the-failure-mode)
- [What belongs in it](#what-belongs-in-it)
- [What does not belong](#what-does-not-belong)
- [Size and structure](#size-and-structure)
- [Wiring it to Claude Code](#wiring-it-to-claude-code)
- [Monorepos](#monorepos)
- [Repos that have none yet](#repos-that-have-none-yet)
- [Symptoms that AGENTS.md is the fix](#symptoms-that-agentsmd-is-the-fix)

---

## The two-way contract

`AGENTS.md` only works if both halves of it hold. Build both into the prompts you write:

**Read it before making changes.** Not after getting lost. The read happens at the start of the task, before the first search, so the exploration that follows is aimed rather than exhaustive.

**Update it after every major change.** A change that moves a boundary, adds a directory, changes a command, or invalidates something the file asserts is a change to the map. The agent that made the change is the one that knows what moved, and it is the cheapest possible moment to write it down.

Neither half survives on its own. Read-without-update produces a file that decays until agents learn to ignore it. Update-without-read produces a well-maintained document nobody consults. Every directive you write must carry both — see `assets/templates/agents-md-directive.md`.

---

## Why reading beats grepping

An agent dropped into an unfamiliar repository with a task and no map does the same thing every time: globs the tree, greps for a few likely identifiers, opens six files to find the two that matter, and reconstructs from scratch the layout somebody already knew. It usually gets there. It costs a dozen tool calls and a large share of the context window before any work starts, and it happens again next session, and the session after that.

A map read in one call replaces most of that. The saving is real and it compounds across every session in the repo's life.

There is a second effect that matters more than the token count. Search finds *what matches*; a map explains *what is meant*. Grep can show that two modules both contain retry logic. Only the map can say that one of them is deprecated and the other is the one to extend. That kind of fact is a decision, not a property of the code, and it is unreachable by any amount of searching. It is why the file earns its place even in a repo the agent has seen before.

**This reframes a caveat that would otherwise apply.** Anthropic's guidance warns against putting directory layouts in an always-loaded instruction file, on the grounds that the model can derive them by reading and the context is spent every session whether it is needed or not. That objection is sound *for an always-loaded file*. It largely dissolves when the map is read deliberately at the start of a task that needs it, because then it is not a standing tax — it is a cheaper substitute for search the agent was going to perform anyway. Keep the underlying warning, though: the map must stay smaller and slower-changing than the code it describes, or it stops paying for itself.

---

## Reading it under GPT-6 Astra

The contract above suits the Claude targets and Sol, where an unconditional read at the start of a task is cheap insurance. OpenAI's guidance for GPT-6 Astra points the other way: requiring a stack of docs or a full repo map before every edit is excessive for something like a typo fix, and it burns context. Astra is also more sensitive than earlier models to what an instruction file says, so a line that once nudged now steers.

The router design already fits. A map that says which doc to use for which kind of change is the contextual pointer OpenAI recommends, so only the trigger changes:

- **Read half: proportionate.** Read it when the task spans more than one area or you do not know where things live. Skip it for a change confined to a file already in hand.
- **Update half and trust-but-verify: unchanged.** These keep the file honest, and OpenAI's own advice is to keep such docs current.
- **Loading.** OpenAI describes `AGENTS.md` as applying whenever the model works in the repository. That puts it in the always-loaded category rather than the read-on-demand one this file's size targets assume: aim near 200 lines, keep the map a router, and cut every line whose removal would not cause a mistake. Where the harness loads it automatically, a "read AGENTS.md first" instruction is redundant; drop it and keep the update half.
- **Mixed repos.** If Astra and other agents both read the file, use the proportionate wording. A trivial change skips the read and a cross-cutting one triggers it. This is a judgment call, not a documented recommendation.

The replacement wording is in `assets/templates/agents-md-directive.md`.

---

## The map is a router, not an index

This is the distinction that decides whether the file survives contact with a real codebase.

An **index** tries to describe everything. It goes stale the week it is written, it grows without bound, and because agents read it before searching, its errors propagate into work. An index is the thing Anthropic's guidance is right to warn about.

A **router** narrows the search space and hands off. It says where to start looking and what a directory is for, then lets the agent grep within a scope one tenth the size. It stays short, it changes only when architecture changes, and being incomplete is not a defect — it never claimed completeness.

Write for the router. In practice:

| Write | Not |
|---|---|
| `src/services/` — business logic. Handlers stay thin and call into here. | A list of the 40 files in `src/services/` |
| Auth flows start at `src/auth/session.ts` | "`session.ts` contains the session class, `token.ts` contains…" |
| `src/legacy/` — deprecated, read for reference, do not extend | Nothing, and then a change built on top of it |
| Two payment paths exist: `billing/` is current, `payments/` is being retired | "`payments/` handles payments" |
| Generated, do not edit: `src/api/generated/`, `*.pb.go` | Nothing, and then a diff full of regenerated files |

The last three rows are the highest-value lines in any map, because they encode decisions that no amount of reading recovers.

---

## Staleness is the failure mode

Under a read-before-changes contract the agent *trusts* the map instead of verifying it. That makes accuracy load-bearing in a way it was not when the file was merely passive context. A stale index is no longer just wasted tokens — it actively misdirects work.

Three things keep it honest, and prompts should carry all three:

**Anchor on slow-moving facts.** Directory responsibilities, boundaries, entry points, and deliberate decisions change on the order of months. Individual filenames change weekly. Write the former; the latter is what grep is for.

**Make it self-correcting.** Include a trust-but-verify clause so a wrong map gets fixed by whichever agent hits it first, rather than misleading every agent in turn:

```
If anything in AGENTS.md contradicts what you find in the code, the code is
right. Fix the file as part of your change and say what you corrected.
```

**Update at the moment of change.** After the fact, from a cold context, nobody knows what moved. The agent that just moved it does.

A map that is 80% accurate and known to be approximate is useful. A map that claims completeness and is 80% accurate is a liability.

---

## What belongs in it

Ordered roughly by value to an agent starting a task:

**The map.** Directory responsibilities, boundaries, entry points, generated and vendored areas, deprecated paths, and any place where two similar-looking things are not interchangeable. See above.

**Commands that cannot be guessed.** Build, test, lint, typecheck, dev server, migrations — exact invocations, including non-obvious flags. Plus the preferences: run a single test while iterating rather than the whole suite; typecheck after a series of edits.

**How to verify a change.** The single most valuable line in the file for agentic work. What command proves a change is good, and what a passing state looks like. An agent with this stops when the check passes rather than when the work looks done. State the command and what a passing state looks like, not an exhortation to test: Astra tests unprompted, and "always run tests" now yields checks broader than the change needs.

**Conventions that differ from the language default.** ESM not CommonJS, error-handling style, naming, indentation. These earn their place *because* they are not what the model would assume — standard conventions it already knows are noise.

**Architectural decisions that look arbitrary from outside.** Why state lives here rather than there, which layer owns validation, what a module boundary is meant to protect. Unrecoverable by reading, and the source of most well-intentioned wrong changes.

**Environment requirements.** Env vars, ports, services that must be running, setup steps that fail silently on a fresh checkout.

**Repository etiquette.** Branch naming, commit format, PR conventions, what must never be committed directly.

**Gotchas.** The thing that bites everyone once. The function whose name misdescribes it.

**Standing permissions.** Workflows you know are safe, stated once, so the agent stops asking at each step. For example: the local tests use disposable fixtures and have no production access, so it may run them and fix failures without approval. Most useful for Astra, which will not act until it knows an action is safe.

**Update instructions for the file itself.** A short section stating what counts as a major change and where new entries go. It makes the maintenance half of the contract self-documenting rather than dependent on whoever wrote the prompt.

**Tooling notes.** If the project uses GitHub heavily, say to use the `gh` CLI — it is the most context-efficient path to issues, PRs, and comments, and unauthenticated API calls hit rate limits.

---

## What does not belong

- **A file-by-file inventory.** The index failure mode. Directory level, always.
- **Anything trivially derivable and fast-changing.** Dependency lists, exported symbol names, function signatures. Grep is better at this and never wrong.
- **Detailed API documentation.** Link to it. Docs belong where they are maintained.
- **Volatile state.** Current sprint, in-flight work, version numbers, TODO lists. Wrong is worse than absent.
- **Long explanations and tutorials.** A reference an agent scans, not onboarding prose.
- **Self-evident practices.** "Write clean code", "add tests where appropriate". Consumes attention, changes nothing.
- **Secrets, tokens, connection strings, internal URLs.** The file is committed, and public if the repo is.

The test for each line: **would removing this cause an agent to make a mistake, or waste a search?** If neither, cut it.

---

## Size and structure

**Target 150–250 lines**, with the map itself 30–60. That is looser than the ~200-line ceiling Anthropic recommends for an always-loaded `CLAUDE.md`, and deliberately so: a file read on demand at the start of a task can afford more than one loaded into every session regardless of need. If you wire it as an always-loaded import (see below), or the harness loads it automatically, tighten toward 200 total.

If it grows past that, the answer is not smaller sections. Route the excess:

| Content | Goes |
|---|---|
| Applies repo-wide, needed to start any task | `AGENTS.md` |
| Applies to one package or subtree | A nested `AGENTS.md` in that directory |
| A deep procedure or domain reference | A skill, loaded on demand |
| Must happen every time without exception | A hook — instruction files are advisory, hooks are deterministic |
| Personal, not team | A gitignored local file |

**Structure** with markdown headers and bullets, grouped by topic. Agents scan structure the way readers do.

**Be concrete enough to verify.** "Use 2-space indentation" over "format code properly". "Run `npm test` before committing" over "test your changes". "API handlers live in `src/api/handlers/`" over "keep files organized".

**Check for contradictions** when adding. Two rules that conflict make the agent pick one arbitrarily, including across nested files. On Astra a conflict can instead stall the work while it decides what you meant.

---

## Wiring it to Claude Code

**Claude Code reads `CLAUDE.md`, not `AGENTS.md`.** Without glue, the file sits in the repo and Claude Code never sees it. Two options, and the choice follows from how you want it read:

**Option A — import, for always-loaded.** A `CLAUDE.md` at the root containing `@AGENTS.md`. Claude Code expands it at session start; anything below the import is Claude-specific and appends after it. No read step needed, but it costs its full length in every session whether the task needs it or not. Best when the file is short and agents work in the repo constantly.

```markdown
@AGENTS.md

## Claude Code
Use plan mode for changes under `src/billing/`.
```

**Option B — pointer, for read-on-demand.** A short `CLAUDE.md` instructing the agent to read the map before making changes. This matches the contract model, keeps session context cheap, and scales to a larger map. The tradeoff is that it is advisory — a pointer can be skipped in a way an import cannot.

```markdown
Before making any code change, read AGENTS.md at the repository root. It maps
the codebase and records conventions, commands, and decisions. Read it before
searching, and update it when your change makes any part of it wrong.
```

Given the read-before-changes contract, **Option B is the better default**, with Option A preferable when the whole file is under roughly 100 lines. Either way, verify with `/context` in a Claude Code session — `CLAUDE.md` should appear under **Memory files**. If it is absent, none of this is loading.

A symlink (`ln -s AGENTS.md CLAUDE.md`) works where no Claude-specific content is wanted, but not on Windows without Administrator or Developer Mode.

Scattered per-tool config — `.cursor/rules/`, `.cursorrules`, `.github/copilot-instructions.md`, `.windsurfrules`, `.clinerules` — is worth folding into `AGENTS.md` rather than leaving partial copies to drift apart.

---

## Monorepos

A root `AGENTS.md` maps the packages and states what is shared. Each substantial package gets its own `AGENTS.md` covering its internals. The root file stays a router: it says which package owns what and where the boundaries are, then hands off.

This mirrors how Claude Code loads nested instruction files — the root at launch, subdirectory files when the agent works in them — and it keeps any single file within a size that stays accurate. Prompts scoped to one package should tell the agent to read both.

---

## Repos that have none yet

Do not write a separate setup task for this. Fold "create it if absent" into the standing directive, so the file bootstraps itself the first time any agent works in a repo that lacks one. No setup step to remember, and no gap between the directive existing and the file existing.

Two conditions belong in that conditional instruction, and both are in the templates: the agent must **explore before writing** rather than pattern-matching from filenames, and it must **report what it inferred versus verified**. Inferred details are the ones most likely wrong and most expensive to leave wrong, since every later session will trust them.

Claude Code's `/init` produces a starting `CLAUDE.md` from the codebase and `/doctor` proposes trims for one that has grown. Worth mentioning to a user as a seed, but they generate what the tool can derive — the value is in the part it cannot: rationale, gotchas, deprecations, and boundaries.

## Symptoms that AGENTS.md is the fix

When a user describes one of these, the durable fix is the file, not a better prompt. Say so — a prompt fixes one session, the file fixes all of them.

| The user says | Fix |
|---|---|
| "It greps around forever before doing anything" | The map, plus the read-first instruction |
| "It edited the generated files" | Generated and do-not-edit paths in the map |
| "It extended the deprecated module" | Deprecated paths marked in the map |
| "I keep telling it the build command" | Commands section |
| "It uses the wrong test runner every time" | Commands section |
| "It writes CommonJS and we use ESM" | Conventions section |
| "It puts new files in the wrong place" | Directory responsibilities |
| "It doesn't know it needs Redis running" | Environment requirements |
| "It keeps hitting the same gotcha" | Gotchas section |
| "The file is there but it's out of date" | The update half of the contract is missing from prompts |
| "It ignores a rule that's in the file" | File is too long and the rule is buried — prune, or move it to a hook |
| "It commits straight to main" | Etiquette section *and* a hook, since this must not depend on judgment |
| "It reads the whole map before a one-line fix" | Astra: the proportionate read wording |
| "It stops to ask before running our local tests" | A standing permission in the file |
| "It asks approval for things that never needed it on the last model" | Precautionary boundary language in the file; audit it (`model-profiles.md`, GPT-6 Astra) |
