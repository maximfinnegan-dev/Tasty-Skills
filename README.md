# Tasty-Skills
**Production-grade skills** made from a skill-authoring skill inspired by the greatest skills; and greatest taste. 

However don't take my word for it, read the breakdown or go through the skills yourself; _production-grade_ is a phrase thrown around by anyone; and proven by no one.

## Usage (IMPORTANT):

Install command:
 ```bash
npx skills add maximfinnegan-dev/Tasty-Skills --skill '*' --global
```

These skills **Do Not Overlap**, Frontend.skill & FrontendDesign.skill are designed to be paired with each other. 

prompt-forge.skill is designed to author your CLAUDE.md file, author future skills, or to audit and optimise user prompts.

**All skills are designed to work with models:** 
* Claude Sonnet 5
* Claude Opus 5
* GPT 5.6 Sol
* Claude Opus 5.5

prompt-forge.skill is the _only one_ compatible with GPT 6 Astra

It is strictly not recommended to use Frontend & FrontendDesign with GPT 6 Astra since the model's best practices are a **polar opposite** when compared with other frontier models.

And were designed with models' best practices in mind.

It is recommended to **remove other skills used for similar uses to prevent bloated context, and to prevent overlap.**

You should also directly call FrontendDesign & Frontend once in the model's context lifetime; if the model compresses it's context, it's recommended to call the skills again.


## Skills

Three best-in-class skills for coding and planning LLMs (Claude Opus 5, Claude Sonnet 5, GPT-5.6 Sol, and GPT-6 Astra (Astra only for prompt-forge)). Each is a self-contained `SKILL.md` with bundled reference docs and assets, designed to load only what's needed and route to detail on demand. This README goes through every file in each. They were tested on both Claude Pro plan and GPT Plus plan to be so efficient, it'll be a dream using it on max. All SKILL.md files (loaded on message send) are capped to ≤500 words. 

---

## `Frontend.skill`

React/Next.js frontend engineering for trust-boundary and production work: everything that decides whether a page is *safe to ship*. Designed to pair with `frontend-design` without overlap. This skill owns auth, billing, the API layer, security, and performance; `frontend-design` owns everything about how the interface looks and feels.

**`SKILL.md`**: Defines the division of labor with `frontend-design` via a concern-by-concern ownership table, and flags the two places the boundary looks blurry (forms, error states) but isn't.

**References**

- `clerk-auth.md`: The Core 3 API surface, the protection model, and role/permission/organization authorization. Instructs verifying the installed SDK version before writing code.
- `clerk-billing.md`: Plans, features, and entitlements. Gating on features rather than plan names. Where to enforce a paywall and how to build the pricing page and subscription lifecycle.
- `api-layer.md`: The client/server boundary: a single API client, a consistent error envelope, validating responses, designing contracts, and handling pagination, filtering, and partial updates.
- `nextjs-runtime.md`: Where code runs and why that's a trust decision. Keeping secrets server-side, caching as a security surface, route handlers, and deployment to Cloudflare.
- `render-performance.md`: The four places a React app loses speed (rendering strategy, bundle size, images/assets, network) and the rule to measure before optimizing.
- `security.md`: Threat modeling the frontend's actual attack surface: XSS, CSP/security headers, CORS, cookies, input validation, file uploads, rate limiting, clickjacking.
- `seo.md`: Renderability, per-page head tags, structured data, sitemap.xml/robots.txt/llms.txt, and crawler access review.
- `verification.md`: Finding real test/lint commands, the baseline gate, and how to test auth, authorization, and entitlements rather than assert the work is done.

**Assets**

- `api-client.ts`: A typed API client template.
- `integration-handoff.md`: A handoff template for documenting an integration.

---

## `FrontendDesign.skill`

A complete system for designing and building interfaces in React with Motion (`motion/react`), and for auditing interfaces that already exist. Enforces a design-system-first workflow: locate and extend existing tokens before introducing new visual values, and state a one-line design read before generating anything.

**`SKILL.md`**: The build workflow (read the brief, set the three dials, build) and the audit workflow (discover, evaluate, report, implement), plus the rule that "improve this UI" is an audit that ends in a build.

**References**

