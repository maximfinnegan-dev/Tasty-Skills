# React architecture

Component structure, state, hooks, and boundaries. The patterns here are the
ones that keep an interface maintainable as it grows; reach for a pattern when
the complexity is already there, not in anticipation of it.

Render performance, bundle size, memoization, and virtualization live in the
`frontend` skill's `references56/render-performance.md` — read it there when
the concern is speed rather than structure.

**Contents:** [Server and client boundaries](#server-and-client-boundaries) ·
[Composition](#composition) · [Compound components](#compound-components) ·
[Custom hooks](#custom-hooks) · [State](#state) ·
[Data fetching](#data-fetching) · [Forms](#forms) ·
[Error boundaries](#error-boundaries) · [Styling](#styling) ·
[Dependencies](#dependencies) · [Data handling](#data-handling)

---

## Server and client boundaries

In an App Router project, default to Server Components and push `"use client"`
down to the leaves.

- Anything importing `motion/react`, using a scroll or pointer listener, or
  holding interactive state must be a client component.
- Keep those client components small and specific. A `"use client"` at the top
  of a page pulls the whole tree into the bundle.
- Providers — theme, store, query client — belong in a dedicated client
  component that wraps `children`, so the layout itself stays a server
  component.
- Server components render the static layout; the animated or interactive
  piece is an island inside it.

Variants that need to propagate (`staggerChildren` from a parent to its
children) require parent and children in the same client tree. A server-rendered
parent cannot pass variants to a client child.

---

## Composition

Prefer composition over configuration props. A component that grows a
`showHeader`, `headerVariant`, `headerAlign` prop set wants to be several
components.

```tsx
export function Card({ children, ...props }: CardProps) {
  return <div {...props}>{children}</div>
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

export function CardBody({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

// Usage
<Card>
  <CardHeader>Title</CardHeader>
  <CardBody>Content</CardBody>
</Card>
```

Accept `className` and spread the rest of the props on the root element so a
component can be adapted at the call site without a new prop.

---

## Compound components

When several parts need shared state but arbitrary arrangement, use context —
and throw a clear error when a part is used outside its parent, because the
alternative is a confusing `undefined` several frames later.

```tsx
const TabsContext = createContext<TabsContextValue | undefined>(undefined)

export function Tabs({ children, defaultTab }: { children: React.ReactNode; defaultTab: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const value = useMemo(() => ({ activeTab, setActiveTab }), [activeTab])
  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>
}

function useTabs() {
  const context = useContext(TabsContext)
  if (!context) throw new Error("Tabs parts must be used within <Tabs>")
  return context
}

export function Tab({ id, children }: { id: string; children: React.ReactNode }) {
  const { activeTab, setActiveTab } = useTabs()
  return (
    <button
      role="tab"
      aria-selected={activeTab === id}
      onClick={() => setActiveTab(id)}
    >
      {children}
    </button>
  )
}
```

Memoize the context value. Without it, every consumer re-renders whenever the
provider re-renders for any reason.

Tabs, menus, and disclosure widgets have specified keyboard behavior — arrow
keys between tabs, Escape to close. See `states-and-a11y.md`.

---

## Custom hooks

Extract a hook when the same stateful logic appears in two places, or when a
component's body has more effect wiring than markup.

```tsx
export function useToggle(initial = false): [boolean, () => void] {
  const [value, setValue] = useState(initial)
  const toggle = useCallback(() => setValue((v) => !v), [])
  return [value, toggle]
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value)
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(handle)
  }, [value, delay])
  return debounced
}
```

Every hook that adds a listener, timer, subscription, or animation control
returns the matching cleanup. Missing cleanup is the most common source of
"it works until you navigate away twice".

---

## State

| Kind of state | Where it belongs |
|---|---|
| Isolated UI state (open, hovered, selected) | `useState` in the component |
| Several related values that change together | `useReducer` |
| Server data | A data-fetching library's cache — not component state |
| Shared across distant components | Context, or a store (Zustand, Jotai) |
| Continuous input values — pointer, scroll, drag | `useMotionValue`, never `useState` |
| Derived from other state | Computed during render; not stored |

**Do not mirror props into state.** A `useState(props.value)` that never
resyncs is a bug waiting for the prop to change.

**Do not store what you can compute.** A `filteredItems` state that must be
kept in sync with `items` and `query` will eventually drift. Compute it.

Reach for global state only to avoid deep prop drilling. Two levels of props is
not deep.

---

## Data fetching

Use the framework's data layer or an established library — React Query, SWR,
server components with `fetch`. Hand-rolled fetching in `useEffect` misses
caching, deduplication, revalidation, and race-condition handling, all of which
you will end up reimplementing badly.

When a hand-rolled hook is genuinely warranted, keep callbacks in refs so the
returned function stays referentially stable — otherwise inline callbacks at
the call site create a new function every render, the effect re-runs after
every state update, and you get an infinite fetch loop:

```tsx
const fetcherRef = useRef(fetcher)
useEffect(() => { fetcherRef.current = fetcher })

const refetch = useCallback(async () => {
  setLoading(true)
  try { setData(await fetcherRef.current()) }
  catch (err) { setError(err as Error) }
  finally { setLoading(false) }
}, [])
```

Every fetch has three outcomes and the UI needs all three: loading, empty
success, and error. See `states-and-a11y.md`.

---

## Forms

- **Labels above inputs**, always associated. Placeholder-as-label fails the
  moment the user starts typing.
- **Validate inline**, not only on submit. Errors appear beside the field they
  belong to, with `aria-invalid` on the input and `aria-describedby` pointing
  at the message.
- **Disable the submit control during the request** and show that it is
  working, or users double-submit.
- **Constrain the input** rather than validating after: `type`, `inputmode`,
  `min`, `max`, `pattern`, `maxlength`, `autocomplete`. A date picker prevents
  errors a text field can only report.
- **Preserve input on error.** An error that clears the form is worse than the
  error.
- **Warn before discarding unsaved changes.**

For anything past a few fields, use a form library with schema validation
rather than hand-managing an error object — the hand-rolled version drifts out
of sync with the schema.

---

## Error boundaries

Wrap independently failing regions so one broken widget does not blank the
page. Boundaries catch render errors only — not event handlers, not async code,
not errors in effects after an await.

```tsx
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    reportError(error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div role="alert">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false, error: null })}>Try again</button>
        </div>
      )
    }
    return this.props.children
  }
}
```

The fallback should offer a way forward — retry, go back, contact — not just
state that something failed. Never surface a stack trace or an error code to
the user.

---

## Styling

Whatever the project uses, follow it. Across approaches:

- Values come from the design system's tokens. In Tailwind, that means theme
  tokens and arbitrary values referencing custom properties — not raw palette
  classes standing in for brand colors.
- Compose classes with a merge helper so a `className` prop can override the
  component's own classes predictably.
- Watch selector specificity when writing plain CSS — a type-based selector
  and a class-based selector fighting over section padding is a common and
  hard-to-spot cause of layout that "sometimes" breaks.
- Keep transitions in CSS where CSS is enough. Reach for Motion when you need
  orchestration, exit animations, gestures, or layout transitions.

---

## Dependencies

Check `package.json` before importing anything. If a package is missing, say
what needs installing before writing code against it — an import of a package
that is not there is a build failure, not a suggestion.

Prefer one icon library per project at a consistent stroke weight, one
animation library, one form library. Mixed libraries for one job produce
inconsistent output and duplicate bundle weight.

---

## Data handling

Use synthetic or domain-generic data in examples. Do not log, persist, or
display credentials, tokens, personal identifiers, health data, or payment
details unless the request explicitly asks for a scoped implementation with
appropriate redaction and access control.

Do not add analytics, tracking pixels, or third-party scripts without asking.
They are a privacy decision and a performance decision, and neither is yours to
make silently.
