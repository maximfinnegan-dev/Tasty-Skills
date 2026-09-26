# Authoring skill files

Writing a `SKILL.md` — a reusable capability an agent loads on demand — rather than a prompt for one task or a map for one repo.

Everything in this skill's core discipline applies here: state each instruction once, be concrete enough to verify, explain why rather than shouting MUST, and cut anything the model would do anyway. What changes is the loading model, and that changes the structure.

**Contents**
- [When a skill is the right artifact](#when-a-skill-is-the-right-artifact)
- [Anatomy](#anatomy)
- [Progressive disclosure](#progressive-disclosure)
- [The description is the trigger](#the-description-is-the-trigger)
- [Writing the body](#writing-the-body)
- [Skills for GPT-6 Astra](#skills-for-gpt-6-astra)
- [Organizing references](#organizing-references)
- [What not to put in a skill](#what-not-to-put-in-a-skill)
- [Testing it](#testing-it)
- [A bootstrap prompt](#a-bootstrap-prompt)

---

## When a skill is the right artifact

| The content | Belongs in |
|---|---|
| One task, now | A prompt |
| Every session in this repo, needed to orient | `AGENTS.md` |
| A repeatable procedure or domain reference, needed sometimes | A skill |
| Must happen every time without exception | A hook — skills are advisory, hooks are deterministic |

The signal for a skill is **repeatable and conditional**. A deployment runbook, a house writing style, a review checklist, a domain reference, a workflow with a fixed shape — things that are the same every time they come up, but that do not come up in every session. A skill loaded on demand costs nothing until it is needed, which is what lets it be long.

If the content is needed *every* session, it is not a skill, it is `AGENTS.md`. If it is needed once, it is a prompt. Getting this wrong is the most common mistake: putting always-on content in a skill means it may not trigger, and putting on-demand content in `AGENTS.md` means it taxes every session.

---

## Anatomy

```
skill-name/
├── SKILL.md              (required)
│   ├── YAML frontmatter  (name, description required)
│   └── Markdown body
├── references/           (docs loaded into context when needed)
├── assets/               (files used in output: templates, schemas, fonts)
└── scripts/              (executable code for deterministic or repetitive work)
```

Only `SKILL.md` is required. Add the others when the body outgrows its budget.

Frontmatter fields: `name` and `description` are required. `license`, `compatibility`, and a `metadata` block are optional and rarely needed.

---

## Progressive disclosure

Three levels, and the whole design follows from them:

1. **Metadata** — name plus description. In context *always*, for every skill installed. Roughly 100 words. This is why the description does the triggering work and why it must be tight.
2. **The body** — loaded whenever the skill fires. Target under 500 lines.
3. **Bundled resources** — loaded only when the body points at them. Effectively unlimited; scripts can execute without being read into context at all.

The practical consequence: **the body is a router.** It carries the workflow and the decision points, and it sends the model to a reference file for depth. If the body is approaching 500 lines, that is not a signal to compress the prose — it is a signal to add a layer and point at it.

Reference files over ~300 lines should open with a table of contents so the model can navigate without reading the whole thing.

---

## The description is the trigger

The description is the only thing the model sees when deciding whether to consult the skill. It has to answer both *what this does* and *when to use it* — all the "when to use" information lives here, not in the body, because by the time the body loads the decision has already been made.

**Write it slightly pushy — for Claude.** Models tend to *under*-trigger skills — to not reach for one that would have helped. Compensate deliberately (GPT-6 Astra needs the opposite; see [Skills for GPT-6 Astra](#skills-for-gpt-6-astra)):

| Weak | Better |
|---|---|
| "How to build an internal metrics dashboard." | "How to build an internal metrics dashboard. Use this whenever the user mentions dashboards, data visualization, internal metrics, or wants to display company data of any kind, even if they never say the word 'dashboard'." |

Name the concrete phrases a user would actually type. Include the oblique ones — the requests that are really this task wearing different clothes.

**Know what will not trigger regardless.** A model only consults a skill for work it cannot easily handle unaided. Simple one-step requests ("read this file") will not fire a skill however well the description matches, because the model just does them. This matters when writing test queries: trivial prompts are poor tests of a description.

---

## Writing the body

**Imperative voice.** "Read the config before editing" rather than "the config should be read".

**Explain why.** A model generalizes from a reason and cannot generalize from a rule. "Put long documents above the query, because content near the end of a long prompt gets weaker attention" beats "ALWAYS put documents first". Reasons also age better — when the situation shifts slightly, a reason still applies and a bare rule misfires.

**Prefer reasons to emphasis.** Heavy `MUST` / `NEVER` / `CRITICAL` shouting is counterproductive on current models, which are highly responsive to instruction and will overtrigger on aggressive phrasing. Reserve strong language for genuine invariants — safety, data loss, a hard location constraint — where the cost of a miss justifies it.

**Show output formats as templates:**

```markdown
## Report structure
Use this exact template:
# [Title]
## Executive summary
## Key findings
## Recommendations
```

**Show behavior as examples.** Input-and-output pairs communicate a shape faster than description does, and they are the fastest way to fix a skill that is technically correct but produces the wrong feel.

**Generalize past your own examples.** Write for the class of situations, not the three you happened to think of. A skill overfitted to its examples fails the moment reality differs slightly.

**Draft, then reread cold.** The single most effective revision step. Come back to the draft as a model that has never seen the task and ask what is ambiguous.

---

## Skills for GPT-6 Astra

OpenAI's guidance for Astra reverses the pushy-description advice and adds two more rules. It matters whenever a skill will load in Codex or another Astra harness, including repository skills that other contributors' agents will read: guidance that helped an earlier model can over-constrain Astra, so decide which models will use the skill before writing it.

**Short descriptions that name the workflow.** Every installed skill's description sits in context, and when there are too many, Codex shortens them, so the model sees less of each and picks worse. Broad or emphatic "use when" language pulls a skill into tasks it does not help. Say what the skill does and when to use it in as few words as clarity allows, naming the workflow rather than the domain around it:

| Too broad | Right-sized |
|---|---|
| "Reviews API designs. Use whenever the user mentions APIs, endpoints, REST, or HTTP." | "Reviews an API design against the team's versioning and pagination rules. Use when adding or changing an endpoint, or reviewing an API spec." |

Since Codex shortens descriptions without saying how, put the decisive words first. A skill that serves both Claude and Astra takes the right-sized form: name the workflow and two or three phrases a user would actually type, drop catch-all domain triggers and "even if they never say" clauses, then test the description on each model separately. That compromise is this skill's judgment, not an OpenAI recommendation.

**Goals and decision points over itineraries.** Many skills were written as elaborate step-by-step recipes. Models now handle nuance and ambiguity, so overly specific guidance can hinder where it once helped. Write the goal, the decision points, and the definition of done, and leave out steps the model would take itself.

**No contradictions and no precautionary stops.** Astra is more sensitive to skill contents, and unclear or conflicting guidance can make it pause and block work early. Check the skill against `AGENTS.md` and any skill it might load beside. Write approvals as real decisions, not blanket "ask first" caution (`model-profiles.md`, Decision boundaries).

OpenAI's `$skill-creator` skill in Codex now carries this guidance. To audit skills you already have, use the audit prompt in `model-profiles.md`.

---

## Organizing references

When a skill spans several variants — frameworks, platforms, document types — organize by variant so the model reads only the one it needs:

```
cloud-deploy/
├── SKILL.md          (workflow + which variant to pick)
└── references/
    ├── aws.md
    ├── gcp.md
    └── azure.md
```

The body owns selection; each reference owns depth. Say in the body *when* to read each file — a reference nobody is told to open is dead weight.

`scripts/` is for work that is deterministic and repetitive. Anything with an exactly right answer that a program can compute is better as a script than as instructions the model re-derives every time: it is faster, cheaper, and cannot be got subtly wrong.

---

## What not to put in a skill

- **Content needed every session.** That is `AGENTS.md`. A skill might not trigger.
- **Anything that must hold without exception.** Skills are advisory. Use a hook.
- **Model general knowledge.** It knows the language. Write the part specific to this team, project, or domain.
- **Secrets or credentials.** Skills get shared and committed.
- **Anything misleading about its own purpose.** A skill's contents should not surprise someone who read its description. This is a hard rule, not a style note.

---

## Skills that work in repositories

Any skill whose work happens inside a codebase — backend, deployment, review, migration — should carry the `AGENTS.md` directive as a section of its own. Use the full form from `assets/templates/agents-md-directive.md`: a skill loads on demand rather than every session, so it can afford the whole spec, and it is the natural home for it.

This is the clearest case of the budget principle in action. The same content is too heavy for a `CLAUDE.md`, which pays for it in every session, and exactly right in a skill, which pays only when the work actually involves a repo.

## Testing it

Write two or three prompts a real user would plausibly send — substantive enough that a model would actually benefit from consulting a skill, not one-step requests it would just do. Run them with the skill available, read the outputs, and revise.

Where outputs are objectively checkable — a file transformed, data extracted, a fixed workflow followed — write assertions and check them programmatically. Where the output is a matter of judgment (writing style, design quality), do not force assertions onto it; read the results and iterate. Forcing metrics onto subjective work produces confident numbers about the wrong thing.

Iterate on the description separately from the body. Triggering failures and quality failures have different causes and different fixes: a skill that never fires has a description problem, and a skill that fires and disappoints has a body problem.

---

## A bootstrap prompt

For turning an established workflow into a skill:

```
Write a skill that captures [workflow].

Read the conversation above (or [source material]) for how this is actually
done — the steps, the tools, the corrections made along the way, the input and
output formats observed. Ask me about anything ambiguous before writing rather
than inventing it.

Produce a SKILL.md with:
- name and description in YAML frontmatter. The description must state what the
  skill does AND when to use it, naming the concrete phrases a user would type,
  including oblique ones. Write it slightly pushy — models under-trigger skills.
- A body under 500 lines carrying the workflow and the decision points.
- Reference files under references/ for anything that would push the body past
  that, with the body saying when to read each one.

Write in the imperative. Explain why an instruction exists rather than
emphasising it — reasons generalise, rules do not. Show output formats as
templates and behaviour as input/output examples. Do not include anything the
model would do correctly without being told.

Then propose 2-3 realistic test prompts for it and tell me which parts of the
skill you were unsure about.
```

For a skill that will run under GPT-6 Astra, replace the description bullet with: "The description must state what the skill does and when to use it in as few words as clarity allows, naming the workflow rather than the domain. Do not list catch-all trigger phrases."
