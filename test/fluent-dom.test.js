// Unit tests for fluent-dom, run in jsdom with node:test (`npm test`).
import { test, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { $, Wrapper } from "../src/fluent-dom.js";

before(() => {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost/",
  });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.Node = dom.window.Node;
  globalThis.Element = dom.window.Element;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.SVGElement = dom.window.SVGElement;
  globalThis.HTMLSelectElement = dom.window.HTMLSelectElement;
  globalThis.getComputedStyle = dom.window.getComputedStyle;
});

beforeEach(() => {
  document.body.replaceChildren();
});

/** Set the body's (trusted, test-authored) HTML and return a wrapper for it. */
function fixture(html) {
  document.body.innerHTML = html;
  return $(document.body);
}

// -- Selection & wrapping ----------------------------------------------------

test("selects by selector, scoped by root", () => {
  fixture(`<div id="a"><span class="x">1</span></div><span class="x">2</span>`);
  assert.equal($(".x").length, 2);
  assert.equal($(".x", $("#a")).length, 1);
  assert.equal($(".x", document.querySelector("#a")).length, 1);
  assert.equal($("#a").length, 1);
});

test("wraps elements, lists, arrays, wrappers; empty is safe", () => {
  fixture(`<p class="y">a</p><p class="y">b</p>`);
  const list = document.querySelectorAll(".y");
  assert.equal($(list).length, 2);
  assert.equal($([list[0]]).length, 1);
  assert.equal($(list[0]).length, 1);
  const w = $(".y");
  assert.equal($(w), w);
  const empty = $(".nope");
  assert.equal(empty.length, 0);
  assert.equal(empty.text(), undefined);
  assert.equal(empty.attr("id"), undefined);
  assert.equal(empty.text("hi"), empty); // setter no-ops and chains
  assert.equal($().length, 0);
  assert.equal($(null).length, 0);
});

test("numeric access, .el, .get, iteration, each, map", () => {
  fixture(`<p class="y">a</p><p class="y">b</p>`);
  const w = $(".y");
  assert.equal(w[0].textContent, "a");
  assert.equal(w.el, w[0]);
  assert.equal(w.get(1).textContent, "b");
  assert.equal(w.get(-1).textContent, "b");
  assert.deepEqual(w.get().map((e) => e.textContent), ["a", "b"]);
  assert.deepEqual([...w].map((e) => e.textContent), ["a", "b"]);
  const seen = [];
  w.each(function (el, i) { seen.push([i, el.textContent, this === el]); });
  assert.deepEqual(seen, [[0, "a", true], [1, "b", true]]);
  assert.deepEqual(w.map((el) => el.textContent), ["a", "b"]);
});

// -- Get / set -----------------------------------------------------------------

test("text getter reads first, setter writes all and chains", () => {
  fixture(`<p class="y">a</p><p class="y">b</p>`);
  assert.equal($(".y").text(), "a");
  const w = $(".y");
  assert.equal(w.text("z"), w);
  assert.deepEqual($(".y").map((e) => e.textContent), ["z", "z"]);
});

test("html is the markup sink: get and set", () => {
  fixture(`<div id="d"><b>old</b></div>`);
  assert.equal($("#d").html(), "<b>old</b>");
  $("#d").html("<i>new</i>");
  assert.equal(document.querySelector("#d i").textContent, "new");
});

test("val for inputs and multiple selects", () => {
  fixture(`<input id="i" value="one">
           <select id="s" multiple>
             <option value="a" selected>A</option>
             <option value="b">B</option>
             <option value="c" selected>C</option>
           </select>`);
  assert.equal($("#i").val(), "one");
  $("#i").val("two");
  assert.equal(document.querySelector("#i").value, "two");
  assert.deepEqual($("#s").val(), ["a", "c"]);
  $("#s").val(["b"]);
  assert.deepEqual($("#s").val(), ["b"]);
});

