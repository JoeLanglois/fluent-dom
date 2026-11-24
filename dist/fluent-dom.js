"use strict";
var FluentDom = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/fluent-dom.js
  var fluent_dom_exports = {};
  __export(fluent_dom_exports, {
    $: () => $,
    Wrapper: () => Wrapper,
    default: () => fluent_dom_default
  });
  function isPlainObject(value) {
    if (typeof value !== "object" || value === null) return false;
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
  }
  function kebab(name) {
    return name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
  }
  function camel(name) {
    return name.replace(/-([a-z])/g, (_m, c) => c.toUpperCase());
  }
  function classTokens(names) {
    const list = Array.isArray(names) ? names : [names];
    return list.flatMap((n) => String(n).split(/\s+/)).filter(Boolean);
  }
  function collectNodes(content, out = []) {
    if (content === null || content === void 0 || content === false) return out;
    if (Array.isArray(content)) {
      for (const item of content) collectNodes(item, out);
      return out;
    }
    if (content instanceof Wrapper) {
      out.push(...content.toArray());
      return out;
    }
    if (typeof content === "string" || typeof content === "number") {
      out.push(document.createTextNode(String(content)));
      return out;
    }
    out.push(content);
    return out;
  }
  function materialize(content, clone) {
    const nodes = collectNodes(content);
    return clone ? nodes.map((n) => n.cloneNode(true)) : nodes;
  }
  var URL_ATTRS = /* @__PURE__ */ new Set(["href", "src", "action", "formaction", "xlink:href"]);
  function setAttrSafe(el, name, value) {
    const lower = name.toLowerCase();
    if (value === false || value === null || value === void 0) {
      el.removeAttribute(name);
      return;
    }
    if (lower.startsWith("on") || lower === "srcdoc") {
      throw new TypeError(`fluent-dom: refusing to set attribute "${name}" (use .on() for events)`);
    }
    const text = value === true ? "" : String(value);
    if (URL_ATTRS.has(lower)) {
      const scheme = text.replace(/^[\s\u0000-\u0020]+/, "").toLowerCase();
      if (scheme.startsWith("javascript:") || scheme.startsWith("data:text/html")) {
        throw new TypeError(`fluent-dom: refusing dangerous URL in attribute "${name}"`);
      }
    }
    el.setAttribute(name, text);
  }
  var domListeners = /* @__PURE__ */ new WeakMap();
  function addDomListener(el, name, handler, selector, once) {
    const record = {
      original: handler,
      selector,
      once,
      wrapped: (event) => {
        if (selector !== void 0) {
          const target = event.target;
          const matched = target instanceof Element ? target.closest(selector) : null;
          if (matched === null || !el.contains(matched)) return;
          if (once) removeDomListener(el, name, record);
          handler.call(matched, event);
          return;
        }
        if (once) removeDomListener(el, name, record);
        handler.call(el, event);
      }
    };
    el.addEventListener(name, record.wrapped);
    let byName = domListeners.get(el);
    if (byName === void 0) {
      byName = /* @__PURE__ */ new Map();
      domListeners.set(el, byName);
    }
    let records = byName.get(name);
    if (records === void 0) {
      records = /* @__PURE__ */ new Set();
      byName.set(name, records);
    }
    records.add(record);
  }
  function removeDomListener(el, name, record) {
    el.removeEventListener(name, record.wrapped);
    domListeners.get(el)?.get(name)?.delete(record);
  }
  function removeDomListeners(el, name, handler) {
    const byName = domListeners.get(el);
    if (byName === void 0) return;
    const names = name === void 0 ? [...byName.keys()] : [name];
    for (const n of names) {
      const records = byName.get(n);
      if (records === void 0) continue;
      for (const record of [...records]) {
        if (handler === void 0 || record.original === handler) {
          removeDomListener(el, n, record);
        }
      }
    }
  }
  var Wrapper = class _Wrapper {
    /**
     * @param {Element[]} elements
     */
    constructor(elements) {
      this._elements = elements;
      for (let i = 0; i < elements.length; i++) {
        Object.defineProperty(this, i, { value: elements[i], enumerable: true });
      }
    }
    /** @returns {number} */
    get length() {
      return this._elements.length;
    }
    /** The first raw element, or undefined for an empty wrapper. @returns {Element | undefined} */
    get el() {
      return this._elements[0];
    }
    /** @returns {Iterator<Element>} */
    [Symbol.iterator]() {
      return this._elements[Symbol.iterator]();
    }
    /**
     * @overload
     * @returns {Element[]}
     */
    /**
     * @overload
     * @param {number} index
     * @returns {Element | undefined}
     */
    /**
     * @param {number} [index]
     * @returns {Element[] | Element | undefined}
     */
    get(index) {
      if (index === void 0) return this.toArray();
      const i = index < 0 ? this._elements.length + index : index;
      return this._elements[i];
    }
    /** @returns {Element[]} A copy of the wrapped elements. */
    toArray() {
      return [...this._elements];
    }
    /**
     * Call fn(element, index) with `this` bound to the element for each
     * element; returning false stops the iteration.
     * @param {(this: Element, element: Element, index: number) => void | false} fn
     * @returns {Wrapper}
     */
    each(fn) {
      for (let i = 0; i < this._elements.length; i++) {
        const el = this._elements[i];
        if (fn.call(el, el, i) === false) break;
      }
      return this;
    }
    /**
     * Map each element to a value; returns a plain array (not a wrapper).
     * @template T
     * @param {(this: Element, element: Element, index: number) => T} fn
     * @returns {T[]}
     */
    map(fn) {
      return this._elements.map((el, i) => fn.call(el, el, i));
    }
    // -- Get / set -------------------------------------------------------------
    // Convention: no value argument → getter (first element); a value
    // argument → setter (all elements, returns the wrapper).
    /**
     * @overload
     * @returns {string | undefined}
     */
    /**
     * @overload
     * @param {string} value
     * @returns {Wrapper}
     */
    /**
     * @param {string} [value]
     * @returns {string | undefined | Wrapper}
     */
    text(value) {
      if (value === void 0) return this.el?.textContent ?? void 0;
      for (const el of this._elements) el.textContent = String(value);
      return this;
    }
    /**
     * The one string → markup sink. Developer-authored markup only; never
     * feed user data to it.
     * @overload
     * @returns {string | undefined}
     */
    /**
     * @overload
     * @param {string} value
     * @returns {Wrapper}
     */
    /**
     * @param {string} [value]
     * @returns {string | undefined | Wrapper}
     */
    html(value) {
      if (value === void 0) return this.el?.innerHTML;
      for (const el of this._elements) el.innerHTML = String(value);
      return this;
    }
    /**
     * Form values. For a multiple select, the getter returns an array of
     * the selected values and the setter takes an array.
     * @overload
     * @returns {string | string[] | undefined}
     */
    /**
     * @overload
     * @param {string | string[]} value
     * @returns {Wrapper}
     */
    /**
     * @param {string | string[]} [value]
     * @returns {string | string[] | undefined | Wrapper}
     */
    val(value) {
      const first = this.el;
      if (value === void 0) {
        if (first === void 0) return void 0;
        if (first instanceof HTMLSelectElement && first.multiple) {
          return [...first.selectedOptions].map((o) => o.value);
        }
        return (
          /** @type {{ value?: unknown }} */
          /** @type {unknown} */
          first.value === void 0 ? void 0 : String(
            /** @type {{ value: unknown }} */
            /** @type {unknown} */
            first.value
          )
        );
      }
      for (const el of this._elements) {
        if (el instanceof HTMLSelectElement && el.multiple && Array.isArray(value)) {
          for (const option of el.options) option.selected = value.includes(option.value);
        } else {
          /** @type {unknown} */
          el.value = Array.isArray(value) ? value[0] ?? "" : value;
        }
      }
      return this;
    }
    /**
     * @overload
     * @param {string} name
     * @returns {string | undefined}
     */
    /**
     * @overload
     * @param {string} name
     * @param {string | number | boolean | null} value
     * @returns {Wrapper}
     */
    /**
     * @overload
     * @param {Object<string, string | number | boolean | null>} values
     * @returns {Wrapper}
     */
    /**
     * @param {string | Object<string, string | number | boolean | null>} name
     * @param {string | number | boolean | null} [value]
     * @returns {string | undefined | Wrapper}
     */
    attr(name, value) {
      if (typeof name === "object") {
        for (const [k, v] of Object.entries(name)) this.attr(k, v);
        return this;
      }
      if (value === void 0) {
        const got = this.el?.getAttribute(name);
        return got === null || got === void 0 ? void 0 : got;
      }
      for (const el of this._elements) setAttrSafe(el, name, value);
      return this;
    }
    /**
     * @param {string} name
     * @returns {Wrapper}
     */
    removeAttr(name) {
      for (const el of this._elements) el.removeAttribute(name);
      return this;
    }
    /**
     * Direct property access (checked, disabled, hidden, value, …).
     * @overload
     * @param {string} name
     * @returns {unknown}
     */
    /**
     * @overload
     * @param {string} name
     * @param {unknown} value
     * @returns {Wrapper}
     */
    /**
     * @param {string} name
     * @param {unknown} [value]
     * @returns {unknown}
     */
    prop(name, value) {
      if (value === void 0) {
        return this.el === void 0 ? void 0 : (
          /** @type {Object<string, unknown>} */
          /** @type {unknown} */
          this.el[name]
        );
      }
      for (const el of this._elements) {
        /** @type {unknown} */
        el[name] = value;
      }
      return this;
    }
    /**
     * CSS: the getter reads the computed style of the first element; the
     * setter writes inline style on all elements. Names may be camelCase
     * or kebab-case.
     * @overload
     * @param {string} name
     * @returns {string | undefined}
     */
    /**
     * @overload
     * @param {string} name
     * @param {string | number} value
     * @returns {Wrapper}
     */
    /**
     * @overload
     * @param {Object<string, string | number>} values
     * @returns {Wrapper}
     */
    /**
     * @param {string | Object<string, string | number>} name
     * @param {string | number} [value]
     * @returns {string | undefined | Wrapper}
     */
    css(name, value) {
      if (typeof name === "object") {
        for (const [k, v] of Object.entries(name)) this.css(k, v);
        return this;
      }
      const property = kebab(name);
      if (value === void 0) {
        if (this.el === void 0) return void 0;
        return getComputedStyle(this.el).getPropertyValue(property);
      }
      for (const el of this._elements) {
        if (el instanceof HTMLElement || el instanceof SVGElement) {
          el.style.setProperty(property, String(value));
        }
      }
      return this;
    }
    /**
     * dataset access: names are the dataset keys (camelCase), values are
     * strings. data() with no arguments returns a copy of the dataset.
     * @overload
     * @returns {Object<string, string> | undefined}
     */
    /**
     * @overload
     * @param {string} name
     * @returns {string | undefined}
     */
    /**
     * @overload
     * @param {string} name
     * @param {string | number | null} value
     * @returns {Wrapper}
     */
    /**
     * @overload
     * @param {Object<string, string | number>} values
     * @returns {Wrapper}
     */
    /**
     * @param {string | Object<string, string | number>} [name]
     * @param {string | number | null} [value]
     * @returns {Object<string, string> | string | undefined | Wrapper}
     */
    data(name, value) {
      if (name === void 0) {
        return this.el instanceof HTMLElement || this.el instanceof SVGElement ? (
          /** @type {Object<string, string>} */
          { ...this.el.dataset }
        ) : void 0;
      }
      if (typeof name === "object") {
        for (const [k, v] of Object.entries(name)) this.data(k, v);
        return this;
      }
      const key = camel(name);
      if (value === void 0) {
        return this.el instanceof HTMLElement || this.el instanceof SVGElement ? this.el.dataset[key] : void 0;
      }
      for (const el of this._elements) {
        if (el instanceof HTMLElement || el instanceof SVGElement) {
          if (value === null) delete el.dataset[key];
          else el.dataset[key] = String(value);
        }
      }
      return this;
    }
    /**
     * @param {string | string[]} names
     * @returns {Wrapper}
     */
    addClass(names) {
      const tokens = classTokens(names);
      for (const el of this._elements) el.classList.add(...tokens);
      return this;
    }
    /**
     * @param {string | string[]} names
     * @returns {Wrapper}
     */
    removeClass(names) {
      const tokens = classTokens(names);
      for (const el of this._elements) el.classList.remove(...tokens);
      return this;
    }
    /**
     * @param {string | string[]} names
     * @param {boolean} [force]
     * @returns {Wrapper}
     */
    toggleClass(names, force) {
      const tokens = classTokens(names);
      for (const el of this._elements) {
        for (const token of tokens) el.classList.toggle(token, force);
      }
      return this;
    }
    /**
     * @param {string} name
     * @returns {boolean}
     */
    hasClass(name) {
      return this.el?.classList.contains(name) ?? false;
    }
    // -- Traversal -------------------------------------------------------------
    /**
     * Descendants of each element matching a selector (deduplicated).
     * @param {string} selector
     * @returns {Wrapper}
     */
    find(selector) {
      const out = /* @__PURE__ */ new Set();
      for (const el of this._elements) {
        for (const found of el.querySelectorAll(selector)) out.add(found);
      }
      return new _Wrapper([...out]);
    }
    /**
     * The nearest ancestor (or the element itself) matching a selector,
     * per element, deduplicated.
     * @param {string} selector
     * @returns {Wrapper}
     */
    closest(selector) {
      const out = /* @__PURE__ */ new Set();
      for (const el of this._elements) {
        const found = el.closest(selector);
        if (found !== null) out.add(found);
      }
      return new _Wrapper([...out]);
    }
    /**
     * @param {string} [selector]  When given, parents not matching it are dropped.
     * @returns {Wrapper}
     */
    parent(selector) {
      const out = /* @__PURE__ */ new Set();
      for (const el of this._elements) {
        const p = el.parentElement;
        if (p !== null && (selector === void 0 || p.matches(selector))) out.add(p);
      }
      return new _Wrapper([...out]);
    }
    /**
     * All ancestors, nearest first per element, deduplicated.
     * @param {string} [selector]
     * @returns {Wrapper}
     */
    parents(selector) {
      const out = /* @__PURE__ */ new Set();
      for (const el of this._elements) {
        let p = el.parentElement;
        while (p !== null) {
          if (selector === void 0 || p.matches(selector)) out.add(p);
          p = p.parentElement;
        }
      }
      return new _Wrapper([...out]);
    }
    /**
     * @param {string} [selector]
     * @returns {Wrapper}
     */
    children(selector) {
      const out = [];
      for (const el of this._elements) {
        for (const child of el.children) {
          if (selector === void 0 || child.matches(selector)) out.push(child);
        }
      }
      return new _Wrapper(out);
    }
    /**
     * @param {string} [selector]
     * @returns {Wrapper}
     */
    siblings(selector) {
      const out = /* @__PURE__ */ new Set();
      for (const el of this._elements) {
        const p = el.parentElement;
        if (p === null) continue;
        for (const sib of p.children) {
          if (sib !== el && (selector === void 0 || sib.matches(selector))) out.add(sib);
        }
      }
      return new _Wrapper([...out]);
    }
    /**
     * The next element sibling; with a selector, only when it matches.
     * @param {string} [selector]
     * @returns {Wrapper}
     */
    next(selector) {
      const out = [];
      for (const el of this._elements) {
        const n = el.nextElementSibling;
        if (n !== null && (selector === void 0 || n.matches(selector))) out.push(n);
      }
      return new _Wrapper(out);
    }
    /**
     * The previous element sibling; with a selector, only when it matches.
     * @param {string} [selector]
     * @returns {Wrapper}
     */
    prev(selector) {
      const out = [];
      for (const el of this._elements) {
        const n = el.previousElementSibling;
        if (n !== null && (selector === void 0 || n.matches(selector))) out.push(n);
      }
      return new _Wrapper(out);
    }
    /**
     * Keep elements matching a selector, or for which fn returns true.
     * @param {string | ((this: Element, element: Element, index: number) => boolean)} selector
     * @returns {Wrapper}
     */
    filter(selector) {
      if (typeof selector === "function") {
        return new _Wrapper(this._elements.filter((el, i) => selector.call(el, el, i)));
      }
      return new _Wrapper(this._elements.filter((el) => el.matches(selector)));
    }
    /**
     * Drop elements matching a selector, or for which fn returns true.
     * @param {string | ((this: Element, element: Element, index: number) => boolean)} selector
     * @returns {Wrapper}
     */
    not(selector) {
      if (typeof selector === "function") {
        return new _Wrapper(this._elements.filter((el, i) => !selector.call(el, el, i)));
      }
      return new _Wrapper(this._elements.filter((el) => !el.matches(selector)));
    }
    /**
     * One element by index (negative counts from the end), as a wrapper.
     * @param {number} index
     * @returns {Wrapper}
     */
    eq(index) {
      const el = this.get(index);
      return new _Wrapper(el === void 0 ? [] : [el]);
    }
    /** @returns {Wrapper} */
    first() {
      return this.eq(0);
    }
    /** @returns {Wrapper} */
    last() {
      return this.eq(-1);
    }
    /**
     * @param {number} [start]
     * @param {number} [end]
     * @returns {Wrapper}
     */
    slice(start, end) {
      return new _Wrapper(this._elements.slice(start, end));
    }
    // -- Manipulation ----------------------------------------------------------
    /**
     * Run an insertion against every element, materialising content per
     * target (originals land in the last target, clones in the others).
     * @param {Content} content
     * @param {(el: Element, nodes: Node[]) => void} insert
     * @returns {Wrapper}
     */
    _insertEach(content, insert) {
      const last = this._elements.length - 1;
      this._elements.forEach((el, i) => insert(el, materialize(content, i < last)));
      return this;
    }
    /**
     * Append content (strings become text nodes, never markup).
     * @param {...Content} content
     * @returns {Wrapper}
     */
    append(...content) {
      return this._insertEach(content, (el, nodes) => el.append(...nodes));
    }
    /**
     * @param {...Content} content
     * @returns {Wrapper}
     */
    prepend(...content) {
      return this._insertEach(content, (el, nodes) => el.prepend(...nodes));
    }
    /**
     * Insert content just before each element.
     * @param {...Content} content
     * @returns {Wrapper}
     */
    before(...content) {
      return this._insertEach(content, (el, nodes) => {
        const parent = el.parentNode;
        if (parent === null) return;
        for (const node of nodes) parent.insertBefore(node, el);
      });
    }
    /**
     * Insert content just after each element.
     * @param {...Content} content
     * @returns {Wrapper}
     */
    after(...content) {
      return this._insertEach(content, (el, nodes) => {
        const parent = el.parentNode;
        if (parent === null) return;
        let ref = el.nextSibling;
        for (const node of nodes) {
          parent.insertBefore(node, ref);
        }
      });
    }
    /**
     * Replace each element with content.
     * @param {...Content} content
     * @returns {Wrapper}
     */
    replaceWith(...content) {
      return this._insertEach(content, (el, nodes) => el.replaceWith(...nodes));
    }
    /**
     * Append this wrapper's elements to a target (selector, element or
     * wrapper) and return this wrapper.
     * @param {string | Element | Wrapper} target
     * @returns {Wrapper}
     */
    appendTo(target) {
      $(
        /** @type {any} */
        target
      ).append(this);
      return this;
    }
    /**
     * Prepend this wrapper's elements to a target and return this wrapper.
     * @param {string | Element | Wrapper} target
     * @returns {Wrapper}
     */
    prependTo(target) {
      $(
        /** @type {any} */
        target
      ).prepend(this);
      return this;
    }
    /** Detach each element from its parent. @returns {Wrapper} */
    remove() {
      for (const el of this._elements) el.remove();
      return this;
    }
    /** Remove all children of each element, keeping the elements. @returns {Wrapper} */
    empty() {
      for (const el of this._elements) el.replaceChildren();
      return this;
    }
    /** Deep clones of the wrapped elements, as a new wrapper. @returns {Wrapper} */
    clone() {
      return new _Wrapper(
        this._elements.map((el) => (
          /** @type {Element} */
          el.cloneNode(true)
        ))
      );
    }
    // -- Events ----------------------------------------------------------------
    /**
     * @param {string} name
     * @param {string | DomHandler} selectorOrHandler
     * @param {DomHandler | undefined} handler
     * @param {boolean} once
     * @returns {Wrapper}
     */
    _addListener(name, selectorOrHandler, handler, once) {
      const selector = typeof selectorOrHandler === "string" ? selectorOrHandler : void 0;
      const fn = typeof selectorOrHandler === "string" ? handler : selectorOrHandler;
      if (fn === void 0) return this;
      for (const el of this._elements) addDomListener(el, name, fn, selector, once);
      return this;
    }
    /**
     * Attach handlers. Forms: on(name, handler), on(name, selector,
     * handler) for delegation, and on({ name: handler, ... }) for several
     * events at once. Inside a handler, `this` is the element (for
     * delegation, the matched descendant) and the argument is the native
     * event.
     * @overload
     * @param {DomEventMap} events
     * @returns {Wrapper}
     */
    /**
     * @overload
     * @param {string} name
     * @param {DomHandler} handler
     * @returns {Wrapper}
     */
    /**
     * @overload
     * @param {string} name
     * @param {string} selector
     * @param {DomHandler} handler
     * @returns {Wrapper}
     */
    /**
     * @param {string | DomEventMap} name
     * @param {string | DomHandler} [selectorOrHandler]
     * @param {DomHandler} [handler]
     * @returns {Wrapper}
     */
    on(name, selectorOrHandler, handler) {
      if (typeof name === "object") {
        for (const [k, v] of Object.entries(name)) this._addListener(k, v, void 0, false);
        return this;
      }
      return this._addListener(name, selectorOrHandler ?? (() => {
      }), handler, false);
    }
    /**
     * Like on(), but each handler runs at most once per element.
     * @overload
     * @param {string} name
     * @param {DomHandler} handler
     * @returns {Wrapper}
     */
    /**
     * @overload
     * @param {string} name
     * @param {string} selector
     * @param {DomHandler} handler
     * @returns {Wrapper}
     */
    /**
     * @param {string} name
     * @param {string | DomHandler} [selectorOrHandler]
     * @param {DomHandler} [handler]
     * @returns {Wrapper}
     */
    one(name, selectorOrHandler, handler) {
      return this._addListener(name, selectorOrHandler ?? (() => {
      }), handler, true);
    }
    /**
     * Remove handlers added through this wrapper: off() removes all of
     * them, off(name) all for one event, off(name, handler) one handler.
     * Listeners added with raw addEventListener are not affected.
     * @param {string} [name]
     * @param {DomHandler} [handler]
     * @returns {Wrapper}
     */
    off(name, handler) {
      for (const el of this._elements) removeDomListeners(el, name, handler);
      return this;
    }
    // -- Refs ------------------------------------------------------------------
    /**
     * Snapshot of the named parts of this subtree: an object with no
     * prototype whose keys are the values of `ref` attributes (on the
     * wrapped elements themselves and their descendants) and whose values
     * are single-element wrappers. If a ref name appears twice, the last
     * element in document order wins.
     *
     * With a handlers object, each handler is called with the wrapper for
     * its ref name, so parts can be configured inline, and the refs object
     * is still returned:
     *
     *   $form.refs({
     *     label:  (l) => l.text('Click Me'),
     *     submit: (b) => b.on('click', save),
     *   })
     *
     * A handler for a ref that does not exist is still called, with an
     * empty wrapper (whose setters no-op, like any empty wrapper). A
     * handler value that is not a function throws a TypeError.
     * @overload
     * @returns {Object<string, Wrapper>}
     */
    /**
     * @overload
     * @param {RefHandlers} handlers
     * @returns {Object<string, Wrapper>}
     */
    /**
     * @param {RefHandlers} [handlers]
     * @returns {Object<string, Wrapper>}
     */
    refs(handlers) {
      const out = /* @__PURE__ */ Object.create(null);
      for (const root of this._elements) {
        if (root.hasAttribute("ref")) {
          out[root.getAttribute("ref") ?? ""] = new _Wrapper([root]);
        }
        for (const found of root.querySelectorAll("[ref]")) {
          out[found.getAttribute("ref") ?? ""] = new _Wrapper([found]);
        }
      }
      if (handlers !== void 0) {
        if (!isPlainObject(handlers)) {
          throw new TypeError("fluent-dom: refs() expects an object of ref handlers");
        }
        for (const [name, handler] of Object.entries(handlers)) {
          if (typeof handler !== "function") {
            throw new TypeError(`fluent-dom: refs() handler for "${name}" is not a function`);
          }
          const wrapper = out[name] ?? new _Wrapper([]);
          handler.call(wrapper, wrapper, name);
        }
      }
      return out;
    }
  };
  var RESERVED_PROPS = /* @__PURE__ */ new Set([
    "text",
    "class",
    "html",
    "style",
    "dataset",
    "data",
    "on",
    "ref",
    "value"
  ]);
  function createEl(tag, ...args) {
    let props = {};
    let children = (
      /** @type {Content[]} */
      /** @type {unknown} */
      args
    );
    const first = args[0];
    if (isPlainObject(first)) {
      props = /** @type {ElProps} */
      first;
      children = /** @type {Content[]} */
      /** @type {unknown} */
      args.slice(1);
    }
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
      if (RESERVED_PROPS.has(key)) continue;
      setAttrSafe(el, key, value);
    }
    if (typeof props.class === "string" || Array.isArray(props.class)) {
      el.classList.add(...classTokens(
        /** @type {string | string[]} */
        props.class
      ));
    }
    const datasetRaw = isPlainObject(props.dataset) ? props.dataset : props.data;
    if (isPlainObject(datasetRaw) && "dataset" in el) {
      const dataset = (
        /** @type {Object<string, unknown>} */
        datasetRaw
      );
      const target = (
        /** @type {HTMLElement} */
        /** @type {unknown} */
        el
      );
      for (const [k, v] of Object.entries(dataset)) {
        target.dataset[camel(k)] = String(v);
      }
    }
    if (isPlainObject(props.style) && "style" in el) {
      const style = (
        /** @type {Object<string, unknown>} */
        props.style
      );
      const target = (
        /** @type {HTMLElement} */
        /** @type {unknown} */
        el
      );
      for (const [k, v] of Object.entries(style)) {
        target.style.setProperty(kebab(k), String(v));
      }
    } else if (typeof props.style === "string" && "style" in el) {
      /** @type {unknown} */
      el.style.cssText = props.style;
    }
    if (typeof props.ref === "string") el.setAttribute("ref", props.ref);
    const $el = new Wrapper([el]);
    if (props.text !== void 0) el.textContent = String(props.text);
    if (props.html !== void 0) el.innerHTML = String(props.html);
    if (children.length > 0) $el.append(...children);
    if (isPlainObject(props.on)) {
      $el.on(
        /** @type {DomEventMap} */
        props.on
      );
    }
    if (props.value !== void 0) {
      /** @type {unknown} */
      el.value = props.value;
    }
    return $el;
  }
  var emitterStore = /* @__PURE__ */ new WeakMap();
  function makeEvents(obj = (
    /** @type {T} */
    /** @type {unknown} */
    {}
  )) {
    const target = (
      /** @type {Object<string, unknown>} */
      /** @type {unknown} */
      obj
    );
    if (!emitterStore.has(target)) {
      const byName = /* @__PURE__ */ new Map();
      emitterStore.set(target, byName);
      const add = (name, handler, once) => {
        let records = byName.get(name);
        if (records === void 0) {
          records = /* @__PURE__ */ new Set();
          byName.set(name, records);
        }
        for (const record2 of records) {
          if (record2.original === handler && record2.once === once) return obj;
        }
        const record = {
          original: handler,
          once,
          fn: (...args) => {
            if (once) records.delete(record);
            handler.apply(obj, args);
          }
        };
        records.add(record);
        return obj;
      };
      const off = (name, handler) => {
        if (name === void 0) {
          byName.clear();
          return obj;
        }
        const records = byName.get(name);
        if (records === void 0) return obj;
        if (handler === void 0) {
          byName.delete(name);
          return obj;
        }
        for (const record of [...records]) {
          if (record.original === handler) records.delete(record);
        }
        return obj;
      };
      Object.defineProperties(target, {
        on: {
          configurable: true,
          writable: true,
          /**
           * @param {string | EmitterEventMap} name
           * @param {EmitterHandler} [handler]
           * @returns {object}
           */
          value(name, handler) {
            if (typeof name === "object") {
              for (const [k, v] of Object.entries(name)) add(k, v, false);
              return obj;
            }
            if (handler !== void 0) add(name, handler, false);
            return obj;
          }
        },
        once: {
          configurable: true,
          writable: true,
          /**
           * @param {string} name
           * @param {EmitterHandler} handler
           * @returns {object}
           */
          value(name, handler) {
            add(name, handler, true);
            return obj;
          }
        },
        off: { configurable: true, writable: true, value: off },
        emit: {
          configurable: true,
          writable: true,
          /**
           * @param {string} name
           * @param {any[]} args
           * @returns {object}
           */
          value(name, ...args) {
            const records = byName.get(name);
            if (records !== void 0) {
              for (const record of [...records]) record.fn(...args);
            }
            return obj;
          }
        }
      });
    }
    return (
      /** @type {T & Emitter} */
      /** @type {unknown} */
      obj
    );
  }
  function $(input, root) {
    if (input === null || input === void 0) return new Wrapper([]);
    if (input instanceof Wrapper) return input;
    if (typeof input === "string") {
      let scope = document;
      if (root instanceof Wrapper) {
        if (root.el === void 0) return new Wrapper([]);
        scope = root.el;
      } else if (root !== void 0) {
        scope = root;
      }
      return new Wrapper([...scope.querySelectorAll(input)]);
    }
    if (input instanceof Node) {
      if (input.nodeType === 9) {
        const docEl = (
          /** @type {Document} */
          input.documentElement
        );
        return new Wrapper(docEl === null ? [] : [docEl]);
      }
      return new Wrapper(input instanceof Element ? [input] : []);
    }
    if (Array.isArray(input)) {
      return new Wrapper(input.filter((n) => n instanceof Element));
    }
    if (typeof input === "object" && "length" in input) {
      return new Wrapper(
        Array.from(
          /** @type {ArrayLike<Node>} */
          input
        ).filter((n) => n instanceof Element)
      );
    }
    return new Wrapper([]);
  }
  $.el = createEl;
  $.events = makeEvents;
  $.Wrapper = Wrapper;
  var fluent_dom_default = $;
  return __toCommonJS(fluent_dom_exports);
})();
