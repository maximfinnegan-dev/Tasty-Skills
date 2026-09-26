# Template — Implementation task

Pattern: Spec-and-Verify. The default for building a defined change.

Fill the slots, drop empty blocks, emit as flat text in one code block.

```
[OBJECTIVE — the end state in one or two sentences. Outcome, not procedure.]

Context:
- Files: [exact paths]
- Current behavior: [what happens today]
- Follow the pattern in: [path to an existing example]
- Stack: [language, framework, versions that constrain the solution]

Requirements:
1. [discrete and individually checkable]
2. [discrete and individually checkable]
3. [discrete and individually checkable]

Constraints:
- Do not [explicit prohibition, stated as a prohibition]
- Do not add features, abstractions, or improvements beyond what is listed above

Scope: change only [paths]. Do not modify [paths].

Autonomy: edit in-scope files and run tests without asking. Ask before
[installing dependencies / changing schema / anything destructive or external].

Verification: run [exact command]. Iterate until it passes. Show the output
rather than asserting success.

Output: [diff / list of files changed / commit with a descriptive message]

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

## Notes

Requirements go in a numbered list, not a paragraph. A model satisfies the requirements it parsed and quietly drops the rest, and the gate needs discrete items to score.

Long material — file contents, logs, a design document — goes **above** everything else, before the objective.

Model adjustments, from `references/model-profiles.md`:
- **Opus 5** — add the scope-constraint snippet if the task is narrow. Do not add verification instructions beyond the runnable check.
- **Sonnet 5** — spell out any rule meant to apply broadly; it will not generalize from one instance.
- **GPT-5.6 Sol** — the autonomy block matters most here. Delete any inherited "be concise" or persistence instruction.
- **GPT-6 Astra** — put the completion condition in Verification (running, inspected, failures fixed) and keep the Autonomy line as an authorization. Delete inherited "always run tests" lines, and any stop-for-review that is not a real decision.