test("attr get/set/remove, object form, booleans", () => {
  fixture(`<div id="d"></div>`);
  const w = $("#d");
  w.attr("title", "hello").attr({ "data-x": "1", hidden: true });
  assert.equal(w.attr("title"), "hello");
  assert.equal(w.el.getAttribute("data-x"), "1");
  assert.equal(w.el.hasAttribute("hidden"), true);
  w.attr("hidden", false);
  assert.equal(w.el.hasAttribute("hidden"), false);
  w.removeAttr("title");
  assert.equal(w.attr("title"), undefined);
});

test("prop reads and writes raw properties", () => {
  fixture(`<input id="c" type="checkbox">`);
  assert.equal($("#c").prop("checked"), false);
  $("#c").prop("checked", true);
  assert.equal(document.querySelector("#c").checked, true);
});

test("css setter (object, camelCase) and getter", () => {
  fixture(`<div id="d"></div>`);
  $("#d").css({ marginTop: "3px", color: "red" });
  assert.equal(document.querySelector("#d").style.getPropertyValue("margin-top"), "3px");
  assert.equal($("#d").css("margin-top"), "3px");
  $("#d").css("opacity", "0.5");
  assert.equal(document.querySelector("#d").style.getPropertyValue("opacity"), "0.5");
});

test("data maps to dataset; object form; removal with null", () => {
  fixture(`<div id="d" data-user-id="7"></div>`);
  const w = $("#d");
  assert.equal(w.data("userId"), "7");
  assert.equal(w.data("user-id"), "7");
  w.data("count", 3);
  assert.equal(w.el.getAttribute("data-count"), "3");
  w.data({ role: "admin" });
  assert.deepEqual(w.data(), { userId: "7", count: "3", role: "admin" });
  w.data("count", null);
  assert.equal(w.data("count"), undefined);
});

test("classes: add/remove/toggle/has, multi-token", () => {
  fixture(`<div id="d" class="a"></div>`);
  const w = $("#d");
  w.addClass("b c");
  assert.equal(w.hasClass("b"), true);
  assert.equal(w.hasClass("c"), true);
  w.removeClass("b");
  assert.equal(w.hasClass("b"), false);
  w.toggleClass("open");
  assert.equal(w.hasClass("open"), true);
  w.toggleClass("open", false);
  assert.equal(w.hasClass("open"), false);
  w.toggleClass("open", true).toggleClass("open", true);
  assert.equal(w.hasClass("open"), true);
});

// -- XSS rules -------------------------------------------------------------------

test("strings are text: $.el children, .text, .append never parse markup", () => {
  const payload = `<img src=x onerror="globalThis.pwned = true">`;
  const $el = $.el("div", {}, payload);
  assert.equal($el.el.children.length, 0);
  assert.equal($el.text(), payload);

  fixture(`<div id="d"></div>`);
  $("#d").append(payload);
  assert.equal($("#d").el.children.length, 0);
  assert.equal($("#d").text(), payload);
  assert.equal(globalThis.pwned, undefined);
});

test("attr refuses on* handlers, srcdoc, and dangerous URLs", () => {
  fixture(`<a id="a" href="/ok">x</a><div id="d"></div>`);
  assert.throws(() => $("#d").attr("onclick", "evil()"), TypeError);
  assert.throws(() => $("#d").attr("onClick", "evil()"), TypeError);
  assert.throws(() => $("#d").attr("srcdoc", "<p>x</p>"), TypeError);
  assert.throws(() => $("#a").attr("href", "javascript:evil()"), TypeError);
  assert.throws(() => $("#a").attr("href", "  JaVaScRiPt:evil()"), TypeError);
  assert.throws(() => $("#a").attr("href", "data:text/html,<b>x</b>"), TypeError);
  $("#a").attr("href", "https://example.com/?a=b");
  assert.equal($("#a").attr("href"), "https://example.com/?a=b");
  $("#a").attr("href", "data:image/png;base64,AAAA");
  assert.equal($("#a").attr("href"), "data:image/png;base64,AAAA");
});

test("$.el refuses dangerous props the same way", () => {
  assert.throws(() => $.el("a", { href: "javascript:evil()" }), TypeError);
  assert.throws(() => $.el("div", { onclick: "evil()" }), TypeError);
});

