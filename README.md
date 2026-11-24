# fluent-dom

A light, fluent, jQuery-like API to **create, get and set DOM elements**.

```js
import { $ } from 'fluent-dom'

const $form = $.el('form').html(`
  <input ref="email" type="email">
  <button ref="submit" type="submit">Save</button>
`).appendTo('#app')

const refs = $form.refs()
refs.submit.on('click', () => save(refs.email.val()))
```

## Why

- **Light.** One file, no dependencies. Minified bundle: ~10.5 KB raw,
  ~3.3 KB gzip.
- **No XSS by construction.** Strings are text everywhere (`.text()`,
  string children, `.append(str)`). The only string → markup sink is
  `.html()`, reserved for developer-authored markup. `on*` attributes
  and `srcdoc` cannot be set through `.attr()`, and URL attributes
  reject `javascript:` and `data:text/html` values.
- **No HTTP.** Native `fetch` is enough. No ajax, no deferreds, no
  animations, no reactivity: state lives in your objects, rendering is
  your functions.
- **Fully typed.** Plain JavaScript with JSDoc types that `tsc` checks
  (`npm run types`); the `.d.ts` is generated from the source.

## The three pieces

1. **`$`** selects or wraps elements. Setters apply to all elements and
   chain; getters read the first; an empty wrapper is always safe.
2. **`$.el(tag, props?, ...children)`** creates elements structurally —
   it never parses an HTML string. Reserved props: `text`, `class`,
   `html` (trusted only), `style`, `dataset`, `on`, `ref`, `value`;
   every other prop is an attribute.
3. **`$.events(obj)`** turns a plain object into an emitter
   (`on` / `once` / `off` / `emit`), listeners kept in a `WeakMap`
   outside the object. The store recipe for larger interfaces.

Plus **`refs()`** on any wrapper: a snapshot object mapping `ref`
attribute values to single-element wrappers.

## Documentation

[GUIDE.md](GUIDE.md) — building interfaces with the library, from
enhancing a server-rendered page to a complete single-page application
(components, stores, routing, teardown), with the full API reference.

## Install

Copy `dist/fluent-dom.min.js` into your project and import it, or:

```sh
npm install github:JoeLanglois/fluent-dom
```

(the `prepare` script rebuilds types and bundles on install).

Flavours in `dist/`:

| File | Use |
| --- | --- |
| `fluent-dom.esm.js` | npm entry point (ES module, minified) |
| `fluent-dom.min.js` | copy-paste / `<script>` (IIFE, global `FluentDom`) |
| `fluent-dom.js` | readable IIFE, for debugging |
| `fluent-dom.d.ts` | generated type declarations |

## Develop

```sh
npm install
npm test        # node:test + jsdom, 36 tests
npm run types   # tsc checkJs on the source + generate dist/fluent-dom.d.ts
npm run build   # esbuild bundles into dist/, prints raw/gzip/brotli sizes
```

Source is a single file: `src/fluent-dom.js`.

## License

MIT
