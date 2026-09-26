# Template — the AGENTS.md directive

Drop-in blocks that instruct a **future implementing LLM** to create and maintain an `AGENTS.md` in its repository.

**You do not write the AGENTS.md.** You have not seen the repo, so you cannot write an accurate map — and a map that is confidently wrong is worse than none, because agents read it instead of searching. What you write is the standing instruction that makes the implementing agent build and maintain one, plus the spec of what belongs in it.

Pick the form that matches the artifact you are producing. They differ by budget: a `CLAUDE.md` is loaded into every session and must stay tight; a skill loads only when it fires and can afford the full spec. If GPT-6 Astra will read the file, swap in the variant read clause near the end.

`AGENTS.md` always lives at the repository root, committed to git. Never in `.claude/`, `.cursor/`, or any tool directory. Every block below names the path for that reason — leave it in.

---

## Short form — for a CLAUDE.md

A `CLAUDE.md` costs its full length in every session. Keep the directive to roughly this size; the detail belongs in `AGENTS.md` itself once it exists.

```markdown
## Repository map

This project keeps an `AGENTS.md` at the repository root: a map of the codebase
plus its commands, conventions, and decisions.

- **Read it before making changes.** Use it to decide where to look instead of
  searching the tree blind, then search within the area it points to.
- **Update it when your change makes part of it wrong** — a moved boundary, a
  new or removed directory, a changed command, a new gotcha. Edit only the
  affected lines; do not restructure the file.
- **If it contradicts the code, the code is right.** Fix the file as part of
  your change and say what you corrected.

If `AGENTS.md` does not exist yet, create it: explore the repo first, then write
a map at the directory level — what each area is for, entry points, deprecated
and generated paths, and anything an agent would otherwise have to discover by
searching. Add the build, test, and verification commands, conventions that
differ from the language default, and environment requirements. Keep it under
250 lines and do not list individual files.
```

---

## Full form — for a skill file

A skill loads on demand, so it can carry the whole spec. Use this in any skill whose work happens inside a repository — a backend skill, a deployment skill, a review skill.

```markdown
## Repository map

Before changing code in a repository, read `AGENTS.md` at its root. It maps the
codebase and records the commands, conventions, and decisions for the project.
Read it before searching, then search within the area it points you to — this
replaces most of the exploratory globbing and grepping that would otherwise
open every task.

If it contradicts what you find in the code, the code is right. Fix the file as
part of your change and say what you corrected.

### Maintaining it

Update `AGENTS.md` whenever your change makes part of it wrong or incomplete:
a moved boundary, an added or removed directory, a changed command, a changed
convention, a deprecation, or a gotcha that would have saved you time. Edit only
the affected lines — do not restructure the file, and do not add anything an
agent could work out by reading the code.

### Creating it, if the repository has none

Explore before writing: read the build and test configuration, the CI config,
the entry points, and enough source to be accurate. Do not infer a directory's
purpose from its name.

Write it at the repository root (`./AGENTS.md`, committed to git — never in a
tool's config directory), covering:

- **The map**, at directory level, 30-60 lines. For each significant directory:
  what it is for and what deliberately does not belong in it. Prioritise entry
  points, directories whose purpose is not obvious from the name, places where
  two similar-looking things are not interchangeable, deprecated areas that
  should be read but not extended, and generated or vendored do-not-edit paths.
- **Commands**: build, test, lint, typecheck, dev server, migrations — exact
  invocations, plus how to run a single test.
- **Verifying a change**: which command proves a change is good, and what a
  passing state looks like.
- **Conventions** that differ from the language default.
- **Architecture decisions** that look arbitrary from outside, and what they
  protect.
- **Environment**: env vars, ports, services that must be running, setup steps
  that fail silently on a fresh checkout.
- **Repository etiquette**: branch naming, commit format, PR conventions.
- **Gotchas**: non-obvious behaviour worth warning the next agent about.
- **Maintaining this file**: that agents read it before changing code and
  update it after any change that makes part of it wrong.

Write it as a router, not an index — something that narrows where to look, then
hands off to search. Do not list individual files, dependency lists, exported
symbols, or anything that changes weekly. Do not include secrets or internal
URLs. Target 150-250 lines. Be concrete enough to verify: "use 2-space
indentation", not "format code properly".
```

---

## Task-prompt form — for a one-off prompt

When the artifact you are producing is a single prompt rather than a durable file, two lines carry it:

```
Read AGENTS.md at the repository root before you start, and use it to decide
where to look rather than searching blind. If it contradicts the code, the code
is right — fix it as part of this change.

Before finishing, update AGENTS.md if this change made any of it wrong. Edit
only the affected lines; do not restructure the file. If the repo has no
AGENTS.md, create one at the root: a directory-level map plus commands,
conventions, and environment requirements, under 250 lines, no file listings.
```

---

## Variant — when GPT-6 Astra will read it

OpenAI warns against making the model read docs or a repo map before every edit, and Astra is more sensitive to what an instruction file says. Keep every other line of whichever form you are using and replace only the read instruction (the first bullet of the short form, the first paragraph of the full form, or the first sentence of the task-prompt form) with:

```markdown
Read `AGENTS.md` at the repository root when the task spans more than one area
or you do not know where things live, and use it to decide where to look before
searching. Skip it for a change confined to a file you already have.
```

The update clause, the trust-but-verify clause, and the create-if-absent instruction stay as they are. In a harness that loads `AGENTS.md` automatically, drop the read instruction altogether and keep the rest. Use the variant as well when the repository is shared between Astra and other agents. That is a judgment call, and it degrades gracefully: a trivial change skips the read and a cross-cutting one triggers it.

---

## Notes

**Why the creation instruction is conditional.** Folding "create it if absent" into the standing directive means the file bootstraps itself the first time any agent works in a repo that lacks one — no separate setup task, and no dependency on someone remembering to run it.

**Why "do not restructure" appears in every form.** Without it, agents rewrite the whole file to their own taste on a one-line change. That produces unreviewable diffs, destroys hand-written nuance, and makes the file impossible to maintain in a PR workflow.

**Why the trust-but-verify clause is not optional.** Once agents read the map instead of searching, its errors propagate into their work rather than merely wasting tokens. The clause turns every session into a chance to repair it, which is what makes a living map viable at all.

**Scale the block to the artifact.** The short form in a `CLAUDE.md` is deliberately lossy — it gives the contract and a compressed spec, and trusts the resulting `AGENTS.md` to carry its own maintenance section from then on. Do not paste the full form into a `CLAUDE.md`; it will cost more context every session than the map it describes.

**Both halves or neither.** Read-without-update decays into a file agents learn to distrust. Update-without-read is a well-maintained document nobody opens. Every form above carries both; the Astra variant changes only when the read fires.
