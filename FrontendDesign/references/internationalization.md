# Internationalization

Building an interface that survives another language, another writing
direction, and another set of formatting conventions. Most of this costs
nothing if done from the start and is expensive to retrofit, which is the
reason to do it from the start.

**Contents:** [Language and direction](#language-and-direction) ·
[Logical properties](#logical-properties) · [RTL](#right-to-left) ·
[Formatting](#formatting) · [Text expansion](#text-expansion) ·
[Text in the wrong places](#text-in-the-wrong-places)

---

## Language and direction

Set `lang` on the root element — it drives screen reader pronunciation,
hyphenation, font selection, and quotation marks. Set `dir` alongside it.

```html
<html lang="en" dir="ltr">
```

Mark content whose language differs from the page:

```html
<blockquote lang="ar" dir="rtl">…</blockquote>
```

For user-generated content, `dir="auto"` lets the browser infer direction from
the first strong character — the right default for anything you did not write:

```html
<p dir="auto">{{ userComment }}</p>
```

---

## Logical properties

Write layout in terms of the flow of text rather than the sides of the screen.
The physical version breaks the moment the document direction flips; the
logical version needs no changes at all.

| Physical | Logical |
|---|---|
| `margin-left` / `margin-right` | `margin-inline-start` / `margin-inline-end` |
| `padding-top` / `padding-bottom` | `padding-block-start` / `padding-block-end` |
| `left` / `right` | `inset-inline-start` / `inset-inline-end` |
| `border-left` | `border-inline-start` |
| `border-top-left-radius` | `border-start-start-radius` |
| `width` / `height` | `inline-size` / `block-size` |
| `text-align: left` | `text-align: start` |

Shorthands cover both sides at once: `margin-inline: auto`,
`padding-block: 2rem`.

```css
.sidebar {
  margin-inline-start: 1rem;
  padding-inline-end: 2rem;
  border-inline-start: 1px solid var(--color-border);
}
```

Flexbox and Grid already follow the document direction, so a layout built with
them and logical properties flips correctly with no direction-specific CSS at
all. In Tailwind, the `ms-`/`me-`/`ps-`/`pe-` logical utilities do the same
job as `ml-`/`mr-`/`pl-`/`pr-`, and are worth defaulting to.

---

## Right to left

With logical properties in place, most of a layout mirrors for free. Three
things still need attention:

**Directional icons must flip** — back and forward arrows, next and previous
chevrons, indent controls, progress that advances along the reading direction:

```css
[dir="rtl"] .icon-directional { transform: scaleX(-1); }
```

**Non-directional icons must not flip.** A clock, a checkmark, a play button on
a media control, a logo, a photograph. Mirroring these is a bug that only
speakers of the language will notice.

**Numbers, code, and identifiers stay left to right** even inside RTL text.
Isolate them with `<bdi>` or `unicode-bidi: isolate` so surrounding text does
not scramble their ordering.

Test by setting `dir="rtl"` on the root and looking at every screen. Ten
minutes of this finds nearly everything.

---

## Formatting

Never hand-format a date, number, currency, or list. The `Intl` APIs know the
conventions for every locale and you do not.

```js
new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(date)
new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(1234.56)
new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(-1, "day")
new Intl.ListFormat(locale, { type: "conjunction" }).format(["a", "b", "c"])
new Intl.PluralRules(locale).select(count)
```

**Do not build plurals by string concatenation.** `${n} item${n === 1 ? "" : "s"}`
is correct in English and wrong nearly everywhere else — many languages have
more than two plural forms. Use the plural rules of the localization library.

**Do not concatenate sentence fragments.** Word order differs between
languages, so a template with named placeholders is translatable and a
sentence assembled from pieces is not.

**Time zones are part of formatting.** Display in the user's zone, store in
UTC, and say which zone when it matters.

---

## Text expansion

Translated text is routinely 30% longer than English, and German, Finnish, and
Russian regularly run longer still. A layout tuned to the exact length of
English strings breaks on contact with translation.

- **Never fix the width of a text container** to the length of its current
  content. Let buttons, labels, and navigation items grow.
- **Do not truncate as a layout strategy.** An ellipsis on a button label is a
  broken button. Wrap, reflow, or shorten the source string.
- **Test with a long-string pseudo-locale** if the project has one, or by
  temporarily padding strings by half again their length.
- **Compound words break differently.** Give long-word languages
  `overflow-wrap: break-word` on prose containers.

---

## Text in the wrong places

**Text baked into images cannot be translated, resized, selected, or read
aloud.** Use real text over a background image instead. This is also why
screenshots used as marketing assets need a plan if the product ships in more
than one language.

**Text in icons has the same problem**, and additionally does not survive being
rendered at 16px.

**Placeholder text is not a label** in any language, and machine-translating a
label into a placeholder makes the field harder to use, not easier.
