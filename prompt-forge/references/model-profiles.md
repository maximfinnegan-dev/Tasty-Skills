# Model profiles

Behavioral differences and tuning snippets for the four supported targets. Read the section for your target before writing the prompt.

**Contents**
- [Shared ground](#shared-ground)
- [Claude Opus 5](#claude-opus-5)
- [Claude Sonnet 5](#claude-sonnet-5)
- [GPT-5.6 Sol](#gpt-56-sol)
- [GPT-6 Astra](#gpt-6-astra)
- [Cross-model translation](#cross-model-translation)
- [Harness routing](#harness-routing)

---

## Shared ground

True for all four unless a bullet says otherwise, so state it once and do not repeat it per-model:

- **Literal instruction following.** These models do what you say, not what you meant. They do not silently generalize a rule from one item to the next. If a rule applies broadly, say so: "apply this to every section, not just the first." GPT-6 Astra follows instructions strongly too but also fills routine gaps from context, and its distinctive risk is stalling on unclear or conflicting instructions in skills and `AGENTS.md` (see its profile).
- **Outcome over procedure.** They infer the path. Give them the destination, the constraints, and the definition of done. Prescribing every step costs tokens and quality.
- **Reasoning is internal and automatic.** None of the Claude models or Sol benefits from "think step by step", and OpenAI's Astra guidance is likewise to strip scaffolding rather than add it. Raise the effort/reasoning parameter instead.
- **Explicit action verbs.** "Can you suggest changes to X" gets suggestions. "Change X" gets changes. If you want an edit, ask for an edit. With Astra, request-shaped phrasing ("can you...", "help me...") is the known case where it stops at "Yes" or a plan.
- **Front-load long context.** Documents, logs, and file dumps go at the top, above the instructions. Anthropic reports queries-at-the-end improving response quality by up to 30% on complex multi-document inputs. OpenAI's Astra guidance does not address placement; this skill applies the rule to every target because it costs nothing.
- **Autonomy needs a boundary.** The Claude models and Sol keep working, and without a stated boundary they either stop constantly to ask or run past the edge of what was authorized. Astra is more tentative, so it needs the permission stated as well as the boundary. State the boundary once either way.

---

## Claude Opus 5

Built for complex agentic coding and long-horizon work. Strongest of the three on multi-file features, large refactors, and end-to-end feature work. It completes tasks rather than leaving stubs, and performs best given the **complete specification up front and then left to run**. 1M-token context window as both default and maximum, with instruction following and tool calling staying consistent across it.

### What to remove from an Opus 5 prompt

**Verification instructions.** Opus 5 verifies its own work unprompted. Lines like "include a final verification step for any non-trivial task" or "use a subagent to verify" cause over-verification. Removing them reduces wasted tokens with no loss in quality. The same goes for "double-check your answer" and "re-verify before responding" — the model already self-corrects well, and these compound.

This is the single most common Opus 5 prompt defect. The completion gate in `SKILL.md` step 6 is deliberately shaped as a one-shot terminal completeness check for exactly this reason — keep its final line ("Run this gate once, at the end. Do not re-verify work you have already verified.") intact.

**Thinking budgets.** `budget_tokens` returns a 400 error. Thinking is on by default and can only be disabled at `high` effort or below. Prefer keeping thinking on at low effort over disabling it — thinking-enabled at `low` outperforms thinking-disabled at comparable cost.

### What to add

**Conciseness, explicitly.** Opus 5's default user-facing responses run longer than prior Opus models'. Effort controls how much it *thinks*, not how much it *says* — lowering effort will not reliably shorten the visible response. Prompt for length directly:

```
Keep responses focused, brief, and concise. Keep disclaimers and caveats short, and spend most of the response on the main answer. When asked to explain something, give a high-level summary unless an in-depth explanation is specifically requested.
```

In a long system prompt, pair that with a short reminder near the end:

```
<tone_preference>
Keep outputs reasonably concise.
</tone_preference>
```

**Written-deliverable length,** separately. Files it writes to disk — reports, design docs, summaries — run long independently of conversational verbosity:

```
Match the length of written documents to what the task needs: cover the substance, but do not pad with filler sections, redundant summaries, or boilerplate.
```

**Scope constraint.** Opus 5 expands scope, adding steps that were not requested and applying its own judgment about what the task should be:

```
Deliver what was asked, at the scope intended. Make routine judgment calls yourself, and check in only when different readings of the request would lead to materially different work. If the request seems mistaken or a better approach exists, say so in a sentence and continue with the task as asked rather than quietly narrowing, widening, or transforming it. Finish the whole task, and stop short of actions that are clearly beyond what was asked.
```

**Narration cadence,** for user-facing products. Opus 5 announces what it is about to do and produces longer per-message output in agentic sessions:

```
Before your first tool call, say in one sentence what you're about to do. While working, give a brief update only when you find something important or change direction. When you finish, lead with the outcome: your first sentence should answer "what happened" or "what did you find," with supporting detail after it.
```

**Correction narration.** Opus 5 narrates corrections to its own earlier statements more than prior models:

```
Only correct an earlier statement when the error would change the user's code, conclusions, or decisions. State corrections plainly and briefly, then continue the task. For slips that change nothing for the user, make the fix and move on without noting it.
```

**Subagent damping.** Opus 5 delegates readily — good for genuinely independent tracks, expensive on small ones:

```
Delegate to a subagent only for large tasks that are genuinely independent and parallelizable, such as a wide multi-file investigation. Do not delegate work you can finish yourself in a handful of tool calls, and do not use subagents to verify or double-check your own work. If one subagent can complete the task, use one rather than several, and keep spawn counts low.
```

In Claude Code or the Agent SDK, the deterministic caps are `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`, `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`, and the SDK's `max_budget_usd` (requires Claude Code 2.1.217+).

### Effort

Default is `high`. `low` and `medium` produce strong quality at a fraction of the tokens and latency — use them liberally as the primary cost and latency control wherever quality holds, and step up to `xhigh` for demanding coding and agentic work. Re-run an effort sweep on your own evals rather than carrying defaults over from a prior model.

### Code review with Opus 5

High precision and recall, and accuracy holds at lower effort — which supports a fast pass at review time and a thorough pass later. But it follows filtering instructions literally: "only report high-severity issues" or "be conservative" will make it report less. Ask for everything and filter in a separate pass.

### If thinking is disabled

Two artifacts can appear: tool calls written as visible text instead of structured `tool_use` blocks (the call never runs, and in agent loops the leaked text pollutes history), and internal XML tags leaking into the response. Keeping thinking on at low effort is the better fix. If it must stay off, one combined instruction mitigates both:

```
When you use a tool, you may say a brief sentence first. If no tool can express what the user asked for, say so instead of guessing. Do not include internal or system XML tags in your response.
```

Do not name thinking tags specifically — the general form works better. If the system prompt contains a rule telling the model not to think or not to reason, remove it; that increases tag leakage.

---

## Claude Sonnet 5

Strong at coding and agentic tasks, more agentic than Sonnet 4.6 by default. Adaptive thinking is on by default. Response length calibrates to task complexity rather than sitting at a fixed verbosity — shorter on simple lookups, longer on open-ended analysis.

### Literalism is the defining trait

Sonnet 5 interprets prompts literally and explicitly, particularly at lower effort. It does not generalize an instruction from one item to another and does not infer requests you did not make. That precision is the upside — it is the best of the three for tightly tuned prompts, structured extraction, and pipelines where predictable behavior matters. The cost is that scope must be spelled out. Style directives carried over from Sonnet 4.6 may now over-apply; re-baseline them.

Concrete beats qualitative. "Be concise" is vague; "answer in no more than three sentences" is followed exactly.

### Effort and thinking

Default `high`. `xhigh` for the hardest coding and agentic work. `medium` for cost-sensitive workloads. `low` only for short, scoped, latency-sensitive tasks that are not intelligence-sensitive.

Sonnet 5 respects effort strictly, especially at the low end — at `low` and `medium` it scopes work to what was asked rather than going above and beyond. If you see shallow reasoning on a complex problem, **raise effort rather than prompting around it**. If latency forces `low`, add targeted guidance:

```
This task involves multistep reasoning. Think carefully through the problem before responding.
```

Manual extended thinking (`budget_tokens`) is removed and returns 400. `temperature`, `top_p`, and `top_k` at non-default values also return 400 — steer tone through the system prompt instead.

**Watch `max_tokens`.** It is a hard limit on thinking plus response text. Sonnet 5's new tokenizer produces roughly 30% more tokens for the same text, so limits tuned for Sonnet 4.6 may truncate. At `high`/`xhigh`/`max`, leave headroom or you get a response that is almost entirely thinking followed by `stop_reason: "max_tokens"`.

### Tool use

More willing to reach for tools and run self-verification loops than Sonnet 4.6. Effort is also a tool-use lever: `high` and `xhigh` show substantially more tool usage in agentic search and coding. **With thinking disabled it is markedly less likely to reach for tools** — if a harness depends on tool calls with thinking off, add an explicit nudge describing when and why to use each tool.

### Remove

Forced status cadence. Sonnet 5 gives regular, high-quality updates through long agentic traces on its own; "summarize after every 3 tool calls" is now overhead. If the updates are miscalibrated, describe what you want and give an example rather than adding a counter.

### Code review with Sonnet 5

If a review harness tuned for an older model shows lower recall, that is usually a harness effect, not a regression. Sonnet 5 follows "only report high-severity issues" and "don't nitpick" more faithfully — it investigates just as deeply, then declines to report findings below your stated bar. Precision rises, measured recall falls.

```
Report every issue you find, including ones you are uncertain about or consider low-severity. Do not filter for importance or confidence at this stage - a separate verification step will do that. Your goal here is coverage: it is better to surface a finding that later gets filtered out than to silently drop a real bug. For each finding, include your confidence level and an estimated severity so a downstream filter can rank them.
```

If you do want single-pass self-filtering, set the bar concretely — "report any bug that could cause incorrect behavior, a test failure, or a misleading result; omit pure style and naming preferences" — rather than using words like "important".

### Frontend and design work

Sonnet 5 settles into a consistent default visual style on open-ended briefs, which reads fine for some products and wrong for dashboards, dev tools, fintech, healthcare, and enterprise apps. Generic redirection ("make it cleaner", "not that color") just moves it to a different fixed palette. Two things work:

1. **Specify a concrete alternative** — exact hex palette, typeface, corner radius, spacing, section structure. It follows explicit specs precisely.
2. **Have it propose options first**, which is now the recommended way to get variety across runs since `temperature` is unavailable:

```
Before building, propose 4 distinct visual directions tailored to this brief (each as: bg hex / accent hex / typeface, plus a one-line rationale). Ask the user to pick one, then implement only that direction.
```

To steer away from generic output:

```
<frontend_aesthetics>
NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white or dark backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character. Use unique fonts, cohesive colors and themes, and animations for effects and micro-interactions.
</frontend_aesthetics>
```

### Interactive coding products

Use `xhigh` or `high` effort and minimize required user turns. Specify task, intent, and constraints fully in the **first** human turn: ambiguous prompts delivered progressively across several turns reduce both token efficiency and performance.

---

## GPT-5.6 Sol

`gpt-5.6-sol` is the flagship of the GPT-5.6 family; the bare `gpt-5.6` alias routes to it. `gpt-5.6-terra` trades some capability for price, `gpt-5.6-luna` is the high-volume tier. Sol is token-efficient, more concise by default than GPT-5.5, proactive and persistent on multi-step tasks, and notably improved on frontend layout and visual hierarchy.

### Lean prompts are the headline

OpenAI's strongest recommendation: **state each instruction exactly once.** In internal coding-agent eval runs, leaner system prompts improved scores by roughly 10–15% while reducing total tokens by 41–66% and cost by 33–67%. These are directional and workload-dependent, but the size of the effect makes prompt bloat a real cost, not a stylistic quibble.

How to slim a prompt without losing guidance: start from something that works, remove one group of instructions, examples, or tools at a time, and re-run the same evals. Expose only tools relevant to the task and keep their descriptions short and precise. Keep examples and style guidance when they encode a product requirement or correct a measured gap — not out of habit.

### Do not carry over brevity instructions

GPT-5.6 is already compressed. "Be concise" and "keep it short" imported from GPT-5.5 prompts now cut required detail. Give a priority order instead of a length cap:

```
Lead with the conclusion. Include the evidence needed to support it, any material caveat, and the next action. Omit secondary detail and repetition.

Keep all required facts, decisions, caveats, and next steps. Trim introductions, repetition, generic reassurance, and optional background first.
```

For consistent cross-request control, set `text.verbosity` (`low` / `medium` / `high`) at the API level and reserve the prompt for task-specific length requirements.

### Do not carry over persistence blocks

Sol continues multi-step work without being told to. Legacy "keep going until the task is fully solved" scaffolding is redundant overhead. This is Sol-specific: Astra is more tentative about when to stop, and the advice inverts (see its profile).

### Define the autonomy boundary

This is the instruction Sol most needs and most often lacks. Without it, it either pauses constantly for approval or runs past the edge of what was authorized. A compact policy is enough:

```
For requests to answer, explain, review, diagnose, or plan, inspect the relevant materials and report the result. Do not implement changes unless the request also asks for them.

For requests to change, build, or fix, make the requested in-scope local changes and run relevant non-destructive validation without asking first.

Require confirmation for external writes, destructive actions, purchases, or a material expansion of scope.
```

Name the safe local actions explicitly — reading files, inspecting logs, editing in-scope code, running tests. Keep the policy in one place and state each rule once: repeating "ask first" or "wait for approval" produces spurious approval requests for actions that were always fine.

### Tone

Broad labels like "friendly" are ambiguous. Describe the writing choices:

```
State the answer directly. If the user reports a problem, acknowledge the specific issue before giving the next step. Use reassurance only when it is relevant. Omit generic praise and unnecessary sign-offs.
```

### Reasoning effort

Supports `none`, `low`, `medium`, `high`, `xhigh`, `max`. Use `medium` as a balanced start and `low` for latency-sensitive work. Go `high` or `xhigh` only where more reasoning produces a *measured* quality gain. Reserve `max` for the hardest quality-first workloads and compare it against `xhigh` rather than assuming higher is better. Migrating from 5.5 or 5.4: keep the current setting as baseline and test one level lower.

**Pro mode** (`reasoning.mode: "pro"`) applies more model work before returning a single answer. It is independent of effort and works with any GPT-5.6 model. Use it where a marginal quality gain materially changes the outcome — complex optimization, high-value coding or review, deep analysis with clear evaluation criteria. Keep the same outcome-focused prompt: do not tell it to "use pro mode", "think harder", or generate candidate answers.

### Programmatic Tool Calling

Sol can write JavaScript to call eligible tools, pass results between them, and reduce intermediate outputs in a hosted runtime. It suits bounded workflows where code filters, joins, ranks, deduplicates, aggregates, or validates several tool results into a much smaller structured answer.

Prefer direct tool calls when one call suffices, intermediate outputs are already small, each result could change the next decision, an action needs approval, or the final output must preserve citations and native artifacts. Multiple or parallel calls alone do not justify PTC.

Generic routing instructions do not work. Be task-specific:

```
<tool_orchestration>
Use Programmatic Tool Calling for [bounded stage] using only [eligible tools].
Run independent calls concurrently when safe. Use only documented tool input
and output fields.

Process and reduce the intermediate results, then emit exactly [output schema],
including the evidence needed for the final answer.

Stop when [condition] is met. Retry transient failures at most [R] times.
Do not repeat completed calls or perform side-effecting actions. If a required
result is still missing, return a clear structured failure.

Use direct tool calls for [semantic judgment, approval, or final validation].
</tool_orchestration>
```

Test the `program_output` item and the final assistant message separately — a program can return correct records while the message omits a required field or caveat.

### Other Sol notes

- Persisted reasoning defaults to `all_turns`; set `reasoning.context` to `current_turn` when earlier reasoning is no longer relevant.
- Explicit prompt caching is available; cache writes bill at 1.25× the uncached input rate, so track `cached_tokens` and `cache_write_tokens`.
- Real-time cyber and biology misuse classifiers run over outputs and may occasionally intervene on legitimate dual-use work such as vulnerability research or defensive testing.
- Vague success criteria are a known risk: when the definition of done is soft, Sol is more likely to optimize toward the stated metric than the underlying goal. Make acceptance criteria concrete and mechanically checkable.

---

## GPT-6 Astra

`gpt-6-astra`, on a Responses API request. OpenAI's most aligned model to date: it respects task boundaries, fills routine gaps from context, asks a focused question when the answer could change the outcome, and takes a mid-task correction without losing the thread. In several OpenAI evaluations it beats earlier models while using substantially fewer output tokens.

Two traits decide how you write for it, and both invert advice that holds for the other targets:

- **It is more tentative about when to stop.** Sol continues for long stretches unprompted. Astra may reach a first implementation and hand back for review with work remaining, or ask where an earlier model would have assumed. It needs permission and a definition of done stated, not only a boundary.
- **It is more sensitive to what is in context.** Instructions in skills and `AGENTS.md` steer it harder than they steered earlier models, so unclear, conflicting, or heavily worded guidance, most of it written for a different model, can make it pause or stop early. What it loads matters as much as what you write.

Start by deleting: `SKILL.md` step 9 lists what to remove or soften on this target. This section covers what to add.

| Behavior | What you see | Where the fix goes |
|---|---|---|
| Initiative | Asks or stops where you expected assumptions or persistence | Completion condition and authorizations; initiative snippets for system prompts |
| Instruction sensitivity | Pauses on unclear, conflicting, or strongly worded guidance | Audit skills and `AGENTS.md`; precedence line |
| Style | Lists, tables, Markdown; recurring phrases | Writing-style snippets |
| Delegation | Delegates less than the workflow wants | Delegation snippet |
| Testing | Tests broader than a small change needs | Testing snippet; drop "always test" lines |

### Initiative and follow-through

Astra stays coherent over long tasks better than Sol does, and is likelier to ask where earlier models assumed. The fix depends on the artifact.

**In a one-off task prompt**, say it in the task's own terms rather than pasting generic blocks. Put the completion condition in Verification (for example: done when the feature runs, the result has been inspected, and failures are fixed) and the authorizations in the Autonomy block. A requirement to stop for review after the first implementation pulls Astra toward an early stop, so keep one only where the review is a real decision. To have it explore past a first pass, name what to explore and where it should stop.

**In a system prompt or a repo-wide instruction file**, start from the blocks below and trim to the autonomy your application needs. Astra also asks non-blocking questions as it works by default; loosen the blocks if that is unwanted.

To carry a task to completion:

```
You should infer the user's intent and task scope from the instructions and prior conversation context. Your job is to bias towards action and carry the user's intended task to completion.

When the user expresses intent to perform new work or fix an existing issue, persist until the user's intended goal is complete. Progress autonomously towards the user's goal (e.g. creating isolated worktrees / checkouts if needed, resolving merge conflicts, read-only actions, creating draft PRs etc.) unless they are clearly destructive or irreversible.
```

To treat request-shaped phrasing ("can you...", "I want to...", "help me...") as an instruction:

```
When the user's prompt indicates a request for action, such as "can you...", "I want to...", "help me..." and similar expressions, treat these as instructions to do the work and take action. Do not stop at acknowledging capability (e.g. "Yes…"), proposing a plan, or offering to continue. Do not settle for a partial or "helpful enough" solution that does not fully satisfy the user's task to save time, effort or tokens. If a task requires sustained work, complete all the necessary work until the intended outcome is fulfilled.
```

To have it finish the work before asking for approval:

```
Before asking the user clarifying questions, you should complete the work that is already authorized from context and necessary to make the proposed action concrete and reviewable. The user should be approving a concrete, reviewable result. For example, before deploying a change, writing to an external application, merging a PR or publishing a site, do all the required work first so that user approval is the final step. You don't need user permission for reversible tasks, read-only actions, reviews or fixes, or anything for which authorization is provided earlier in the session or strongly implied from the task instruction.

Do not introduce unsolicited warnings, disclaimers, approval flows, or safety/compliance checklists due to hypothetical risk.
```

For a workflow you know is safe, grant the permission once in `AGENTS.md` so it stops asking at each step:

```
The local tests use disposable fixtures and have no production access. Run them, fix failures caused by the requested change, and rerun affected tests without asking for approval at each step.
```

### Decision boundaries

Astra will not perform a task unless it knows the task is safe, so it takes stated boundaries seriously. Language written to stop an earlier model from going too far (never do X without asking, repeated ask-first lines, all-caps prohibitions) can make Astra stop where you would have been glad to see it continue.

Restate each inherited precaution as an authorization plus the few stops that are real decisions:

```
Before (written for an earlier model):
NEVER change files outside src/billing. ALWAYS ask before running any command. Check with me before every edit.

After:
Edit files under src/billing and run its tests without asking. Ask before changing other packages, altering the schema, or writing anywhere outside this machine.
```

This applies to precautionary language inherited from another model's prompt. A prohibition the user stated for *this* task is not a precaution: it survives verbatim as a "Do not…" (`SKILL.md` step 5).

### Instruction following and skills

Astra follows longer instructions better than earlier models and is more sensitive to information in context. Unclear or conflicting guidance in a skill can make it pause and block work early, so make the priority between user instructions and skills explicit in a system prompt:

```
The user's instructions take precedence over guidelines provided in a skill. If explicit user instructions conflict with a skill's instructions, prioritize the user's instructions.
```

When a session stalls and you cannot tell why, or when the application loads many skills and instruction files, this finds the silent and conflicting guidance:

```
If a skill causes you to ask for permission or confirmation, pause, leave requested work unfinished, or diverge from the user's intent, name and link to the exact SKILL.md file you read, quote the relevant instruction, and briefly explain how it applies. Distinguish explicit skill requirements from your interpretation of guidelines.
```

### Writing style

Astra tends toward detailed, formatted responses (lists, tables, Markdown) and may reuse phrases across sessions. Specify the style and structure the deliverable needs. Add these only when the deliverable is prose a person will read.

For prose with less formatting:

```
Default to using clear, concise paragraphs, each developing one main idea. Use lists only when the information is genuinely parallel, sequential, or easier to compare, and avoid nested lists unless the hierarchy cannot be expressed clearly in prose. Use plain, simple language: familiar words, concrete examples, and precise verbs. Prefer active voice and direct statements.

Make sure to state the main point clearly and early, then develop it with the explanation and detail the reader needs. Let each sentence build on what came before. Develop the points that matter and provide enough support to be useful.
```

For technical writing that stays plain:

```
Use plain language over jargon, and reference technical details only to the degree that it helps illustrate an idea or your work to the user. Communicate complex concepts in a clear and cohesive manner, and calibrate your writing to the level of background knowledge assumed from the user's prompt and context.
```

For fewer stock phrases:

```
Avoid using slop words or phrases like "Bottom Line:" in conclusions, "delve," "foster," "leverage," "it's worth noting," "importantly," "Question? Answer." or "This isn't about X. It's about Y.", "genuinely" or hyphenated compound descriptions and adjectives. Do not use concluding summary statements such as "In short:..", "The simplest mental model is:...".

State the intended action directly. Avoid adding what you won't do, what will remain unchanged, or how you'll separate or categorize results. Do not use contrastive framing such as "X, not Y" or "X—not Y" that introduces an unprompted alternative that the user didn't ask about. Avoid invented compound labels like "exact-head checks" and "editorial-row layouts", vague qualifiers, and canned transitions; use plain verbs and prepositions to state the actual relationship directly.
```

### Subagent delegation

Astra is trained to divide work across subagents but may delegate less than your workflow wants, the opposite of Opus 5, which needs damping. If your harness supports multiple agents, say when and how much; it responds well to being told.

```
If at any point you can parallelize work by delegating tasks to another agent (no matter if you are the root or subagent), you should do so using collaboration tools if it could save time or improve quality.
```

Inter-agent messages can arrive with grammar or spacing errors. If a human reads them, add:

```
Messages that you send to other agents and your final answer may be read by a human, so ensure they are legible. Always put proper spaces between words and/or numbers.
```

### Testing and verification

Previous models needed encouragement to run tests. Astra tests thoroughly on its own, so inherited "run the tests" lines now produce checks broader than a small change needs. Keep the runnable check that `SKILL.md` step 2 asks for, since it names which check proves the change, and cut the exhortations around it. For a system prompt, or when it over-tests anyway:

```
Do not write tests for reversible, low-impact changes that mirror the implementation. If you do choose to verify your work with tests, make sure that the tests are meaningful and necessary to verify implementation.

Run tests appropriate to the change and complete required checks. Once those pass, broaden or repeat testing only when new changes, failures, or unresolved concerns justify it; otherwise, continue toward completing the task.
```

The completion gate's once-only bound serves the same purpose.

### Reasoning effort and API notes

- **Effort.** `none` is not supported. From `none` or `minimal`, start at `low` and compare; otherwise keep the current effective effort. Pro mode is supported. To change effort mid-conversation, add a `configuration_update` input item in single-agent requests and leave request-level `reasoning.effort` unchanged so the cached prefix survives.
- **Parameters.** Remove `temperature`, `top_p`, and `top_logprobs`. On Chat Completions also remove `logprobs`; on Responses remove `message.output_text.logprobs` from `include`. Tool calling requires the Responses API.
- **Caching.** Migrating from GPT-5.5 or earlier, replace `prompt_cache_retention` with `prompt_cache_options.ttl` set to `"30m"`, and review the cache-boundary and cache-write billing changes.
- **Fast mode.** Unavailable with EU data residency (no `service_tier: "fast"` or `"priority"`), and it carries no latency SLA.
- **Harness features.** Async tool calling (`async: true` on a tool, result returned with the original `call_id`), mid-turn steering over a WebSocket, and asynchronous misalignment monitoring are application-level. Prompts do not control them.
- **Carried over.** Programmatic Tool Calling, multi-agent orchestration, computer use, Structured Outputs, compaction, and persisted reasoning are supported. OpenAI's Astra guide does not restate the Sol guidance above on when to use PTC, so treat that guidance as the closest available rather than Astra-verified.

### Auditing inherited instructions

OpenAI's closing advice is to have Astra audit the instruction files a repository has accumulated. Most of the wins are deletions and rewrites, so an audit is a sensible first step before writing new prompts. With read access to the repository:

```
Audit AGENTS.md and every SKILL.md in this repository for GPT-6 Astra. For each file, list:
1. Precautionary boundaries written for an earlier model ("never...without asking", repeated ask-first lines) that would now stall work I would be happy to see continue.
2. Instructions to read docs or a repo map before every edit, rather than for particular kinds of change.
3. Instructions that encourage running or adding tests without naming the check that proves a change.
4. Requirements to stop for review that are not real decisions.
5. Skill descriptions that name a whole domain rather than a workflow, run long, or overlap another skill's.
6. Instructions that conflict with each other across files.
Quote each line and propose the shortest replacement, or a deletion. Do not edit any file until I approve the list.
```

---

## Cross-model translation

Adapting one prompt across targets:

| Element | Opus 5 | Sonnet 5 | GPT-5.6 Sol | GPT-6 Astra |
|---|---|---|---|---|
| Structure | XML tags work well | XML tags work well | Plain sections; XML fine but not required | Not addressed in OpenAI's guide; treat as Sol |
| Verbosity control | Prompt explicitly; effort will not do it | Prompt explicitly; concrete numbers | `text.verbosity` + what to preserve | Specify prose or list style and structure; it defaults to detailed, formatted output |
| Reasoning depth | `effort` | `effort` (raise, don't prompt around) | `reasoning.effort`, optionally pro mode | `reasoning.effort` (no `none`), pro mode, `configuration_update` mid-conversation |
| Verification language | Remove it — native | Native; keep the runnable check only | Keep the runnable check | Keep the runnable check; drop "always test" lines, it tests unprompted |
| Autonomy | Scope-constraint snippet | Spell out scope explicitly | Autonomy/approval policy — highest priority | State permissions; rewrite inherited precautions as authorizations plus real stops |
| Persistence | Native — completes tasks | Scales with effort | Native — **delete** persistence blocks | **Add** — state the completion condition; it stops early otherwise |
| Delegation | Damp it — delegates readily | Native, less aggressive | Multi-agent (beta) if the work divides cleanly | Prompt for it — delegates less than wanted |
| Brevity carryover | Add conciseness | Re-baseline old style rules | **Delete** old brevity instructions | Not tested; specify style and structure rather than a bare "be concise" |

Elements that transfer unchanged: role assignment, real context, few-shot examples, explicit output contracts, scope locks, runnable verification, and the completion gate.

---

## Harness routing

When the user names a tool rather than a model, infer the model and say what you assumed.

- **Claude Code** — Opus 5 by default. Agentic: needs scope lock by path, forbidden actions, stop conditions, and human-review triggers for anything destructive or shared. Sessions are cheap: new task, new session.
- **Codex / ChatGPT Work** — GPT-5.6 Sol or GPT-6 Astra, user-selected. The two invert each other on persistence and approval boundaries, so ask which. If the user cannot say, assume Astra as the newer model and say so. For Sol, apply the autonomy policy and the lean-prompt discipline; for Astra, apply its profile above.
- **Cursor / Windsurf / Cline** — user-selected model; ask which, then apply that profile. All three need a file-path anchor, a do-not-touch list, and an explicit "done when" condition. Never give a global instruction without a path.
- **GitHub Copilot** — write the exact signature, docstring, or comment immediately before invoking. It completes what it predicts, so leave no ambiguity.
- **Bolt / v0 / Lovable** — scaffolding generators that default to bloat. Specify stack and version, component boundaries, and what not to scaffold: "do not add authentication, dark mode, or features not explicitly listed."

For any agentic target with real system access, append to your delivery (not to the prompt itself):

> This prompt targets an agentic tool with real system access. Check the scope locks, forbidden actions, and stop conditions before pasting, and confirm the file paths match your project.
