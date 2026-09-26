# Color systems

`design-direction.md`'s Color section owns the strategy: which role a color
plays, how much of the interface it should touch, what stays neutral. This file
owns the mechanics of generating the actual values once that strategy is set —
relevant when a project has no established color format yet, or when an
existing scale needs a new step and the values should behave predictably rather
than being eyeballed one at a time.

## Why OKLCH

In hex or HSL, two colors with the same lightness value rarely look equally
light to the eye — blue and yellow at "50% lightness" are not perceived the
same way, because those spaces are not built around human perception. OKLCH
separates perceptual lightness, chroma (saturation), and hue into independent
axes, so raising lightness by a fixed amount produces a consistent perceptual
step regardless of hue. That is what makes a *generated* ramp usable: the steps
actually look evenly spaced instead of needing hand-correction at every value.

```css
/* oklch(lightness chroma hue) */
--accent-500: oklch(58% 0.19 255);
--accent-600: oklch(48% 0.19 255); /* darker, same chroma and hue */
```

This is guidance for producing new tokens or extending a scale, not a mandate to
migrate an already-coherent existing palette to a new format mid-task. If the
project already has a working scale in hex or HSL, follow it.

## Deriving a ramp

Fix the hue, then vary lightness in even steps to build the scale — the same
5-6 step spacing `design-direction.md`'s greenfield derivation already calls
for, just generated with predictable math instead of picked by eye.

**Taper chroma near the extremes.** A color held at high chroma while pushed
toward very light or very dark lightness values either clips to the edge of
what the display can show or reads as muddy rather than vivid. Reduce chroma as
lightness approaches either end of the scale; keep it highest in the middle
steps, where the hue actually reads as itself.

```
Step   Lightness   Chroma        Use
50     97%         0.02          faint tint background
300    85%         0.08          subtle fill
500    58%         0.19          primary accent, full saturation
700    42%         0.15          hover / pressed
900    22%         0.05          near-black text on a light accent surface
```

Do not force uniform chroma across every step "for consistency" — that
consistency is mathematical, not perceptual, and produces washed-out light
steps or over-saturated dark ones. The taper is what makes the ramp actually
look like one color family end to end.

## Contrast-critical values want explicit colors, not stacked alpha

A translucent overlay's effective contrast against its background depends on
whatever is behind it — which means the same `rgba()` or alpha-channel value
can pass a contrast check in one context and fail it in another the moment the
background changes. For anything contrast-critical — body text, button labels,
focus rings — compute and store the actual resulting color as an explicit
token rather than layering transparency to approximate it. Reserve alpha for
places where the content behind it is expected to vary and the design accounts
for that (a scrim over an unpredictable photo, for instance), not as a shortcut
for "slightly darker."

## Where this feeds back

The ramp this produces is raw material for `design-direction.md`'s "pair every
fill with its foreground" and "surface ladder" patterns — generate the ramp
first, then assign roles to specific steps (`accent-500` is the button fill,
`accent-50` is its tinted background, and so on) rather than picking a role's
color ad hoc and hoping it happens to relate to its neighbors.