- `design-direction.md`: Hierarchy, layout, typography, color, and density. Working within an existing design system versus deriving a token set from scratch on a greenfield project.
- `color-systems.md`: The mechanics of generating actual color values once a strategy is set, for building a new scale or adding a step to an existing one predictably.
- `concept-generation.md`: Finding a visual direction unique to a specific product, for new surfaces, brand expansions, or identity replacements.
- `system-extraction.md`: Formalizing a design system out of a codebase whose components are consistent in practice but were never codified into tokens.
- `motion-system.md`: The tokens, springs, rules, reduced-motion/device gating, and SSR safety that every animation depends on.
- `motion-patterns.md`: Production implementations (button, stagger list, modal, toast stack, page transition, scroll reveal) built entirely from `motion-system.md` tokens.
- `platform-motion.md`: Native CSS and Web Platform motion APIs for moments outside a mounted React tree, or that warrant more ambition than a component library.
- `states-and-a11y.md`: The four states every component needs, plus focus, keyboard, contrast, and other accessibility requirements.
- `react-architecture.md`: Component structure, state, hooks, and boundaries that keep an interface maintainable as it grows.
- `ux-foundations.md`: Named perception and psychology principles that justify design decisions and ground audit findings.
- `onboarding.md`: Getting a new user to the moment that proves the product's value, and sequencing what's taught before versus after it.
- `cross-platform.md`: What transfers across phones, tablets, desktops, TVs, watches, and headsets: aesthetic neutrality and adaptive layout.
- `mobile-web.md`: Phone-class touchscreen design specifics, including safe areas, input parity, and the Peak-End rule for flows, building on `cross-platform.md`.
- `product-surfaces.md`: Extra depth for authenticated product/app and dashboard surfaces, where the user is mid-task rather than being persuaded.
- `internationalization.md`: Designing for other languages, writing directions (RTL), and formatting conventions from the start.
- `amplitude-refinement.md`: Turning an existing interface's expressive intensity up or down ("make this feel more polished") without rebuilding it.
- `finishing-craft.md`: Concrete finishing details, visible only in a built and running result, that separate "competent" from "finished."
- `ai-tells.md`: The patterns that mark an interface as machine-generated by default, to check before finalizing any design.
- `audit.md`: The full audit workflow: discover, evaluate against 15 principles, rate severity, report, and implement fixes without losing coherence.
- `audit-lenses.md`: Two extra techniques layered onto `audit.md` for when a straightforward pass isn't surfacing what's actually wrong.

**Assets**

- `motion-tokens.ts`: The shared motion token and spring definitions used across `motion-patterns.md`.
- `use-safe-motion.tsx`: A hook implementing reduced-motion/device-gating safety.

---

## `prompt-forge`

Writes and refines instructions for coding and planning LLMs. Covers three related artifacts under one discipline: production-ready prompts, `AGENTS.md` repository maps, and reusable `SKILL.md` files. Helps decide which of the three a given need actually calls for.

**`SKILL.md`**: Defines the three artifacts, their lifetimes and load timing, and the shared discipline: state each instruction once, keep it checkable, explain why, cut what the model would do unaided.

**References**

- `model-profiles.md`: Behavioral differences and tuning snippets for Claude Opus 5, Claude Sonnet 5, GPT-5.6 Sol, and GPT-6 Astra, plus cross-model translation and harness routing notes.
- `prompt-patterns.md`: Eight core prompt patterns (distilled from CO-STAR, RISEN, BAB, RACE, TIDD-EC, Plan-and-Solve, Self-Refine, Chain-of-Verification, RPEF, Reverse Role, and others) plus two layers that stack onto any of them.
- `agents-md.md`: The spec to embed in another artifact instructing an implementing agent to write its own `AGENTS.md`, rather than one you write yourself sight unseen.
- `authoring-skills.md`: How to write a reusable `SKILL.md`, applying the same core discipline but accounting for on-demand loading.
- `diagnostics.md`: Failure patterns in existing prompts and how to fix them silently, flagging a fix only when it changes what was asked.
- `sources.md`: Where the skill's guidance comes from, so it can be checked and refreshed as model behavior changes. Can be ran with any mid-tier model at medium-high reasoning.

**Assets** (`templates/`)

- `agents-md-directive.md`: Directive text to embed for agents to generate their own repo map.
- `code-review.md`, `debug-task.md`, `implementation-task.md`, `refactor-task.md`: Task-specific prompt templates for common coding-agent workflows.
- `completion-gate.md`: A template enforcing a verification gate before declaring work done.
- `grounded-inquiry.md`, `interview-first.md`: Templates for information-gathering before execution.
- `planning-spec.md`: A template for planning and spec-writing tasks.
