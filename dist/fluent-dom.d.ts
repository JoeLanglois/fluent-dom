export default $;
/**
 * Anything that can be inserted as content: a string or number (becomes
 * a text node), a node, a wrapper, a (nested) array of content, or
 * null / false / undefined (skipped).
 */
export type Content = string | number | Node | Wrapper | Array<any> | null | false | undefined;
/**
 * Props accepted by `$.el`. Reserved keys: `text`, `class`, `html`
 * (trusted markup only), `style`, `dataset`, `data` (alias of dataset),
 * `on` (event map), `ref`, `value`. Every other key is set as an
 * attribute (boolean true sets an empty attribute, false / null /
 * undefined removes it).
 */
export type ElProps = {
    [x: string]: unknown;
};
export type DomHandler = (event: Event) => void;
export type DomEventMap = {
    [x: string]: DomHandler;
};
export type EmitterHandler = (...args: any[]) => void;
export type EmitterEventMap = {
    [x: string]: EmitterHandler;
};
/**
 * The emitter surface added by `$.events`.
 */
export type Emitter = {
    on: (name: string | EmitterEventMap, handler?: EmitterHandler) => any;
    once: (name: string, handler: EmitterHandler) => any;
    off: (name?: string, handler?: EmitterHandler) => any;
    emit: (name: string, ...args: any[]) => any;
};
export type ListenerRecord = {
    original: DomHandler;
    selector: string | undefined;
    once: boolean;
    wrapped: (event: Event) => void;
};
export type EmitterRecord = {
    original: EmitterHandler;
    once: boolean;
    fn: (...args: any[]) => void;
};
/**
 * Select or wrap elements.
 *
 *   $('#save')                 by selector (optionally within a root)
 *   $(element)                 wrap one element
 *   $(nodeList / array)        wrap several
 *   $(wrapper)                 returned as-is
 *   $()                        an empty wrapper
 *
 * @overload
 * @param {string} selector
 * @param {ParentNode | Wrapper} [root]
 * @returns {Wrapper}
 */
export function $(selector: string, root?: Wrapper | ParentNode | undefined): Wrapper;
/**
 * @overload
 * @param {Node | Node[] | NodeList | HTMLCollection | Wrapper | null | undefined} input
 * @returns {Wrapper}
 */
