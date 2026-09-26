# Completion gate

The mandatory block for every prompt that produces code. Append verbatim as the last element of the prompt body. Adjust only the threshold, and only if the user asks.

```
When you have finished implementing, run this gate once before reporting back:
1. Re-read the original request and list its requirements as discrete items.
2. Score your implementation out of 10 on how completely it delivers those
   requirements — not on how good the code is in the abstract.
3. If the score is below 8, state what is missing or wrong, fix it, and re-score
   once.
4. Report the final score, one line of justification, and any requirement you
   deliberately did not meet and why.
Run this gate once, at the end. Do not re-verify work you have already verified.
```

## Why each line is there

**"Run this gate once"** and the closing line together prevent the loop. Opus 5 and Sonnet 5 already self-correct; an open-ended "check your work" instruction stacks on that and produces over-verification — real token cost, no quality gain. Bounding it to one pass is what makes the gate compatible with these models. GPT-6 Astra tests thoroughly unprompted, so the one-pass bound serves it as well, and the requirement list gives a model prone to stopping early a concrete definition of done.

**"List its requirements as discrete items"** turns a prose request into something scoreable. Without it the model scores a vibe. This is also why Spec-and-Verify writes requirements as a list — the gate has something to check against.

**"How completely it delivers those requirements — not how good the code is"** anchors the score to the user's request. Unanchored, a model scores its own craftsmanship, which it is not well placed to judge and which was not the question.

**"Below 8"** sets a bar that catches real gaps without triggering a rewrite over trivia. Lower it to 7 for exploratory work, raise it to 9 for high-stakes changes.

**"Any requirement you deliberately did not meet and why"** is the highest-value line for the user. A model that consciously skipped something and says so is far more useful than one that scores 9/10 and stays quiet about the exception. It also surfaces requirements that were infeasible or contradictory, which is information the user needs.

## What it does not do

The gate catches missing and misread requirements. It does not catch broken code — only a runnable check does that. A prompt needs both. If you find yourself relying on the gate as the only verification, the prompt is missing its Verification block.

## Variants

**Non-code deliverables** (plans, specs, analyses) — same structure, scored against the brief:

```
Before delivering, run this check once: list what the request asked for as
discrete items, score your draft out of 10 on how completely it covers them,
and if it is below 8, fix the gaps and re-score once. Report the score, one
line of justification, and anything you left out on purpose.
```

**Multi-stage tasks** — gate each stage rather than only the end, so a stage-one gap does not propagate:

```
At the end of each stage, score that stage out of 10 against its own
requirements. If below 8, fix it before moving to the next stage. Do not carry
a failing stage forward.
```
