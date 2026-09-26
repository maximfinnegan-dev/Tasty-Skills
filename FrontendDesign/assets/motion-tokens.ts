/**
 * Motion tokens.
 *
 * Drop this in once per project (conventionally `lib/motion-tokens.ts`) and
 * import from it everywhere. Centralising these values is what makes a motion
 * system tunable in one place instead of forty.
 *
 * Where the project's design system already defines durations or easing
 * curves, map onto those rather than running a parallel set — a component
 * whose CSS transitions and Motion transitions disagree by 100ms reads as
 * broken even when neither value is wrong on its own.
 */

export const motionTokens = {
  duration: {
    instant: 0.08, // tooltip show/hide, focus ring, badge update
    fast: 0.18,    // button feedback, icon swap, chip toggle
    normal: 0.35,  // modal open, card expand, element enter
    slow: 0.6,     // hero entrance, full-page transition
    crawl: 1.0,    // deliberate storytelling; use sparingly
  },

  /** Cubic-bezier control points. */
  easing: {
    smooth: [0.22, 1, 0.36, 1] as const,    // default enter/exit
    sharp: [0.4, 0, 0.2, 1] as const,       // quick UI feedback
    bounce: [0.34, 1.56, 0.64, 1] as const, // playful overshoot
    linear: [0, 0, 1, 1] as const,          // progress bars, marquees
  },

  /** Travel distances in px, for enter/exit offsets. */
  distance: { xs: 4, sm: 8, md: 16, lg: 24, xl: 48 },

  /** Scale factors for press, hover, and settle. */
  scale: { subtle: 0.98, press: 0.95, pop: 1.04 },
} as const

export const springs = {
  snappy: { type: "spring", stiffness: 300, damping: 30 },  // default UI
  gentle: { type: "spring", stiffness: 120, damping: 14 },  // cards, modals, panels
  bouncy: { type: "spring", stiffness: 400, damping: 10 },  // playful moments
  instant: { type: "spring", stiffness: 600, damping: 35 }, // tooltips, popovers
  /** Low restDelta so a flung element settles cleanly instead of creeping. */
  release: { type: "spring", stiffness: 200, damping: 20, restDelta: 0.001 },
} as const

/**
 * Device and motion-preference gating.
 *
 * Priority, highest first: prefers-reduced-motion > low-end device > design
 * preference. Decorative motion is the first thing `isLowEnd` turns off;
 * motion communicating real state passes `essential: true` and stays on.
 */
export const motionConfig = {
  isLowEnd() {
    if (typeof navigator === "undefined") return false
    // deviceMemory is Chromium-only; the core-count fallback covers Safari
    // and Firefox on weak hardware.
    const nav = navigator as Navigator & { deviceMemory?: number }
    if (nav.deviceMemory !== undefined) return nav.deviceMemory <= 2
    return navigator.hardwareConcurrency <= 4
  },

  prefersReduced() {
    return (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
  },

  shouldAnimate({ essential = false } = {}) {
    if (this.prefersReduced()) return false
    if (!essential && this.isLowEnd()) return false
    return true
  },
}