// -- Creation ----------------------------------------------------------------------

test("$.el declarative creation with reserved props", () => {
  let clicked = 0;
  const $btn = $.el("button", {
    class: ["primary", "big"],
    "data-id": 42,
    dataset: { userId: 9 },
    style: { marginTop: "2px" },
    text: "Save",
    ref: "save",
    on: { click: () => { clicked++; } },
  });
  assert.equal($btn.el.tagName, "BUTTON");
  assert.equal($btn.hasClass("primary"), true);
  assert.equal($btn.attr("data-id"), "42");
  assert.equal($btn.data("userId"), "9");
  assert.equal($btn.el.style.getPropertyValue("margin-top"), "2px");
  assert.equal($btn.text(), "Save");
  assert.equal($btn.attr("ref"), "save");
  $btn.el.click();
  assert.equal(clicked, 1);
});

test("$.el children: nesting, arrays, numbers, skipped values", () => {
  const $list = $.el("ul", { class: "items" },
    ["a", "b"].map((t) => $.el("li", { text: t })),
    null,
    false,
    undefined,
    $.el("li", {}, 3),
  );
  assert.equal($list.children().length, 3);
  assert.deepEqual($list.children().map((e) => e.textContent), ["a", "b", "3"]);
});

test("$.el without props, and value prop assigned as a property", () => {
  const $span = $.el("span", "hello");
  assert.equal($span.text(), "hello");
  const $input = $.el("input", { type: "text", value: "seed" });
  assert.equal($input.val(), "seed");
  assert.equal($input.el.getAttribute("value"), null);
});

test("$.el html prop builds a trusted skeleton", () => {
  const $form = $.el("form", { html: `<input ref="email" type="email">` });
  assert.equal($form.find("input").length, 1);
  assert.equal($form.find("input").attr("type"), "email");
});

// -- Traversal ------------------------------------------------------------------------

test("traversal: find, closest, parent(s), children, siblings, next, prev", () => {
  fixture(`<div id="outer"><ul id="list">
             <li class="i">1</li><li class="i done">2</li><li class="i">3</li>
           </ul></div>`);
  assert.equal($("#list").find(".i").length, 3);
  assert.equal($(".done").closest("ul").attr("id"), "list");
  assert.equal($(".done").parent().attr("id"), "list");
  assert.deepEqual($(".done").parents().map((e) => e.id || e.tagName), ["list", "outer", "BODY", "HTML"]);
  assert.deepEqual($(".done").parents("div").map((e) => e.id), ["outer"]);
  assert.equal($("#list").children().length, 3);
  assert.equal($("#list").children(".done").length, 1);
  assert.deepEqual($(".done").siblings().map((e) => e.textContent), ["1", "3"]);
  assert.equal($(".done").prev().text(), "1");
  assert.equal($(".done").next().text(), "3");
  assert.equal($(".done").next(".nope").length, 0);
});

test("filter / not / eq / first / last / slice", () => {
  fixture(`<li class="i">1</li><li class="i done">2</li><li class="i">3</li>`);
  const items = $(".i");
  assert.equal(items.filter(".done").length, 1);
  assert.equal(items.filter((el) => el.textContent !== "2").length, 2);
  assert.equal(items.not(".done").length, 2);
  assert.equal(items.eq(0).text(), "1");
  assert.equal(items.eq(-1).text(), "3");
  assert.equal(items.first().text(), "1");
  assert.equal(items.last().text(), "3");
  assert.deepEqual(items.slice(1).map((e) => e.textContent), ["2", "3"]);
});

// -- Manipulation -----------------------------------------------------------------------

test("append / prepend / before / after keep order", () => {
  fixture(`<ul id="l"><li id="m">m</li></ul>`);
  $("#l").append($.el("li", { text: "z" }));
  $("#l").prepend($.el("li", { text: "a" }));
  $("#m").before($.el("li", { text: "b1" }), $.el("li", { text: "b2" }));
  $("#m").after($.el("li", { text: "c" }));
  assert.deepEqual($("#l").children().map((e) => e.textContent),
    ["a", "b1", "b2", "m", "c", "z"]);
});

