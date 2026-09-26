# Motion patterns

Production implementations. Every value comes from `motionTokens` and `springs`
in `motion-system.md` — nothing here defines a new number. Read
`motion-system.md` first if you have not.

**Contents:** [Button](#button) · [Stagger list](#stagger-list) ·
[Modal](#modal) · [Toast stack](#toast-stack) ·
[Page transition](#page-transition) · [Scroll reveal](#scroll-reveal) ·
[Scroll progress](#scroll-progress-bar) · [Expanding card](#expanding-card) ·
[Accordion](#accordion) · [Shared element](#shared-element-crossfade) ·
[Draggable card](#draggable-card) · [Drag to dismiss](#drag-to-dismiss-sheet) ·
[Reorderable list](#reorderable-list) · [Swipe](#swipe-detection) ·
[Long press](#long-press) · [Word reveal](#word-by-word-reveal) ·
[Number counter](#number-counter) · [SVG draw-on](#svg-path-draw-on) ·
[Progress ring](#stroke-progress-ring) · [Cursor follower](#cursor-follower) ·
[Shimmer](#shimmer-skeleton) · [Button loading](#button-loading-state) ·
[Pulse](#infinite-animation-with-visibility-pause) ·
[Imperative sequences](#imperative-sequences) ·
[End-to-end examples](#end-to-end-dismissible-reduced-motion-safe-list)

---

## Button

```tsx
"use client"
import { motion } from "motion/react"
import { springs, motionTokens } from "@/lib/motion-tokens"

<motion.button
  whileHover={{ scale: motionTokens.scale.pop }}
  whileTap={{ scale: motionTokens.scale.press }}
  transition={springs.snappy}
>
  Click me
</motion.button>
```

`whileTap` is not optional — on touch, `whileHover` never fires.

## Stagger list

Keep `staggerChildren` between 0.05s and 0.10s. Below that it reads as
simultaneous; above, as sluggish. Keep the group small.

```tsx
"use client"
import { motion } from "motion/react"
import { motionTokens, springs } from "@/lib/motion-tokens"

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const item = {
  hidden:  { opacity: 0, y: motionTokens.distance.md },
  visible: { opacity: 1, y: 0, transition: springs.gentle },
}

<motion.ul variants={container} initial="hidden" animate="visible">
  {items.map((i) => <motion.li key={i.id} variants={item} />)}
</motion.ul>
```

Parent and children must live in the same client component tree, or the
variants will not propagate.

## Modal

Three things must be true for the exit to fire: `AnimatePresence` wraps the
conditional, the direct child has a `key`, the child defines `exit`. A modal
additionally needs a focus trap, Escape to close, scroll lock, `role="dialog"`,
`aria-modal="true"`, and `mode="wait"`.

```tsx
"use client"
import React, { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { motionTokens, springs } from "@/lib/motion-tokens"

function useFocusTrap(ref: React.RefObject<HTMLDivElement | null>, active: boolean) {
  useEffect(() => {
    if (!active || !ref.current) return
    const el = ref.current
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last  = focusable[focusable.length - 1]

    function handleKey(e: KeyboardEvent) {
      if (e.key !== "Tab") return
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first?.focus()
      }
    }
    el.addEventListener("keydown", handleKey)
    first?.focus()
    return () => el.removeEventListener("keydown", handleKey)
  }, [active, ref])
}

function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = prev }
  }, [active])
}

export function Modal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, open)
  useScrollLock(open)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose() }
    if (open) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 flex items-center justify-center bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: motionTokens.duration.fast }}
          onClick={onClose}
        >
          <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: motionTokens.scale.press, y: motionTokens.distance.sm }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{    opacity: 0, scale: motionTokens.scale.press, y: motionTokens.distance.sm }}
            transition={springs.gentle}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="modal-title">Dialog title</h2>
            <button onClick={onClose}>Close</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

Return focus to the trigger on close — store `document.activeElement` before
opening and restore it after. See `states-and-a11y.md`.

## Toast stack

Toasts stack, so overlap between entering and exiting is fine. Use `mode="sync"`.

```tsx
"use client"
import { motion, AnimatePresence } from "motion/react"
import { motionTokens, springs } from "@/lib/motion-tokens"

<AnimatePresence mode="sync">
  {toasts.map((t) => (
    <motion.div
      key={t.id}
      layout
      role="status"
      initial={{ opacity: 0, x: motionTokens.distance.xl, scale: motionTokens.scale.subtle }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{    opacity: 0, x: motionTokens.distance.xl, scale: motionTokens.scale.subtle }}
      transition={springs.snappy}
    />
  ))}
</AnimatePresence>
```

Error toasts should not auto-dismiss — users need time to read them.

## Page transition

```tsx
// components/page-transition.tsx
"use client"
import { motion, AnimatePresence } from "motion/react"
import { usePathname } from "next/navigation"
import { motionTokens } from "@/lib/motion-tokens"

const variants = {
  initial: { opacity: 0, y: motionTokens.distance.sm },
  enter:   { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -motionTokens.distance.sm },
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="enter"
        exit="exit"
        transition={{ duration: motionTokens.duration.normal, ease: motionTokens.easing.smooth }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

Keep page transitions short. Anything past about 400ms makes navigation feel
slow rather than polished.

## Scroll reveal

`viewport={{ once: true }}` — an element re-animating every time it scrolls
back into view reads as distracting rather than informative.

```tsx
"use client"
import { motion } from "motion/react"
import { motionTokens } from "@/lib/motion-tokens"

<motion.div
  initial={{ opacity: 0, y: motionTokens.distance.lg }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-80px" }}
  transition={{ duration: motionTokens.duration.slow, ease: motionTokens.easing.smooth }}
/>
```

## Scroll progress bar

```tsx
"use client"
import { motion, useScroll } from "motion/react"

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  return (
    <motion.div
      className="fixed top-0 left-0 h-1 origin-left w-full bg-[var(--color-accent)]"
      style={{ scaleX: scrollYProgress }}
    />
  )
}
```

## Expanding card

`layout` works here because it is one element with shallow children. Past about
five children or deep nesting, use explicit transforms. `layout="position"` on
the heading stops its text reflowing as the container resizes.

```tsx
"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { motionTokens } from "@/lib/motion-tokens"

export function ExpandingCard({ title, body }: { title: string; body: string }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <motion.div layout>
      <motion.button layout="position" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>
        {title}
      </motion.button>
      <AnimatePresence>
        {expanded && (
          <motion.p
            key="body"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: motionTokens.duration.fast }}
          >
            {body}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
```

## Accordion

```tsx
<motion.div
  initial={false}
  animate={{ opacity: open ? 1 : 0, scaleY: open ? 1 : 0 }}
  style={{ transformOrigin: "top", overflow: "hidden" }}
  transition={{ duration: motionTokens.duration.normal, ease: motionTokens.easing.smooth }}
>
  {children}
</motion.div>
```

`initial={false}` prevents the closed panel animating on first mount.

## Shared element crossfade

`layoutId` must be unique per mounted instance. If several can exist at once —
a grid of cards each with a detail view — suffix it.

```tsx
// Source
<motion.img layoutId={`hero-${item.id}`} src={src} className="w-16 h-16" />

// Destination — same layoutId, Motion handles the transition
<motion.img layoutId={`hero-${item.id}`} src={src} className="w-full" />
```

## Draggable card

```tsx
"use client"
import { motion } from "motion/react"
import { springs, motionTokens } from "@/lib/motion-tokens"

<motion.div
  drag
  dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
  dragElastic={0.1}
  whileDrag={{ scale: motionTokens.scale.pop }}
  dragTransition={springs.release}
/>
```

## Drag to dismiss sheet

```tsx
"use client"
import { motion, useMotionValue, useTransform } from "motion/react"

export function BottomSheet({ onClose }: { onClose: () => void }) {
  const y = useMotionValue(0)
  const opacity = useTransform(y, [0, 200], [1, 0])

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0 }}
      style={{ y, opacity, touchAction: "pan-x" }}
      onDragEnd={(_, info) => {
        if (info.offset.y > 120 || info.velocity.y > 500) onClose()
      }}
    />
  )
}
```

Mount it outside any scrolling container — a portal — if it fights page scroll.

## Reorderable list

```tsx
"use client"
import { Reorder } from "motion/react"

export function SortableList() {
  const [items, setItems] = useState(initialItems)
  return (
    <Reorder.Group axis="y" values={items} onReorder={setItems}>
      {items.map((item) => (
        <Reorder.Item key={item.id} value={item}>{item.label}</Reorder.Item>
      ))}
    </Reorder.Group>
  )
}
```

Drag-to-reorder needs a keyboard equivalent — move-up and move-down controls,
or arrow-key handling — or the feature is unusable without a pointer.

## Swipe detection

Gate on both offset and velocity. Velocity alone misreads a fast short flick.

```tsx
const OFFSET_THRESHOLD = 50
const VELOCITY_THRESHOLD = 300

<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  style={{ touchAction: "pan-y" }}
  onDragEnd={(_, info) => {
    if (info.offset.x >  OFFSET_THRESHOLD || info.velocity.x >  VELOCITY_THRESHOLD) onSwipeRight()
    if (info.offset.x < -OFFSET_THRESHOLD || info.velocity.x < -VELOCITY_THRESHOLD) onSwipeLeft()
  }}
/>
```

## Long press

```tsx
import { useRef, useEffect } from "react"

export function useLongPress(callback: () => void, ms = 600) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => () => clearTimeout(timerRef.current), [])
  return {
    onPointerDown:  () => { timerRef.current = setTimeout(callback, ms) },
    onPointerUp:    () => clearTimeout(timerRef.current),
    onPointerLeave: () => clearTimeout(timerRef.current),
  }
}
```

## Word-by-word reveal

```tsx
"use client"
import { motion } from "motion/react"
import { springs } from "@/lib/motion-tokens"

export function AnimatedText({ text }: { text: string }) {
  return (
    <motion.p
      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      initial="hidden"
      animate="visible"
    >
      {text.split(" ").map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-1"
          variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: springs.gentle } }}
        >
          {word}
        </motion.span>
      ))}
    </motion.p>
  )
}
```

Splitting text into spans hides it from some assistive technology as one
string. Put the full text on an `aria-label` on the paragraph and
`aria-hidden="true"` on the split spans.

## Number counter

```tsx
"use client"
import { useRef, useEffect } from "react"
import { animate } from "motion"
import { motionTokens } from "@/lib/motion-tokens"

export function Counter({ to }: { to: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const controls = animate(0, to, {
      duration: motionTokens.duration.crawl,
      ease: motionTokens.easing.smooth,
      onUpdate: (v) => { if (nodeRef.current) nodeRef.current.textContent = Math.round(v).toString() },
    })
    return controls.stop
  }, [to])
  return <span ref={nodeRef} />
}
```

## SVG path draw-on

```tsx
<motion.path
  d="M 0 100 Q 50 0 100 100"
  initial={{ pathLength: 0, opacity: 0 }}
  animate={{ pathLength: 1, opacity: 1 }}
  transition={{ duration: motionTokens.duration.slow, ease: motionTokens.easing.smooth }}
/>
```

## Stroke progress ring

```tsx
"use client"
import { motion } from "motion/react"
import { motionTokens } from "@/lib/motion-tokens"

const CIRCUMFERENCE = 2 * Math.PI * 40 // r=40

export function ProgressRing({ progress }: { progress: number }) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100"
         role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" opacity={0.15} strokeWidth="8" />
      <motion.circle
        cx="50" cy="50" r="40"
        fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        animate={{ strokeDashoffset: CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE }}
        transition={{ duration: motionTokens.duration.normal, ease: motionTokens.easing.smooth }}
        style={{ rotate: -90, transformOrigin: "center" }}
      />
    </svg>
  )
}
```

## Cursor follower

Desktop only — hide behind a pointer-type check, and keep it clear of
interactive elements so it never masks their own feedback.

```tsx
"use client"
import { useEffect } from "react"
import { motion, useMotionValue, useSpring } from "motion/react"
import { springs } from "@/lib/motion-tokens"

export function CursorFollower() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, springs.gentle)
  const sy = useSpring(y, springs.gentle)

  useEffect(() => {
    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY) }
    window.addEventListener("mousemove", move)
    return () => window.removeEventListener("mousemove", move)
  }, [x, y])

  return <motion.div className="fixed top-0 left-0 pointer-events-none z-50" style={{ x: sx, y: sy }} />
}
```

## Shimmer skeleton

A skeleton matching the shape of the content it replaces is more useful than a
spinner — it prevents the layout shift a spinner leaves behind.

```tsx
"use client"
import { useEffect } from "react"
import { motion, useAnimation } from "motion/react"
import { motionTokens } from "@/lib/motion-tokens"

export function ShimmerSkeleton({ className = "" }: { className?: string }) {
  const controls = useAnimation()

  useEffect(() => {
    const play = () => controls.start({
      x: ["-100%", "100%"],
      transition: { repeat: Infinity, duration: motionTokens.duration.crawl, ease: motionTokens.easing.linear },
    })
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") controls.stop()
      else void play()
    }
    void play()
    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      controls.stop()
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [controls])

  return (
    <div className={`relative overflow-hidden ${className}`} aria-hidden="true">
      <motion.div className="absolute inset-0" initial={{ x: "-100%" }} animate={controls} />
    </div>
  )
}
```

## Button loading state

```tsx
"use client"
import { motion, AnimatePresence } from "motion/react"
import { motionTokens, springs } from "@/lib/motion-tokens"

export function LoadingButton({ loading, label, onClick }: {
  loading: boolean; label: string; onClick: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      animate={{ opacity: loading ? 0.7 : 1 }}
      whileTap={loading ? {} : { scale: motionTokens.scale.press }}
      transition={springs.snappy}
      disabled={loading}
      aria-busy={loading}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: motionTokens.duration.fast }}>Saving…</motion.span>
        ) : (
          <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: motionTokens.duration.fast }}>{label}</motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
```

Disabling during the request is what prevents double submission — the most
common form bug this pattern fixes.

## Infinite animation with visibility pause

```tsx
"use client"
import { useEffect } from "react"
import { motion, useAnimation } from "motion/react"
import { motionTokens } from "@/lib/motion-tokens"

export function PulseDot() {
  const controls = useAnimation()

  useEffect(() => {
    const pulse = () => controls.start({
      scale: [1, 1.4, 1], opacity: [1, 0.6, 1],
      transition: { repeat: Infinity, duration: motionTokens.duration.crawl },
    })
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") controls.stop()
      else void pulse()
    }
    void pulse()
    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      controls.stop()
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [controls])

  return <motion.span animate={controls} />
}
```

## Imperative sequences

`useAnimate` returns `[scope, animate]`. Calls are interrupt-safe — calling
`animate()` mid-sequence cancels whatever was running.

```tsx
const [scope, animate] = useAnimate()

async function play() {
  await animate(".step-1", { opacity: 1 }, { duration: motionTokens.duration.normal })
  await animate(".step-2", { x: 0 },       { duration: motionTokens.duration.normal })
        animate(".step-3", { scale: 1 },   { duration: motionTokens.duration.fast })
}

return <div ref={scope}>...</div>
```

Only call `animate()` from an effect or an event handler. Calling it during
render, before the scope ref is attached, throws.

## Scroll-linked values

```tsx
"use client"
import { useRef } from "react"
import { useScroll, useTransform } from "motion/react"
import { motionTokens } from "@/lib/motion-tokens"

export function useScrollReveal() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1])
  const y       = useTransform(scrollYProgress, [0, 0.3], [motionTokens.distance.lg, 0])
  return { ref, style: { opacity, y } }
}
```

For a sticky or pinned scroll scene, pin the wrapper at `top top` and drive the
inner track from scroll progress. The common failure is starting the animation
before the section is pinned, so the user sees it half-played on arrival.

---

## End-to-end: dismissible, reduced-motion-safe list

```tsx
"use client"
import { motion, AnimatePresence } from "motion/react"
import { motionTokens, springs } from "@/lib/motion-tokens"
import { useSafeMotion } from "@/hooks/use-safe-motion"

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

function ListItem({ label, onRemove }: { label: string; onRemove: () => void }) {
  const safe = useSafeMotion(motionTokens.distance.sm)
  return (
    <motion.li
      variants={{ hidden: safe.initial, visible: safe.animate }}
      exit={safe.exit}
      transition={springs.gentle}
    >
      <span>{label}</span>
      <button onClick={onRemove} aria-label={`Remove ${label}`}>Remove</button>
    </motion.li>
  )
}

export function AnimatedList({ items, onRemove }: {
  items: { id: string; label: string }[]
  onRemove: (id: string) => void
}) {
  if (items.length === 0) return <EmptyState />

  return (
    <motion.ul variants={containerVariants} initial="hidden" animate="visible">
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <ListItem key={item.id} label={item.label} onRemove={() => onRemove(item.id)} />
        ))}
      </AnimatePresence>
    </motion.ul>
  )
}
```

`popLayout` is what makes the remaining items close the gap rather than
animating around a ghost.

## End-to-end: drag-to-dismiss sheet with loading content

```tsx
"use client"
import { motion, AnimatePresence, useMotionValue, useTransform } from "motion/react"
import { springs, motionTokens } from "@/lib/motion-tokens"
import { useSafeMotion } from "@/hooks/use-safe-motion"
import { ShimmerSkeleton } from "./shimmer-skeleton"

export function DismissibleSheet({ isOpen, onClose, loading, children }: {
  isOpen: boolean; onClose: () => void; loading: boolean; children: React.ReactNode
}) {
  const safe = useSafeMotion(motionTokens.distance.xl)
  const y = useMotionValue(0)
  const opacity = useTransform(y, [0, 200], [1, 0])

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            className="fixed bottom-0 inset-x-0"
            style={{ y, opacity, paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
            drag="y"
            dragConstraints={{ top: 0 }}
            onDragEnd={(_, info) => { if (info.offset.y > 120 || info.velocity.y > 500) onClose() }}
            initial={safe.initial}
            animate={safe.animate}
            exit={safe.exit}
            transition={springs.gentle}
          >
            {loading ? (
              <>
                <ShimmerSkeleton className="h-4 w-3/4" />
                <ShimmerSkeleton className="h-4 w-1/2" />
                <ShimmerSkeleton className="h-20 w-full" />
              </>
            ) : children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

Drag-to-dismiss needs a visible close control as well — a gesture is not
discoverable and is not keyboard-reachable.
