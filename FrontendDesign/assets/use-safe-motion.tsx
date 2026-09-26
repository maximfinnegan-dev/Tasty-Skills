"use client"

import { useReducedMotion } from "motion/react"
import { motionTokens } from "@/lib/motion-tokens"

/**
 * Enter/exit props that collapse to an opacity-only fade when the user has
 * asked for reduced motion.
 *
 * Reduced motion outranks the design and the device tier both — when it is
 * set, no transform runs at all. Spread the result onto a motion element, or
 * pull the individual states into variants:
 *
 *   const safe = useSafeMotion()
 *   <motion.div {...safe} transition={springs.gentle} />
 *
 *   // inside a stagger, where the parent owns the variants:
 *   <motion.li
 *     variants={{ hidden: safe.initial, visible: safe.animate }}
 *     exit={safe.exit}
 *   />
 */
export function useSafeMotion(fullY: number = motionTokens.distance.md) {
  const reduce = useReducedMotion()
  return {
    initial: { opacity: 0, y: reduce ? 0 : fullY },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reduce ? 0 : -fullY },
  }
}