test("replaceWith, remove, empty, clone", () => {
  fixture(`<div id="d"><span id="s">x</span><span>y</span></div>`);
  $("#s").replaceWith($.el("b", { text: "B" }));
  assert.equal($("#d").find("b").text(), "B");
  assert.equal($("#s").length, 0);
  const $clone = $("#d").clone();
  $clone.find("b").text("changed");
  assert.equal($("#d").find("b").text(), "B"); // original untouched
  $("#d").empty();
  assert.equal($("#d").children().length, 0);
  $("#d").remove();
  assert.equal($("#d").length, 0);
});

test("appendTo / prependTo move elements and return the wrapper", () => {
  fixture(`<div id="t"><p>mid</p></div>`);
  const $first = $.el("p", { text: "first" }).appendTo("#t");
  $.el("p", { text: "zeroth" }).prependTo("#t");
  assert.equal($first.text(), "first");
  assert.deepEqual($("#t").children().map((e) => e.textContent),
    ["zeroth", "mid", "first"]);
});

test("appending to several targets clones into all but the last", () => {
  fixture(`<div class="t"></div><div class="t"></div>`);
  $(".t").append($.el("span", { text: "s" }));
  assert.deepEqual($(".t").map((e) => e.querySelector("span").textContent), ["s", "s"]);
});

// -- Events --------------------------------------------------------------------------------

test("on: handler this is the element, argument is the native event", () => {
  fixture(`<button id="b">x</button>`);
  let seen = null;
  $("#b").on("click", function (e) { seen = [this.id, e.type]; });
  document.querySelector("#b").click();
  assert.deepEqual(seen, ["b", "click"]);
});

test("on: map form registers several events", () => {
  fixture(`<input id="i">`);
  const calls = [];
  $("#i").on({ input: () => calls.push("input"), blur: () => calls.push("blur") });
  const el = document.querySelector("#i");
  el.dispatchEvent(new window.Event("input"));
  el.dispatchEvent(new window.Event("blur"));
  assert.deepEqual(calls, ["input", "blur"]);
});

test("on: delegation matches descendants, this is the matched child", () => {
  fixture(`<ul id="l"><li><button class="del">x</button></li><li>plain</li></ul>`);
  const hits = [];
  $("#l").on("click", ".del", function () { hits.push(this.tagName); });
  document.querySelector(".del").click();
  document.querySelectorAll("li")[1].click();
  assert.deepEqual(hits, ["BUTTON"]);
});

test("one fires once; off(name, handler) and off() remove handlers", () => {
  fixture(`<button id="b">x</button>`);
  const el = document.querySelector("#b");
  let a = 0, b = 0;
  const handlerB = () => { b++; };
  $("#b").one("click", () => { a++; });
  $("#b").on("click", handlerB);
  el.click(); el.click();
  assert.equal(a, 1);
  assert.equal(b, 2);
  $("#b").off("click", handlerB);
  el.click();
  assert.equal(b, 2);
  $("#b").on("click", handlerB);
  $("#b").off();
  el.click();
  assert.equal(b, 2);
});

// -- refs ---------------------------------------------------------------------------------------

test("refs from an .html skeleton: wrappers, fluent, detached", () => {
  const $form = $.el("form").html(`
    <input ref="email" type="email">
    <button ref="submit" type="submit">Save</button>
  `);
  const refs = $form.refs();
  assert.ok(refs.email instanceof Wrapper);
  assert.equal(refs.email.length, 1);
  refs.email.val("a@example.com");
  assert.equal(refs.email.el.value, "a@example.com");
  let sent = 0;
  refs.submit.on("click", () => { sent++; });
  refs.submit.el.click();
  assert.equal(sent, 1);
});

