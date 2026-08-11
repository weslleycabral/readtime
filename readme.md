# ReadTime

A lightweight, performance-focused, attribute-driven JavaScript library to calculate and render reading time directly in the DOM.

Inspired by declarative attribute systems, **ReadTime** allows you to define reading time behavior using simple HTML attributes — no configuration objects, no framework dependencies.

Zero dependencies. Minimal footprint. Production-ready.

<div align="center">

![License](https://img.shields.io/badge/license-MIT-green)
![CDN](https://img.shields.io/badge/CDN-npm-red)
![Status](https://img.shields.io/badge/status-stable-brightgreen)
![Javascript](https://img.shields.io/badge/language-javascript-yellow)

</div>

## Installation

### CDN (Recommended)

```html
<!-- Readtime Library -->
<script defer src="https://cdn.jsdelivr.net/npm/attr-readtime@1.0.0/dist/readtime.min.js"></script>
```

Use `defer` to prevent render blocking.

## How It Works

ReadTime operates in two modes:

1. **Container Mode** — Context defined by DOM hierarchy.
2. **Context Mode** — Context defined manually via shared key.

## Container Mode

Creates an internal relationship between content and time elements using DOM hierarchy.

### Basic Example

```html
<div data-readtime="container">
  <article data-readtime="content">
    <p>Your article content here...</p>
  </article>

  <span data-readtime="time"></span>
</div>
```

### Behavior

- All `data-readtime="content"` elements inside the container are summed.
- Only the **first** `data-readtime="time"` inside the container is updated.
- Default WPM: 200.
- If total words = 0 → result = 0.

### Multiple Content Blocks

```html
<div data-readtime="container">
  <section data-readtime="content">Intro text...</section>
  <section data-readtime="content">Main content...</section>

  <span data-readtime="time"></span>
</div>
```

All content blocks are summed.

### Custom WPM

```html
<div data-readtime="container">
  <article data-readtime="content" data-readtime-wpm="180">
    Technical content...
  </article>

  <span data-readtime="time"></span>
</div>
```

### Rule

If multiple content elements exist, the **lowest WPM found** is used (conservative calculation).

### Ignoring Content

```html
<article data-readtime="content">
  <p>Main text...</p>

  <div data-readtime-ignore>
    <p>This block is ignored.</p>
  </div>
</article>
```

Any descendant with `data-readtime-ignore` is completely excluded from word counting.

## Context Mode

Allows linking content and time elements outside a container using a shared key.

### Basic Example

```html
<span data-readtime="time" data-readtime-context="post-1"></span>

<article data-readtime="content" data-readtime-context="post-1">
  Content here...
</article>
```

#### Behavior

- All content elements with the same `data-readtime-context` value are summed.
- All matching time elements are updated.
- Context value must be a literal string (not a selector).

### Multiple Contents + Multiple Times

```html
<span data-readtime="time" data-readtime-context="article-A"></span>
<span data-readtime="time" data-readtime-context="article-A"></span>

<section data-readtime="content" data-readtime-context="article-A">
  Section 1...
</section>

<section data-readtime="content" data-readtime-context="article-A">
  Section 2...
</section>
```

All content sections are summed.  
All time elements are updated.

## Attribute Reference

| Attribute | Applies To | Required | Description |
|------------|------------|----------|-------------|
| `data-readtime="container"` | Any element | Optional | Defines DOM-scoped context |
| `data-readtime="content"` | Any element | Required (per group) | Source text for calculation |
| `data-readtime="time"` | Any element | Required (per group) | Where result is injected |
| `data-readtime-context="NAME"` | content + time | Optional | Manual context binding (outside container) |
| `data-readtime-wpm="number"` | content | Optional | Words per minute override |
| `data-readtime-ignore` | Descendants of content | Optional | Excludes subtree from count |

## Calculation Rules

| Rule | Behavior |
|------|----------|
| Default WPM | 200 |
| Multiple WPMs | Uses lowest value |
| Words = 0 | Result = 0 |
| Container mode | Updates only first `time` |
| Context mode | Updates all matching `time` elements |
| Ignore blocks | Entire subtree removed |

## Public API

ReadTime exposes a minimal API for dynamic environments.

### Recalculate manually

```js
ReadTime.refresh();
```

Use after:
- CMS injection
- Tab switches
- Lazy-loaded content
- Dynamic rendering

### Enable Mutation Observer

```js
ReadTime.observe();
```

Automatically recalculates when DOM changes.

Disable:

```js
ReadTime.disconnect();
```

## Performance Notes

ReadTime is designed to:

- Avoid global namespace pollution
- Work with deferred loading
- Minimize DOM reads
- Avoid layout thrashing
- Keep observers opt-in only

Best practices:

- Always use `defer`
- Avoid enabling observer unless necessary
- Prefer Container Mode when possible

## Browser Support

Modern browsers (ES2018+).

## Versioning

Follows Semantic Versioning:

```
MAJOR.MINOR.PATCH
```

Example:

```
v0.1.0
```

## License

MIT
