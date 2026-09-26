# Template — Refactor

Pattern: Invariant-Preserving Refactor. Structure changes, behavior does not.

```
Refactor [target] from [current structure] to [target structure].

Behavior must not change. Specifically, these must hold:
- [public API signatures unchanged]
- [output format identical]
- [side effects and their ordering preserved]
- [performance no worse than current]

Constraints:
- Do not change [public interfaces / DB schema / config format / wire format]
- Do not add features, abstractions, or improvements alongside the refactor
- Only make changes directly requested or clearly necessary. Do not add
  docstrings, comments, or type annotations to code you did not change. Do not
  add error handling for scenarios that cannot happen. Do not create helpers or
  abstractions for one-time operations, or design for hypothetical future
  requirements. The right amount of complexity is the minimum needed for the
  current task.

Scope: [paths]. Do not modify [paths].

Verification: the existing test suite passes unchanged. Run [command] and show
the output. Do not modify or delete tests — a modified test no longer proves
the behavior it was written to prove. If a test must change to accommodate the
refactor, stop and explain why before changing it.

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

Naming the invariants explicitly is the whole job. "Don't change behavior" is not checkable; "the public signatures of these four functions are unchanged and the JSON output is byte-identical" is.

The anti-overengineering clause is longer than usual here on purpose. Refactors are where these models do the most unrequested work, because they are already restructuring and the boundary between "the refactor" and "while I'm here" is genuinely blurry from the inside.

The don't-modify-tests instruction is not pedantry. An unchanged test suite passing is the only evidence that behavior is preserved; a model that adjusts a test to accommodate its refactor has destroyed the evidence it needed to produce.