test("refs: self ref, $.el ref prop, last duplicate wins, snapshot", () => {
  const $root = $.el("div", { ref: "root" },
    $.el("span", { ref: "x", text: "first" }),
    $.el("span", { ref: "x", text: "second" }),
  );
  const refs = $root.refs();
  assert.equal(refs.root.el, $root.el);
  assert.equal(refs.x.text(), "second");
  $root.append($.el("span", { ref: "late", text: "late" }));
  assert.equal(refs.late, undefined);            // snapshot: not live
  assert.equal($root.refs().late.text(), "late"); // re-call sees it
  assert.equal(Object.getPrototypeOf(refs), null);
});

test("refs(handlers): each handler receives its ref's wrapper to mutate directly", () => {
  const $root = $.el("div").html(`
    <span ref="label">old</span>
    <button ref="submit" type="submit">Go</button>
  `);
  let clicks = 0;
  const refs = $root.refs({
    label: (l) => l.text("Click Me"),
    submit: (b) => b.on("click", () => { clicks++; }).addClass("primary"),
  });
  assert.equal($root.find("[ref=label]").text(), "Click Me");
  assert.equal(refs.label.text(), "Click Me"); // the refs object is still returned
  assert.equal(refs.submit.hasClass("primary"), true);
  refs.submit.el.click();
  assert.equal(clicks, 1);
});

test("refs(handlers): handler gets the name as second argument, this is the wrapper", () => {
  const $root = $.el("div").html(`<span ref="a">1</span><span ref="b">2</span>`);
  const seen = [];
  $root.refs({
    a: function (w, name) { seen.push([name, w.text(), this === w]); },
    b: function (w, name) { seen.push([name, w.text(), this === w]); },
  });
  assert.deepEqual(seen, [["a", "1", true], ["b", "2", true]]);
});

test("refs(handlers): missing ref gets an empty wrapper; non-function throws", () => {
  const $root = $.el("div").html(`<span ref="x">1</span>`);
  let got = null;
  $root.refs({ nope: (w) => { got = w; w.text("ignored"); } });
  assert.ok(got instanceof Wrapper);
  assert.equal(got.length, 0);
  assert.equal($root.find("[ref=x]").text(), "1"); // untouched
  assert.throws(() => $root.refs({ x: "not a function" }), TypeError);
  assert.throws(() => $root.refs("nope"), TypeError);
});

// -- $.events --------------------------------------------------------------------------------------

test("$.events augments in place; on/emit pass args and bind this", () => {
  const obj = { count: 0 };
  const store = $.events(obj);
  assert.equal(store, obj);
  const seen = [];
  store.on("change", function (n) { seen.push([n, this === obj]); });
  store.emit("change", 5);
  assert.deepEqual(seen, [[5, true]]);
  assert.deepEqual(Object.keys(obj), ["count"]); // methods are non-enumerable
  assert.equal(JSON.stringify(obj), `{"count":0}`);
});

test("$.events: fresh object, map form, once, off variants, no duplicates", () => {
  const bus = $.events();
  let a = 0, b = 0;
  const ha = () => { a++; };
  bus.on({ x: ha, y: () => { b++; } });
  bus.on("x", ha); // duplicate registration is stored once
  bus.emit("x"); bus.emit("y");
  assert.deepEqual([a, b], [1, 1]);
  bus.once("x", ha);
  bus.emit("x"); bus.emit("x");
  // first emit: regular registration (a=2) + once registration (a=3);
  // second emit: regular only (a=4) — the once registration is gone
  assert.equal(a, 4);
  bus.off("x", ha);
  bus.emit("x");
  assert.equal(a, 4);
  bus.on("x", ha);
  bus.off("x");
  bus.emit("x");
  assert.equal(a, 4);
  bus.on("x", ha);
  bus.off();
  bus.emit("x");
  assert.equal(a, 4);
  assert.equal(bus.emit("nothing"), bus); // emit chains / returns the object
});

test("$.events called twice on one object keeps its listeners", () => {
  const obj = $.events({});
  let n = 0;
  obj.on("e", () => { n++; });
  $.events(obj);
  obj.emit("e");
  assert.equal(n, 1);
});
