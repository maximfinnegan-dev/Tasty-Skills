# Template — Codebase question

Pattern: Grounded Inquiry. The deliverable is an answer, not a change.

```
[QUESTION]

Read [specific paths / git history / the relevant tests] before answering.

Answer from what the code actually does. Quote the specific lines your answer
rests on. If something is unclear from the code, say so rather than inferring
what it probably does.

Do not modify any files.
```

## For a stronger grounding constraint

Use when the model has already speculated once, or when the answer will be acted on:

```
<investigate_before_answering>
Never speculate about code you have not opened. If the question references a
specific file, you must read the file before answering. Investigate and read
the relevant files before answering questions about the codebase. Never make
claims about code before investigating unless you are certain of the answer.
</investigate_before_answering>
```

## Notes

"Do not modify any files" is doing real work. The Claude models and Sol default toward action, and a question asked near a problem often gets answered with a fix — which is sometimes welcome and sometimes a surprise diff in a repo the user was only reading. Astra leans toward asking instead, but keep the line.

Point at the source that can answer the question rather than asking the question cold. "Look through this module's git history and summarize how its API came to be" beats "why is this API so weird" — the second invites a plausible story, the first produces evidence.

Bound the investigation. An unscoped "investigate X" reads hundreds of files and fills the context. Scope it by path or hypothesis, or delegate it to a subagent so the exploration does not consume the main session's context.

No completion gate here — nothing is produced to score. If the answer leads to a change, the gate belongs on that prompt.
