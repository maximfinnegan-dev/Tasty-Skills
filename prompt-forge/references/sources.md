# Sources

Where the guidance in this skill comes from, so claims can be checked and refreshed when the models move.

Model behavior changes with every release. When a target model is superseded, re-read its official prompting page before trusting `model-profiles.md` — that file is a distillation of documentation, not a durable description of how language models behave. The Claude and GPT-5.6 sections are current as of **August 2026**. The GPT-6 Astra section was added in **September 2026** from the two OpenAI pages listed below.

---

## Primary — Anthropic

| Source | Covers |
|---|---|
| [Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) | Cross-model techniques: clarity, context, examples, XML structuring, long-context placement, tool use, parallel tool calling, thinking, agentic systems, overeagerness, hallucination minimization |
| [Prompting Claude Opus 5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5) | Response verbosity, progress narration, written-deliverable length, task scope and over-verification, subagent damping, self-correction, thinking-disabled artifacts |
| [Prompting Claude Sonnet 5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5) | Effort calibration, adaptive thinking defaults, tokenizer change and `max_tokens`, tool-use triggering, literal instruction following, tone, frontend defaults, code-review harnesses |
| [Prompting Claude Fable 5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5) | Not a target of this skill, but relevant if a user asks about Fable/Mythos — notably the `reasoning_extraction` refusal category triggered by instructions to echo internal reasoning |
| [Effort](https://platform.claude.com/docs/en/build-with-claude/effort) | Effort levels and recommended settings per model |
| [Adaptive thinking](https://platform.claude.com/docs/en/build-with-claude/thinking) | Thinking configuration and per-model support |
| [Claude Code best practices](https://code.claude.com/docs/en/best-practices) | Verification loops, explore-plan-code workflow, specific context, interview-then-spec, session management, adversarial review, common failure patterns |
| [How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works) | The agentic loop, context window, checkpoints and permissions, being specific upfront, delegate-don't-dictate |
| [Memory and CLAUDE.md](https://code.claude.com/docs/en/memory) | Instruction-file scopes and load order, size and specificity guidance, `@path` imports, the `AGENTS.md` interop pattern, path-scoped rules, auto memory, troubleshooting non-adherence |
| [Extend Claude Code](https://code.claude.com/docs/en/features-overview) | Feature layering, context cost per feature, and the routing table behind "when the answer is not a prompt" |
| [Agent SDK — subagents](https://code.claude.com/docs/en/agent-sdk/subagents) | `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`, `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`, `max_budget_usd` |

## Primary — OpenAI

| Source | Covers |
|---|---|
| [Model guidance: Using GPT-5.6](https://developers.openai.com/api/docs/guides/latest-model) | Lean-prompt findings, autonomy and approval boundaries, response length and `text.verbosity`, tone specification, reasoning effort levels, pro mode, Programmatic Tool Calling, persisted reasoning, prompt caching, safeguards |
| [Programmatic Tool Calling](https://developers.openai.com/api/docs/guides/tools-programmatic-tool-calling) | When PTC beats direct tool calls, routing instructions, output assessment |
| [Reasoning](https://developers.openai.com/api/docs/guides/reasoning) | `reasoning.effort`, `reasoning.mode`, `reasoning.context` |
| [Rethinking skills and prompts for GPT-6 Astra](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra) | OpenAI developer blog, September 2026. Skill descriptions and progressive disclosure, pruning `AGENTS.md`, decision boundaries, persistence and completion, and the audit recommendation |
| [Using GPT-6 Astra](https://developers.openai.com/api/docs/guides/latest-model/gpt-6-astra) | New API capabilities, prompting best practices (initiative and follow-through, instruction following, writing style, subagent delegation, testing), and the migration quickstart |

## Skill construction

| Source | Covers |
|---|---|
| [Agent Skills documentation](https://code.claude.com/docs/en/skills) | SKILL.md structure, frontmatter, progressive disclosure |
| `$skill-creator` (OpenAI, Codex) | Updated with the short-description and progressive-disclosure guidance from the Astra blog post; the source for the Astra rules in `authoring-skills.md` |
| `skill-creator` (Anthropic example skill) | Three-level loading, description-as-trigger and the under-triggering correction, the ~500-line SKILL.md guideline, references/assets/scripts layout, domain organization by variant, principle of lack of surprise, imperative writing style, output-format and example patterns, test-case and assertion guidance — distilled into `authoring-skills.md` |

## Coverage notes

What was deliberately left out of this skill, and why — so a future maintainer does not assume it was an oversight:

- **Claude Code configuration mechanics** — settings precedence, `claudeMdExcludes`, `--add-dir`, managed policy deployment, `autoMemoryDirectory`, symlinked rule sharing. Real and documented, but they are administration rather than prompt refinement. `agents-md.md` covers the routing decision (rule vs. skill vs. hook) without the configuration detail.
- **Authoring `AGENTS.md` directly** — this skill does not write one, and should not. It has no view of the target repository, so any map it produced would be invented, and under a read-before-changes contract a confidently wrong map misdirects work rather than merely wasting tokens. It writes the standing directive that makes the implementing agent build and maintain one; `agents-md.md` is the spec behind that directive, not a document this skill fills in.
- **`AGENTS.md` as an always-loaded instruction file** — an earlier draft modelled it on `CLAUDE.md`, as passive session context. It is modelled instead as a repo-root artifact under a read-before-changes, update-after-changes contract, which is how it is actually used and which changes the economics of including a directory map. `agents-md.md` explains why Anthropic's warning about layouts in always-loaded files applies with much less force to a file read deliberately at task start.
- **Auto memory** — Claude Code writes its own cross-session notes. Relevant to why an instruction file need not capture everything, but not something a prompt controls. One mention in `agents-md.md`; no dedicated section.
- **Session mechanics** — `/clear`, `/compact`, `/rewind`, checkpoints, interrupting mid-turn. These are user behaviors, not prompt content. The failure patterns they fix appear in `diagnostics.md` under session-level failures, since a user describing one of them is not describing a prompt defect.
- **GPT-6 Astra API mechanics** — async tool calling, mid-turn steering, `configuration_update` event flows, and misalignment monitoring get one line each in `model-profiles.md`. They are application-level and OpenAI documents them separately; the prompt-relevant parts are covered.
- **Temperature and sampling parameters** — covered only as the Sonnet 5 constraint (non-default values return 400). General temperature guidance from the older material no longer applies to any of the three targets.
- **Non-coding tool routing** — image, video, voice, 3D, and workflow-automation prompting from `prompt-master`. Out of scope by the skill's own definition; that material is preserved in the predecessor skill if it is ever needed.
- **The skill evaluation harness** — `skill-creator`'s scripted eval loop, benchmark aggregation, blind A/B comparison, and description-optimization scripts. `authoring-skills.md` carries the judgment (what to test, when assertions are appropriate, why triggering and quality failures need separate iteration) but not the tooling, which is environment-specific and lives in `skill-creator` itself.
- **Framework taxonomy** — the 31 named frameworks are distilled to eight coding patterns rather than carried across. `prompt-patterns.md` explains the reasoning: the general-purpose set assumes a model that needs procedural hand-holding, and the framework name never survives into the emitted prompt anyway.

## Merged predecessors

This skill consolidates and replaces two installed skills:

- **`prompt-architect`** v3.5.1 (MIT, ckelsoe) — contributed the five-dimension scoring rubric with banded anchors, intent-based framework routing, the never-default-a-fact-about-the-user's-world rule, the never-soften-a-prohibition rule, the emission format (analysis → transition → clean code block, nothing after), and the when-not-to-use-frameworks guidance. Its 31-framework library is distilled into the eight coding-oriented patterns in `prompt-patterns.md`.
- **`prompt-master`** v1.7.0 (MIT, nidhinjs) — contributed the diagnostic checklist structure, the memory/carry-forward block, credential-safety handling, pasted-prompt sanitization, the agentic-output warning, harness-specific routing, and the pre-delivery verification pass.

## Notes on specific claims

- The **10–15% eval improvement / 41–66% token reduction** figure for lean prompts is OpenAI's own internal coding-agent measurement, published as directional and workload-dependent. Treat it as a strong prior, not a guarantee, and validate on real tasks.
- The **up to 30% response-quality improvement** from placing queries after long context is from Anthropic's testing on complex multi-document inputs.
- The **~30% token increase** from Sonnet 5's new tokenizer varies by content and workload shape.
- Claims about model behavior — self-correction, scope expansion, delegation eagerness, literalism — are from the vendors' own prompting guides, which document them as observed tendencies requiring tuning rather than as guarantees.
- Claims about GPT-6 Astra's behavior (tentativeness about stopping, sensitivity to instructions in skills and `AGENTS.md`, delegation, testing breadth) are OpenAI's own characterization, and this skill has not been tested against the model. Where it goes beyond OpenAI's guidance it says so inline: the proportionate-read wording for mixed-model repos, the dual-target skill description, assuming Astra when a Codex user cannot say which model, and treating coverage-first review as sensible for Astra.
- The *Using GPT-6 Astra* URL is built from the `promptingGuide` path in that page's own frontmatter (`/api/docs/guides/latest-model/gpt-6-astra.md`). The blog URL is from OpenAI's post as linked by third-party coverage. Re-check both if a link breaks.

## The completion gate

The mandatory self-assessment gate in SKILL.md step 6 is a **product requirement of this skill**, not a recommendation lifted from vendor documentation. Its nearest ancestor in the source material is the self-evaluation technique in `prompt-engineering.md` — asking a model to score its own draft and name the single most important improvement — and the self-correction chaining pattern in Anthropic's prompting guide, where a draft is reviewed against criteria and then refined. It is worth understanding the tension it sits in.

Anthropic's Opus 5 guidance explicitly says to remove instructions like "double-check your answer" and "re-verify before responding", because the model already self-corrects and such instructions compound into over-verification that costs tokens without improving quality.

The gate is shaped to satisfy the requirement without triggering that failure mode. It is a **single terminal completeness check, scored against the user's own stated requirements**, rather than an open-ended re-verification loop. It fires once, after implementation, permits at most one correction pass, and closes with an explicit instruction not to re-verify already-verified work.

Framed that way it does something the model's native self-correction does not: native self-correction checks whether the code is *right*, while the gate checks whether the delivered work is *what was asked for*. Those are different failures, and requirement drift is the one users notice most. The scored output also gives the user a fast signal about where to look.

If a future model's documentation reports that even single-pass self-assessment causes measurable over-verification, revisit this section rather than silently dropping the gate — it is a deliberate requirement, and changing it is a decision for the skill's owner.