export function $(input: Node | Node[] | NodeList | HTMLCollection | Wrapper | null | undefined): Wrapper;
export namespace $ {
    export { createEl as el };
    export { makeEvents as events };
    export { Wrapper };
}
export class Wrapper {
    /**
     * @param {Element[]} elements
     */
    constructor(elements: Element[]);
    /** @type {Element[]} */
    _elements: Element[];
    /** @returns {number} */
    get length(): number;
    /** The first raw element, or undefined for an empty wrapper. @returns {Element | undefined} */
    get el(): Element | undefined;
    /**
     * @overload
     * @returns {Element[]}
     */
    get(): Element[];
    /**
     * @overload
     * @param {number} index
     * @returns {Element | undefined}
     */
    get(index: number): Element | undefined;
    /** @returns {Element[]} A copy of the wrapped elements. */
    toArray(): Element[];
    /**
     * Call fn(element, index) with `this` bound to the element for each
     * element; returning false stops the iteration.
     * @param {(this: Element, element: Element, index: number) => void | false} fn
     * @returns {Wrapper}
     */
    each(fn: (this: Element, element: Element, index: number) => void | false): Wrapper;
    /**
     * Map each element to a value; returns a plain array (not a wrapper).
     * @template T
     * @param {(this: Element, element: Element, index: number) => T} fn
     * @returns {T[]}
     */
    map<T>(fn: (this: Element, element: Element, index: number) => T): T[];
    /**
     * @overload
     * @returns {string | undefined}
     */
    text(): string | undefined;
    /**
     * @overload
     * @param {string} value
     * @returns {Wrapper}
     */
    text(value: string): Wrapper;
    /**
     * The one string → markup sink. Developer-authored markup only; never
     * feed user data to it.
     * @overload
     * @returns {string | undefined}
     */
    html(): string | undefined;
    /**
     * @overload
     * @param {string} value
     * @returns {Wrapper}
     */
    html(value: string): Wrapper;
    /**
     * Form values. For a multiple select, the getter returns an array of
     * the selected values and the setter takes an array.
     * @overload
     * @returns {string | string[] | undefined}
     */
    val(): string | string[] | undefined;
    /**
     * @overload
     * @param {string | string[]} value
     * @returns {Wrapper}
     */
    val(value: string | string[]): Wrapper;
    /**
     * @overload
     * @param {string} name
     * @returns {string | undefined}
     */
    attr(name: string): string | undefined;
    /**
     * @overload
     * @param {string} name
     * @param {string | number | boolean | null} value
     * @returns {Wrapper}
     */
    attr(name: string, value: string | number | boolean | null): Wrapper;
    /**
     * @overload
     * @param {Object<string, string | number | boolean | null>} values
     * @returns {Wrapper}
     */
    attr(values: {
        [x: string]: string | number | boolean | null;
    }): Wrapper;
    /**
     * @param {string} name
     * @returns {Wrapper}
     */
    removeAttr(name: string): Wrapper;
    /**
     * Direct property access (checked, disabled, hidden, value, …).
     * @overload
     * @param {string} name
     * @returns {unknown}
     */
    prop(name: string): unknown;
    /**
     * @overload
     * @param {string} name
     * @param {unknown} value
     * @returns {Wrapper}
     */
    prop(name: string, value: unknown): Wrapper;
    /**
     * CSS: the getter reads the computed style of the first element; the
     * setter writes inline style on all elements. Names may be camelCase
     * or kebab-case.
     * @overload
     * @param {string} name
     * @returns {string | undefined}
     */
    css(name: string): string | undefined;
    /**
     * @overload
     * @param {string} name
     * @param {string | number} value
     * @returns {Wrapper}
     */
    css(name: string, value: string | number): Wrapper;
    /**
     * @overload
     * @param {Object<string, string | number>} values
     * @returns {Wrapper}
     */
    css(values: {
        [x: string]: string | number;
    }): Wrapper;
    /**
     * dataset access: names are the dataset keys (camelCase), values are
     * strings. data() with no arguments returns a copy of the dataset.
     * @overload
     * @returns {Object<string, string> | undefined}
     */
    data(): {
        [x: string]: string;
    } | undefined;
    /**
     * @overload
     * @param {string} name
     * @returns {string | undefined}
     */
    data(name: string): string | undefined;
    /**
     * @overload
     * @param {string} name
     * @param {string | number | null} value
     * @returns {Wrapper}
     */
    data(name: string, value: string | number | null): Wrapper;
    /**
     * @overload
     * @param {Object<string, string | number>} values
     * @returns {Wrapper}
     */
    data(values: {
        [x: string]: string | number;
    }): Wrapper;
    /**
     * @param {string | string[]} names
     * @returns {Wrapper}
     */
    addClass(names: string | string[]): Wrapper;
    /**
     * @param {string | string[]} names
     * @returns {Wrapper}
     */
    removeClass(names: string | string[]): Wrapper;
    /**
     * @param {string | string[]} names
     * @param {boolean} [force]
     * @returns {Wrapper}
     */
    toggleClass(names: string | string[], force?: boolean): Wrapper;
    /**
     * @param {string} name
     * @returns {boolean}
     */
    hasClass(name: string): boolean;
    /**
     * Descendants of each element matching a selector (deduplicated).
     * @param {string} selector
     * @returns {Wrapper}
     */
    find(selector: string): Wrapper;
    /**
     * The nearest ancestor (or the element itself) matching a selector,
     * per element, deduplicated.
     * @param {string} selector
     * @returns {Wrapper}
     */
    closest(selector: string): Wrapper;
    /**
     * @param {string} [selector]  When given, parents not matching it are dropped.
     * @returns {Wrapper}
     */
    parent(selector?: string): Wrapper;
    /**
     * All ancestors, nearest first per element, deduplicated.
     * @param {string} [selector]
     * @returns {Wrapper}
     */
    parents(selector?: string): Wrapper;
    /**
     * @param {string} [selector]
     * @returns {Wrapper}
     */
    children(selector?: string): Wrapper;
    /**
     * @param {string} [selector]
     * @returns {Wrapper}
     */
    siblings(selector?: string): Wrapper;
    /**
     * The next element sibling; with a selector, only when it matches.
     * @param {string} [selector]
     * @returns {Wrapper}
     */
    next(selector?: string): Wrapper;
    /**
     * The previous element sibling; with a selector, only when it matches.
     * @param {string} [selector]
     * @returns {Wrapper}
     */
    prev(selector?: string): Wrapper;
    /**
     * Keep elements matching a selector, or for which fn returns true.
     * @param {string | ((this: Element, element: Element, index: number) => boolean)} selector
     * @returns {Wrapper}
     */
    filter(selector: string | ((this: Element, element: Element, index: number) => boolean)): Wrapper;
    /**
     * Drop elements matching a selector, or for which fn returns true.
     * @param {string | ((this: Element, element: Element, index: number) => boolean)} selector
     * @returns {Wrapper}
     */
    not(selector: string | ((this: Element, element: Element, index: number) => boolean)): Wrapper;
    /**
     * One element by index (negative counts from the end), as a wrapper.
     * @param {number} index
     * @returns {Wrapper}
     */
    eq(index: number): Wrapper;
    /** @returns {Wrapper} */
    first(): Wrapper;
    /** @returns {Wrapper} */
    last(): Wrapper;
    /**
     * @param {number} [start]
     * @param {number} [end]
     * @returns {Wrapper}
     */
    slice(start?: number, end?: number): Wrapper;
    /**
     * Run an insertion against every element, materialising content per
     * target (originals land in the last target, clones in the others).
     * @param {Content} content
     * @param {(el: Element, nodes: Node[]) => void} insert
     * @returns {Wrapper}
     */
    _insertEach(content: Content, insert: (el: Element, nodes: Node[]) => void): Wrapper;
    /**
     * Append content (strings become text nodes, never markup).
     * @param {...Content} content
     * @returns {Wrapper}
     */
    append(...content: Content[]): Wrapper;
    /**
     * @param {...Content} content
     * @returns {Wrapper}
     */
    prepend(...content: Content[]): Wrapper;
    /**
     * Insert content just before each element.
     * @param {...Content} content
     * @returns {Wrapper}
     */
    before(...content: Content[]): Wrapper;
    /**
     * Insert content just after each element.
     * @param {...Content} content
     * @returns {Wrapper}
     */
    after(...content: Content[]): Wrapper;
    /**
     * Replace each element with content.
     * @param {...Content} content
     * @returns {Wrapper}
     */
    replaceWith(...content: Content[]): Wrapper;
    /**
     * Append this wrapper's elements to a target (selector, element or
     * wrapper) and return this wrapper.
     * @param {string | Element | Wrapper} target
     * @returns {Wrapper}
     */
    appendTo(target: string | Element | Wrapper): Wrapper;
    /**
     * Prepend this wrapper's elements to a target and return this wrapper.
     * @param {string | Element | Wrapper} target
     * @returns {Wrapper}
     */
    prependTo(target: string | Element | Wrapper): Wrapper;
    /** Detach each element from its parent. @returns {Wrapper} */
    remove(): Wrapper;
    /** Remove all children of each element, keeping the elements. @returns {Wrapper} */
    empty(): Wrapper;
    /** Deep clones of the wrapped elements, as a new wrapper. @returns {Wrapper} */
    clone(): Wrapper;
    /**
     * @param {string} name
     * @param {string | DomHandler} selectorOrHandler
     * @param {DomHandler | undefined} handler
     * @param {boolean} once
     * @returns {Wrapper}
     */
    _addListener(name: string, selectorOrHandler: string | DomHandler, handler: DomHandler | undefined, once: boolean): Wrapper;
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
    on(events: DomEventMap): Wrapper;
    /**
     * @overload
     * @param {string} name
     * @param {DomHandler} handler
     * @returns {Wrapper}
     */
    on(name: string, handler: DomHandler): Wrapper;
    /**
     * @overload
     * @param {string} name
     * @param {string} selector
     * @param {DomHandler} handler
     * @returns {Wrapper}
     */
    on(name: string, selector: string, handler: DomHandler): Wrapper;
    /**
     * Like on(), but each handler runs at most once per element.
     * @overload
     * @param {string} name
     * @param {DomHandler} handler
     * @returns {Wrapper}
     */
    one(name: string, handler: DomHandler): Wrapper;
    /**
     * @overload
     * @param {string} name
     * @param {string} selector
     * @param {DomHandler} handler
     * @returns {Wrapper}
     */
    one(name: string, selector: string, handler: DomHandler): Wrapper;
    /**
     * Remove handlers added through this wrapper: off() removes all of
     * them, off(name) all for one event, off(name, handler) one handler.
     * Listeners added with raw addEventListener are not affected.
     * @param {string} [name]
     * @param {DomHandler} [handler]
     * @returns {Wrapper}
     */
    off(name?: string, handler?: DomHandler): Wrapper;
    /**
     * Snapshot of the named parts of this subtree: an object with no
     * prototype whose keys are the values of `ref` attributes (on the
     * wrapped elements themselves and their descendants) and whose values
     * are single-element wrappers. If a ref name appears twice, the last
     * element in document order wins.
     * @returns {Object<string, Wrapper>}
     */
    refs(): {
        [x: string]: Wrapper;
    };
    /** @returns {Iterator<Element>} */
    [Symbol.iterator](): Iterator<Element>;
}
/**
 * Create an element. Never parses an HTML string.
 *
 *   $.el('li', { class: 'done', 'data-id': item.id, text: item.title })
 *   $.el('ul', { class: 'items' }, items.map(i => $.el('li', { text: i })))
 *
 * Reserved props: text (textContent), class (string or array), html
 * (trusted markup only), style (object, or a cssText string), dataset /
 * data (object), on (event map), ref, value (assigned as a property,
 * after children). Every other prop is set as an attribute, with the
 * safety rules of .attr().
 * @param {string} tag
 * @param {...(ElProps | Content)} args  An optional props object first,
 *                                       then children.
 * @returns {Wrapper}
 */
declare function createEl(tag: string, ...args: (ElProps | Content)[]): Wrapper;
/**
 * Turn a plain object into an event emitter, in place, and return the
 * same object (a fresh object when called with no argument). Adds four
 * non-enumerable methods: on / once / off / emit. Listeners live in a
 * WeakMap outside the object, so they never pollute its keys or JSON,
 * the same handler registered twice for one event is stored once, and
 * everything is collected with the object.
 *
 *   const store = $.events({ count: 0 })
 *   store.on('change', (n) => { ... })
 *   store.emit('change', store.count)
 *
 * Handlers are called with `this` bound to the object and exactly the
 * arguments passed to emit. All four methods return the object.
 * @template {object} T
 * @param {T} [obj]
 * @returns {T & Emitter}
 */
declare function makeEvents<T extends object>(obj?: T): T & Emitter;
