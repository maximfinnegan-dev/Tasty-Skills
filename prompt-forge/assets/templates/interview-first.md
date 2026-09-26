# Template — Interview-first

Pattern: Interview-First. Use when the user knows roughly what they want but cannot specify it, and guessing would be expensive.

Reach for this only when the unknowns are domain unknowns the user holds and you cannot enumerate them from outside. If you can name the three questions, ask them yourself and skip this.

```
I want to build [one-line description].

Interview me in detail before writing anything. Ask about technical
implementation, UI/UX, edge cases, failure modes, data model, and tradeoffs.
Do not ask obvious questions — dig into the hard parts I might not have
considered.

[If the harness has a structured question tool, name it here.]

Keep interviewing until we have covered everything, then write a complete spec
to SPEC.md covering:
- What is being built and why
- Files and interfaces involved
- Requirements as a discrete, checkable list
- Edge cases and how each is handled
- What is explicitly out of scope
- An end-to-end verification step that proves the feature works

Do not write implementation code in this session.
```

Then start a fresh session against the spec, using `implementation-task.md` with SPEC.md as the requirements source.

## Notes

This inverts the normal flow for a good reason: users leave out context — audience, constraints, edge cases, prior decisions — not because they are careless but because they do not know the model needs it. Letting the model interrogate surfaces those gaps before anything gets built on top of them.

"Don't ask obvious questions" matters. Without it the interview burns turns on things the model could have inferred, and the user disengages before the hard parts.

The spec is the deliverable, and it should be self-contained enough that a fresh session can execute it with no other context. Time spent making it precise pays back more than time spent watching the implementation.
