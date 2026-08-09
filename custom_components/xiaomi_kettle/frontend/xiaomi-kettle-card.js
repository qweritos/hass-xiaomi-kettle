//#region node_modules/custom-card-helpers/dist/index.m.js
var e;
(function(e) {
	e.language = "language", e.system = "system", e.comma_decimal = "comma_decimal", e.decimal_comma = "decimal_comma", e.space_comma = "space_comma", e.none = "none";
})(e ||= {});
var t;
(function(e) {
	e.language = "language", e.system = "system", e.am_pm = "12", e.twenty_four = "24";
})(t ||= {});
var n = (e, t, n, r) => {
	r ||= {}, n ??= {};
	let i = new Event(t, {
		bubbles: r.bubbles === void 0 || r.bubbles,
		cancelable: !!r.cancelable,
		composed: r.composed === void 0 || r.composed
	});
	return i.detail = n, e.dispatchEvent(i), i;
}, r = globalThis, i = r.ShadowRoot && (r.ShadyCSS === void 0 || r.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, a = Symbol(), o = /* @__PURE__ */ new WeakMap(), s = class {
	constructor(e, t, n) {
		if (this._$cssResult$ = !0, n !== a) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
		this.cssText = e, this.t = t;
	}
	get styleSheet() {
		let e = this.o, t = this.t;
		if (i && e === void 0) {
			let n = t !== void 0 && t.length === 1;
			n && (e = o.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), n && o.set(t, e));
		}
		return e;
	}
	toString() {
		return this.cssText;
	}
}, c = (e) => new s(typeof e == "string" ? e : e + "", void 0, a), l = (e, ...t) => new s(e.length === 1 ? e[0] : t.reduce((t, n, r) => t + ((e) => {
	if (!0 === e._$cssResult$) return e.cssText;
	if (typeof e == "number") return e;
	throw Error("Value passed to 'css' function must be a 'css' function result: " + e + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
})(n) + e[r + 1], e[0]), e, a), u = (e, t) => {
	if (i) e.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
	else for (let n of t) {
		let t = document.createElement("style"), i = r.litNonce;
		i !== void 0 && t.setAttribute("nonce", i), t.textContent = n.cssText, e.appendChild(t);
	}
}, d = i ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((e) => {
	let t = "";
	for (let n of e.cssRules) t += n.cssText;
	return c(t);
})(e) : e, { is: f, defineProperty: p, getOwnPropertyDescriptor: m, getOwnPropertyNames: h, getOwnPropertySymbols: g, getPrototypeOf: _ } = Object, v = globalThis, y = v.trustedTypes, ee = y ? y.emptyScript : "", te = v.reactiveElementPolyfillSupport, b = (e, t) => e, x = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? ee : null;
				break;
			case Object:
			case Array: e = e == null ? e : JSON.stringify(e);
		}
		return e;
	},
	fromAttribute(e, t) {
		let n = e;
		switch (t) {
			case Boolean:
				n = e !== null;
				break;
			case Number:
				n = e === null ? null : Number(e);
				break;
			case Object:
			case Array: try {
				n = JSON.parse(e);
			} catch {
				n = null;
			}
		}
		return n;
	}
}, ne = (e, t) => !f(e, t), S = {
	attribute: !0,
	type: String,
	converter: x,
	reflect: !1,
	useDefault: !1,
	hasChanged: ne
};
Symbol.metadata ??= Symbol("metadata"), v.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var C = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = S) {
		if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
			let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
			r !== void 0 && p(this.prototype, e, r);
		}
	}
	static getPropertyDescriptor(e, t, n) {
		let { get: r, set: i } = m(this.prototype, e) ?? {
			get() {
				return this[t];
			},
			set(e) {
				this[t] = e;
			}
		};
		return {
			get: r,
			set(t) {
				let a = r?.call(this);
				i?.call(this, t), this.requestUpdate(e, a, n);
			},
			configurable: !0,
			enumerable: !0
		};
	}
	static getPropertyOptions(e) {
		return this.elementProperties.get(e) ?? S;
	}
	static _$Ei() {
		if (this.hasOwnProperty(b("elementProperties"))) return;
		let e = _(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(b("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(b("properties"))) {
			let e = this.properties, t = [...h(e), ...g(e)];
			for (let n of t) this.createProperty(n, e[n]);
		}
		let e = this[Symbol.metadata];
		if (e !== null) {
			let t = litPropertyMetadata.get(e);
			if (t !== void 0) for (let [e, n] of t) this.elementProperties.set(e, n);
		}
		this._$Eh = /* @__PURE__ */ new Map();
		for (let [e, t] of this.elementProperties) {
			let n = this._$Eu(e, t);
			n !== void 0 && this._$Eh.set(n, e);
		}
		this.elementStyles = this.finalizeStyles(this.styles);
	}
	static finalizeStyles(e) {
		let t = [];
		if (Array.isArray(e)) {
			let n = new Set(e.flat(1 / 0).reverse());
			for (let e of n) t.unshift(d(e));
		} else e !== void 0 && t.push(d(e));
		return t;
	}
	static _$Eu(e, t) {
		let n = t.attribute;
		return !1 === n ? void 0 : typeof n == "string" ? n : typeof e == "string" ? e.toLowerCase() : void 0;
	}
	constructor() {
		super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
	}
	_$Ev() {
		this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
	}
	addController(e) {
		(this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
	}
	removeController(e) {
		this._$EO?.delete(e);
	}
	_$E_() {
		let e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
		for (let n of t.keys()) this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
		e.size > 0 && (this._$Ep = e);
	}
	createRenderRoot() {
		let e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
		return u(e, this.constructor.elementStyles), e;
	}
	connectedCallback() {
		this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
	}
	enableUpdating(e) {}
	disconnectedCallback() {
		this._$EO?.forEach((e) => e.hostDisconnected?.());
	}
	attributeChangedCallback(e, t, n) {
		this._$AK(e, n);
	}
	_$ET(e, t) {
		let n = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, n);
		if (r !== void 0 && !0 === n.reflect) {
			let i = (n.converter?.toAttribute === void 0 ? x : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? x : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? ne)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
			this.C(e, t, n);
		}
		!1 === this.isUpdatePending && (this._$ES = this._$EP());
	}
	C(e, t, { useDefault: n, reflect: r, wrapped: i }, a) {
		n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), !0 !== i || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), !0 === r && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
	}
	async _$EP() {
		this.isUpdatePending = !0;
		try {
			await this._$ES;
		} catch (e) {
			Promise.reject(e);
		}
		let e = this.scheduleUpdate();
		return e != null && await e, !this.isUpdatePending;
	}
	scheduleUpdate() {
		return this.performUpdate();
	}
	performUpdate() {
		if (!this.isUpdatePending) return;
		if (!this.hasUpdated) {
			if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
				for (let [e, t] of this._$Ep) this[e] = t;
				this._$Ep = void 0;
			}
			let e = this.constructor.elementProperties;
			if (e.size > 0) for (let [t, n] of e) {
				let { wrapped: e } = n, r = this[t];
				!0 !== e || this._$AL.has(t) || r === void 0 || this.C(t, void 0, n, r);
			}
		}
		let e = !1, t = this._$AL;
		try {
			e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((e) => e.hostUpdate?.()), this.update(t)) : this._$EM();
		} catch (t) {
			throw e = !1, this._$EM(), t;
		}
		e && this._$AE(t);
	}
	willUpdate(e) {}
	_$AE(e) {
		this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
	}
	_$EM() {
		this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
	}
	get updateComplete() {
		return this.getUpdateComplete();
	}
	getUpdateComplete() {
		return this._$ES;
	}
	shouldUpdate(e) {
		return !0;
	}
	update(e) {
		this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
	}
	updated(e) {}
	firstUpdated(e) {}
};
C.elementStyles = [], C.shadowRootOptions = { mode: "open" }, C[b("elementProperties")] = /* @__PURE__ */ new Map(), C[b("finalized")] = /* @__PURE__ */ new Map(), te?.({ ReactiveElement: C }), (v.reactiveElementVersions ??= []).push("2.1.2");
//#endregion
//#region node_modules/lit-html/lit-html.js
var w = globalThis, T = (e) => e, E = w.trustedTypes, re = E ? E.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, ie = "$lit$", D = `lit$${Math.random().toFixed(9).slice(2)}$`, ae = "?" + D, oe = `<${ae}>`, O = document, k = () => O.createComment(""), A = (e) => e === null || typeof e != "object" && typeof e != "function", j = Array.isArray, se = (e) => j(e) || typeof e?.[Symbol.iterator] == "function", M = "[ 	\n\f\r]", N = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ce = /-->/g, le = />/g, P = RegExp(`>|${M}(?:([^\\s"'>=/]+)(${M}*=${M}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), ue = /'/g, de = /"/g, F = /^(?:script|style|textarea|title)$/i, I = ((e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}))(1), L = Symbol.for("lit-noChange"), R = Symbol.for("lit-nothing"), fe = /* @__PURE__ */ new WeakMap(), z = O.createTreeWalker(O, 129);
function pe(e, t) {
	if (!j(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return re === void 0 ? t : re.createHTML(t);
}
var me = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = N;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === N ? c[1] === "!--" ? o = ce : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = P) : (F.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = P) : o = le : o === P ? c[0] === ">" ? (o = i ?? N, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? P : c[3] === "\"" ? de : ue) : o === de || o === ue ? o = P : o === ce || o === le ? o = N : (o = P, i = void 0);
		let d = o === P && e[t + 1].startsWith("/>") ? " " : "";
		a += o === N ? n + oe : l >= 0 ? (r.push(s), n.slice(0, l) + ie + n.slice(l) + D + d) : n + D + (l === -2 ? t : d);
	}
	return [pe(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, B = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = me(t, n);
		if (this.el = e.createElement(l, r), z.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = z.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(ie)) {
					let t = u[o++], n = i.getAttribute(e).split(D), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? ge : r[1] === "?" ? _e : r[1] === "@" ? ve : U
					}), i.removeAttribute(e);
				} else e.startsWith(D) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (F.test(i.tagName)) {
					let e = i.textContent.split(D), t = e.length - 1;
					if (t > 0) {
						i.textContent = E ? E.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], k()), z.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], k());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === ae) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(D, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += D.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = O.createElement("template");
		return n.innerHTML = e, n;
	}
};
function V(e, t, n = e, r) {
	if (t === L) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = A(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = V(e, i._$AS(e, t.values), i, r)), t;
}
var he = class {
	constructor(e, t) {
		this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
	}
	get parentNode() {
		return this._$AM.parentNode;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	u(e) {
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? O).importNode(t, !0);
		z.currentNode = r;
		let i = z.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new H(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new ye(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = z.nextNode(), a++);
		}
		return z.currentNode = O, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, H = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = R, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
	}
	get parentNode() {
		let e = this._$AA.parentNode, t = this._$AM;
		return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
	}
	get startNode() {
		return this._$AA;
	}
	get endNode() {
		return this._$AB;
	}
	_$AI(e, t = this) {
		e = V(this, e, t), A(e) ? e === R || e == null || e === "" ? (this._$AH !== R && this._$AR(), this._$AH = R) : e !== this._$AH && e !== L && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? se(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== R && A(this._$AH) ? this._$AA.nextSibling.data = e : this.T(O.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = B.createElement(pe(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new he(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = fe.get(e.strings);
		return t === void 0 && fe.set(e.strings, t = new B(e)), t;
	}
	k(t) {
		j(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(k()), this.O(k()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = T(e).nextSibling;
			T(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, U = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = R, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = R;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = V(this, e, t, 0), a = !A(e) || e !== this._$AH && e !== L, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = V(this, r[n + o], t, o), s === L && (s = this._$AH[o]), a ||= !A(s) || s !== this._$AH[o], s === R ? e = R : e !== R && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === R ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, ge = class extends U {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === R ? void 0 : e;
	}
}, _e = class extends U {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== R);
	}
}, ve = class extends U {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = V(this, e, t, 0) ?? R) === L) return;
		let n = this._$AH, r = e === R && n !== R || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== R && (n === R || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, ye = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		V(this, e);
	}
}, be = w.litHtmlPolyfillSupport;
be?.(B, H), (w.litHtmlVersions ??= []).push("3.3.3");
var xe = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new H(t.insertBefore(k(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, W = globalThis, G = class extends C {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = xe(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return L;
	}
};
G._$litElement$ = !0, G.finalized = !0, W.litElementHydrateSupport?.({ LitElement: G });
var Se = W.litElementPolyfillSupport;
Se?.({ LitElement: G }), (W.litElementVersions ??= []).push("4.2.2");
//#endregion
//#region node_modules/lit-html/directive.js
var Ce = {
	ATTRIBUTE: 1,
	CHILD: 2,
	PROPERTY: 3,
	BOOLEAN_ATTRIBUTE: 4,
	EVENT: 5,
	ELEMENT: 6
}, we = (e) => (...t) => ({
	_$litDirective$: e,
	values: t
}), Te = class {
	constructor(e) {}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AT(e, t, n) {
		this._$Ct = e, this._$AM = t, this._$Ci = n;
	}
	_$AS(e, t) {
		return this.update(e, t);
	}
	update(e, t) {
		return this.render(...t);
	}
}, K = we(class extends Te {
	constructor(e) {
		if (super(e), e.type !== Ce.ATTRIBUTE || e.name !== "class" || e.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
	}
	render(e) {
		return " " + Object.keys(e).filter((t) => e[t]).join(" ") + " ";
	}
	update(e, [t]) {
		if (this.st === void 0) {
			this.st = /* @__PURE__ */ new Set(), e.strings !== void 0 && (this.nt = new Set(e.strings.join(" ").split(/\s/).filter((e) => e !== "")));
			for (let e in t) t[e] && !this.nt?.has(e) && this.st.add(e);
			return this.render(t);
		}
		let n = e.element.classList;
		for (let e of this.st) e in t || (n.remove(e), this.st.delete(e));
		for (let e in t) {
			let r = !!t[e];
			r === this.st.has(e) || this.nt?.has(e) || (r ? (n.add(e), this.st.add(e)) : (n.remove(e), this.st.delete(e)));
		}
		return L;
	}
}), q = "xiaomi-kettle-card", Ee = "xiaomi-kettle-card-editor", J = "xiaomi-kettle-dialog-content", De = "https://github.com/qweritos/hass-xiaomi-kettle", Oe = /* @__PURE__ */ new Set(["yunmi.kettle.v19"]), ke = 1e3, Y = {
	lifted: "kettle_lifting",
	stop: "stop_work",
	keepWarm: "auto_keep_warm",
	keepTemp: "keep_warm_temperature",
	keepTime: "keep_warm_time",
	warmingTime: "warming_time",
	boilReminder: "boiling_reminder",
	warmReminder: "keep_warm_reminder",
	liftMemory: "lift_remember_temp",
	customKnob: "custom_knob_temp",
	noDisturb: "no_disturb"
};
//#endregion
//#region src/device.ts
function Ae(e) {
	return e.split(".", 1)[0] ?? "";
}
function je(e, t) {
	return e.entities?.[t]?.device_id ?? void 0;
}
function Me(e, t) {
	let n = e.states?.[t]?.attributes?.["xiaomi_kettle.source_entity_id"];
	return typeof n == "string" && e.states[n] ? n : t;
}
function Ne(e, t) {
	return Object.values(e.entities ?? {}).find((n) => (e.states?.[n.entity_id])?.attributes?.["xiaomi_kettle.source_entity_id"] === t)?.device_id ?? void 0;
}
function Pe(e, t) {
	if (!e || !t) return !1;
	let n = Me(e, t);
	if (n !== t) return !0;
	let r = je(e, n), i = r ? e.devices?.[r]?.model?.toLowerCase() : void 0, a = String(e.states?.[t]?.attributes?.model ?? "").toLowerCase();
	return !!(i && Oe.has(i) || Oe.has(a));
}
function Fe(e, t) {
	let n = Me(e, t), r = je(e, n);
	if (!r) return;
	let i = (t) => Object.values(e.entities ?? {}).filter((e) => e.device_id === t && !e.disabled_by), a = (e, t, n = []) => e.find((e) => Ae(e.entity_id) === t && (!n.length || n.some((t) => e.entity_id.endsWith(`_${t}`))))?.entity_id, o = i(r), s = a(o, "water_heater") ?? (Ae(n) === "water_heater" ? n : void 0);
	if (!s) return;
	let c = Ne(e, s), l = c ?? r, u = c ? i(c) : o, d = (e, ...t) => a(u, e, t) ?? a(o, e, t), f = a(u, "water_heater") ?? s;
	if (f) return {
		deviceId: l,
		main: f,
		sourceMain: s,
		start: d("button", "start"),
		boil: d("button", "boil"),
		program: d("select", "program"),
		lifted: d("binary_sensor", Y.lifted, "lifted"),
		stop: d("button", "stop", Y.stop),
		keepWarm: d("switch", "keep_warm", Y.keepWarm),
		keepTemp: d("number", "keep_temperature", Y.keepTemp),
		keepTime: d("number", "keep_duration", Y.keepTime),
		warmingTime: d("sensor", Y.warmingTime),
		boilReminder: d("switch", "boiling_reminder", Y.boilReminder),
		warmReminder: d("switch", "keep_warm_reminder", Y.warmReminder),
		liftMemory: d("switch", "lift_memory", Y.liftMemory),
		customKnob: d("switch", "custom_knob", Y.customKnob),
		noDisturb: d("switch", "no_disturb", Y.noDisturb)
	};
}
//#endregion
//#region src/dialog-styles.ts
var Ie = l`
  :host {
    display: block;
    min-width: 0;
    --kettle-radius: var(--ha-card-border-radius, 12px);
    --kettle-surface: var(--secondary-background-color);
    --kettle-muted: var(--secondary-text-color);
  }

  * {
    box-sizing: border-box;
  }

  .shell {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    padding: 10px 14px 18px;
    overflow-x: hidden;
    color: var(--primary-text-color);
  }

  .shell.card-mode {
    padding-top: 8px;
  }

  .hero {
    --state-color: var(--primary-color);
    display: grid;
    grid-template-columns: minmax(0, 1fr) 72px;
    min-height: 104px;
    padding: 11px 16px;
    overflow: hidden;
    border: 1px solid var(--divider-color);
    border-radius: var(--kettle-radius);
    background: var(--card-background-color);
  }

  .hero.hot {
    --state-color: var(--warning-color, #ff9800);
  }

  .hero.cool {
    --state-color: var(--info-color, var(--primary-color));
  }

  .hero.warm {
    --state-color: var(--success-color, #4caf50);
  }

  .hero.fault {
    --state-color: var(--error-color);
  }

  .hero.lifted {
    --state-color: var(--accent-color, var(--primary-color));
  }

  .temperature {
    z-index: 1;
    align-self: center;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 0 18px;
    min-width: 0;
  }

  .temperature-value {
    min-width: 0;
    padding: 0;
    border: 0;
    border-radius: 8px;
    color: inherit;
    background: transparent;
    text-align: left;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .temperature-value:hover {
    color: var(--state-color);
  }

  .temperature-value:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 4px;
  }

  .temperature-value > strong {
    display: block;
    font-size: 54px;
    line-height: 0.95;
    letter-spacing: -4px;
  }

  .temperature-value > strong small {
    margin-left: 4px;
    font-size: 21px;
    letter-spacing: 0;
    opacity: 0.8;
  }

  .temperature-copy {
    min-width: 0;
  }

  .status {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    color: var(--state-color);
    font-size: 15px;
    font-weight: 650;
  }

  .status-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .status-dot {
    flex: 0 0 auto;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentcolor;
  }

  .status.action-armed {
    color: var(--warning-color, #ff9800);
  }

  .hero-meta {
    margin-top: 7px;
    overflow: hidden;
    color: var(--secondary-text-color);
    font-size: 12px;
    line-height: 1.35;
    text-overflow: ellipsis;
  }

  .hero-meta.preview {
    color: color-mix(in srgb, var(--warning-color, #ff9800) 48%, var(--secondary-text-color));
  }

  .kettle-action {
    align-self: center;
    justify-self: end;
    position: relative;
    width: 62px;
    height: 62px;
  }

  .kettle-art {
    --kettle-steam-offset: 4.75px;
    display: grid;
    place-items: center;
    width: 62px;
    height: 62px;
    padding: 0;
    border: 1px solid var(--divider-color);
    border-radius: var(--kettle-radius);
    color: var(--state-color);
    background: var(--secondary-background-color);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .kettle-art:focus-visible {
    outline: 2px solid var(--warning-color, #ff9800);
    outline-offset: 2px;
  }

  .kettle-art:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .kettle-art.armed {
    border-color: var(--warning-color, #ff9800);
    color: var(--warning-color, #ff9800);
    background: color-mix(
      in srgb,
      var(--warning-color, #ff9800) 12%,
      var(--secondary-background-color)
    );
  }

  .kettle-art ha-icon {
    --mdc-icon-size: 38px;
  }

  .kettle-art ha-icon[icon='mdi:kettle-steam'] {
    translate: var(--kettle-steam-offset) 0;
  }

  .hero.hot .kettle-art ha-icon {
    animation: kettle-pulse 1.8s ease-in-out infinite;
  }

  .hero.hot .kettle-art.armed ha-icon {
    animation: none;
  }

  @keyframes kettle-pulse {
    50% {
      transform: translateY(-3px);
    }
  }

  summary ha-icon,
  .setting-icon ha-icon {
    color: var(--primary-color);
  }

  .programs {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
    min-width: 0;
    margin-top: 10px;
  }

  button {
    font: inherit;
  }

  .program {
    min-width: 0;
    width: 100%;
    padding: 10px 6px 9px;
    border: 1px solid var(--divider-color);
    border-radius: var(--kettle-radius);
    color: var(--primary-text-color);
    background: var(--card-background-color);
    cursor: pointer;
    transition:
      transform 0.16s ease,
      border-color 0.16s ease,
      background 0.16s ease;
  }

  .program:hover {
    transform: translateY(-1px);
    border-color: var(--primary-color);
    background: var(--kettle-surface);
  }

  .program:active {
    transform: scale(0.97);
  }

  .program:disabled,
  .button:disabled {
    cursor: wait;
    opacity: 0.6;
    transform: none;
  }

  .program.armed,
  .button.armed {
    border-color: var(--primary-color);
    color: var(--text-primary-color);
    background: var(--primary-color);
  }

  .program ha-icon {
    display: block;
    margin: 0 auto 5px;
    color: var(--primary-color);
    --mdc-icon-size: 23px;
  }

  .program.armed ha-icon,
  .program.armed small {
    color: currentcolor;
  }

  .program strong,
  .program small {
    display: block;
    overflow: hidden;
    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .program small {
    margin-top: 2px;
    color: var(--kettle-muted);
  }

  .empty-programs {
    grid-column: 1 / -1;
    margin: 0;
    padding: 10px 12px;
    color: var(--kettle-muted);
    font-size: 12px;
  }

  .control-card {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px 12px;
    align-items: center;
    min-width: 0;
    margin-top: 8px;
    padding: 12px 14px;
    border: 1px solid var(--divider-color);
    border-radius: var(--kettle-radius);
    background: var(--card-background-color);
  }

  .control-card.disabled {
    opacity: 0.55;
  }

  .control-copy,
  .setting-copy {
    min-width: 0;
  }

  .control-copy strong,
  .control-copy small,
  .setting-copy strong,
  .setting-copy small {
    display: block;
  }

  .control-copy strong,
  .setting-copy strong {
    font-size: 13px;
  }

  .control-copy small,
  .setting-copy small {
    margin-top: 3px;
    color: var(--kettle-muted);
    font-size: 11px;
  }

  .control-value {
    color: var(--primary-color);
    font-size: 14px;
    font-weight: 700;
  }

  input[type='range'] {
    grid-column: 1 / -1;
    width: 100%;
    min-width: 0;
    height: 5px;
    margin: 3px 0 0;
    border-radius: 99px;
    accent-color: var(--primary-color);
    cursor: pointer;
  }

  input[type='range']:disabled {
    cursor: not-allowed;
  }

  .keep-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 8px;
    min-width: 0;
    margin-top: 8px;
  }

  .keep-grid .control-card {
    min-width: 0;
    margin: 0;
  }

  .switch-card {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .switch-card .control-copy {
    flex: 1;
  }

  .switch-input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .switch {
    position: relative;
    flex: 0 0 auto;
    width: 42px;
    height: 24px;
    border-radius: 99px;
    background: var(--disabled-color);
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .switch::after {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: white;
    box-shadow: 0 2px 6px rgb(0 0 0 / 25%);
    content: '';
    transition: transform 0.2s ease;
  }

  .switch-input:checked + .switch {
    background: var(--primary-color);
  }

  .switch-input:checked + .switch::after {
    transform: translateX(18px);
  }

  .actions {
    display: grid;
    grid-template-columns: 1.3fr 1fr 1fr;
    gap: 8px;
    min-width: 0;
    margin-top: 10px;
  }

  .actions.card-actions {
    grid-template-columns: 1fr 1fr;
  }

  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-width: 0;
    min-height: 44px;
    padding: 0 11px;
    overflow: hidden;
    border: 0;
    border-radius: var(--kettle-radius);
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
    cursor: pointer;
    transition: transform 0.14s ease;
  }

  .button:active {
    transform: scale(0.98);
  }

  .button ha-icon {
    --mdc-icon-size: 19px;
  }

  .button.primary {
    color: var(--text-primary-color);
    background: var(--primary-color);
  }

  .button.boil {
    border: 1px solid var(--primary-color);
    color: var(--primary-color);
    background: var(--card-background-color);
  }

  .button.stop {
    border: 1px solid var(--divider-color);
    color: var(--error-color);
    background: var(--card-background-color);
  }

  details {
    margin-top: 10px;
    overflow: hidden;
    border: 1px solid var(--divider-color);
    border-radius: var(--kettle-radius);
    background: var(--card-background-color);
  }

  summary {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 13px 14px;
    font-size: 13px;
    font-weight: 650;
    list-style: none;
    cursor: pointer;
  }

  summary::-webkit-details-marker {
    display: none;
  }

  summary .chevron {
    margin-left: auto;
    color: var(--kettle-muted);
    transition: transform 0.18s ease;
  }

  details[open] summary .chevron {
    transform: rotate(180deg);
  }

  .settings {
    padding: 0 11px 7px;
  }

  .setting-row {
    position: relative;
    display: flex;
    align-items: center;
    gap: 9px;
    min-height: 50px;
    padding: 6px 3px;
  }

  label.setting-row {
    cursor: pointer;
  }

  .setting-row + .setting-row {
    border-top: 1px solid var(--divider-color);
  }

  .setting-icon {
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    width: 30px;
    height: 30px;
    border-radius: 10px;
    background: var(--secondary-background-color);
  }

  .setting-icon ha-icon {
    --mdc-icon-size: 17px;
  }

  .setting-copy {
    flex: 1;
  }

  .notice {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-top: 9px;
    padding: 10px 12px;
    border: 1px solid var(--divider-color);
    border-radius: var(--kettle-radius);
    color: var(--error-color);
    background: var(--card-background-color);
    font-size: 12px;
  }

  .notice ha-icon {
    --mdc-icon-size: 19px;
  }

  .offline {
    pointer-events: none;
    opacity: 0.56;
    filter: grayscale(0.25);
  }

  @media (max-width: 600px) {
    .shell {
      padding: 8px 10px calc(12px + env(safe-area-inset-bottom));
    }

    .hero {
      grid-template-columns: minmax(0, 1fr) 54px;
      min-height: 86px;
      padding: 8px 12px;
    }

    .temperature {
      gap: 0 11px;
    }

    .temperature-value > strong {
      font-size: 44px;
      letter-spacing: -3px;
    }

    .temperature-value > strong small {
      font-size: 18px;
    }

    .status {
      font-size: 13px;
    }

    .hero-meta {
      margin-top: 5px;
      font-size: 10px;
    }

    .kettle-action,
    .kettle-art {
      width: 48px;
      height: 48px;
      border-radius: 14px;
    }

    .kettle-art {
      --kettle-steam-offset: 3.75px;
    }

    .kettle-art ha-icon {
      --mdc-icon-size: 30px;
    }

    .programs {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 7px;
    }

    .program {
      padding: 8px 5px 7px;
    }

    .control-card {
      gap: 6px 8px;
      padding: 10px 11px;
    }

    .control-copy small {
      display: none;
    }

    .actions {
      grid-template-columns: 1.15fr 0.9fr 0.9fr;
      gap: 6px;
    }

    .button {
      min-height: 42px;
      padding: 0 7px;
      gap: 4px;
      font-size: 12px;
    }

    summary {
      padding: 11px 12px;
    }
  }
`;
//#endregion
//#region src/kettle.ts
function X(e) {
	return e >= 60 && e % 60 == 0 ? `${e / 60} h` : e > 60 ? `${Math.floor(e / 60)} h ${e % 60} min` : `${e} min`;
}
function Le(e, t) {
	return Math.max(0, e - t);
}
function Re(e, t) {
	let n = e.toLowerCase();
	return /wolf|goji|berr/.test(n) ? "mdi:fruit-cherries" : /flower|scent/.test(n) ? "mdi:flower-tulip" : n.includes("tea") ? "mdi:tea" : t <= 50 || n.includes("water") ? "mdi:cup-water" : "mdi:cup";
}
function ze(e, t = {}) {
	return typeof e != "string" || !e.trim() ? [] : e.trim().split("_").map((e, n) => {
		let [r, i, a, o, s] = e.split(","), c = r?.trim(), l = Number(i), u = Number(o), d = Number(s);
		if (!(!c || !Number.isFinite(l) || !Number.isFinite(u) || !Number.isFinite(d))) return {
			key: `preset-${n}`,
			name: c,
			target: l,
			keep: a?.trim() === "1",
			keepTemperature: u,
			duration: d,
			mode: 10 + n,
			icon: t[c] || Re(c, l)
		};
	}).filter((e) => e !== void 0).slice(0, 6);
}
function Be(e, t) {
	return e === 0 ? "Manual" : e === 1 ? "Boil" : t.find((t) => t.mode === e)?.name;
}
function Ve(e, t) {
	let n = e?.attributes ?? {}, r = Number(n["kettle.status"]), i = Number(n["kettle.fault"]) || 0;
	if (i) return {
		code: r,
		fault: i,
		lifted: t,
		label: `Fault · code ${i}`,
		tone: "fault"
	};
	if (t) return {
		code: r,
		fault: i,
		lifted: t,
		label: "Lifted from base",
		tone: "lifted"
	};
	let [a, o] = {
		0: ["Ready", "idle"],
		1: ["Heating", "hot"],
		2: ["Boiling", "hot"],
		3: ["Cooling", "cool"],
		4: ["Keeping warm", "warm"]
	}[r] ?? ["Unavailable", "idle"];
	return {
		code: r,
		fault: i,
		lifted: t,
		label: a,
		tone: o
	};
}
//#endregion
//#region src/miot.ts
async function Z(e, t, n) {
	let r = await e.callService.bind(e)("xiaomi_miot", "send_command", {
		entity_id: t,
		method: "set_properties",
		params: n
	}, void 0, !0), i = r?.response?.result ?? r?.service_response?.result ?? r?.result ?? [], a = i.filter((e) => Number(e.code) !== 0);
	if (i.length && a.length === i.length) throw Error("Kettle command was rejected");
}
function He(e, t, n) {
	return Z(e, t, [
		{
			did: "set-2-4",
			siid: 2,
			piid: 4,
			value: n.target
		},
		{
			did: "set-2-5",
			siid: 2,
			piid: 5,
			value: n.keep
		},
		{
			did: "set-2-6",
			siid: 2,
			piid: 6,
			value: n.keepTemperature
		},
		{
			did: "set-3-1",
			siid: 3,
			piid: 1,
			value: n.duration
		},
		{
			did: "set-3-11",
			siid: 3,
			piid: 11,
			value: n.mode
		}
	]);
}
function Ue(e, t, n, r, i, a) {
	return Z(e, t, [
		{
			did: "set-2-4",
			siid: 2,
			piid: 4,
			value: n
		},
		{
			did: "set-2-5",
			siid: 2,
			piid: 5,
			value: r
		},
		{
			did: "set-2-6",
			siid: 2,
			piid: 6,
			value: i
		},
		{
			did: "set-3-1",
			siid: 3,
			piid: 1,
			value: a
		},
		{
			did: "set-3-11",
			siid: 3,
			piid: 11,
			value: 0
		},
		{
			did: "set-3-12",
			siid: 3,
			piid: 12,
			value: `${n},${+!!r},${i},${a}`
		}
	]);
}
function We(e, t, n, r, i) {
	return Z(e, t, [
		{
			did: "set-2-4",
			siid: 2,
			piid: 4,
			value: 99
		},
		{
			did: "set-2-5",
			siid: 2,
			piid: 5,
			value: n
		},
		{
			did: "set-2-6",
			siid: 2,
			piid: 6,
			value: r
		},
		{
			did: "set-3-1",
			siid: 3,
			piid: 1,
			value: i
		},
		{
			did: "set-3-11",
			siid: 3,
			piid: 11,
			value: 1
		},
		{
			did: "set-3-13",
			siid: 3,
			piid: 13,
			value: `99,${+!!n},${r},${i}`
		}
	]);
}
//#endregion
//#region src/dialog-content.ts
function Q(e, t, n) {
	let r = Number(t ? e.states[t]?.state : void 0);
	return Number.isFinite(r) ? r : n;
}
var Ge = class extends G {
	static {
		this.properties = {
			hass: { attribute: !1 },
			entityId: { attribute: !1 },
			pollInterval: { attribute: !1 },
			cardMode: { attribute: !1 },
			showControls: { attribute: !1 },
			showPresets: { attribute: !1 },
			showPreferences: { attribute: !1 },
			presetIcons: { attribute: !1 },
			_armedKey: { state: !0 },
			_busy: { state: !0 },
			_error: { state: !0 },
			_target: { state: !0 },
			_keep: { state: !0 },
			_keepTemperature: { state: !0 },
			_keepDuration: { state: !0 }
		};
	}
	static {
		this.styles = Ie;
	}
	constructor() {
		super(), this._armedUntil = 0, this._busy = !1, this.entityId = "", this.pollInterval = 5, this.cardMode = !1, this.showControls = !0, this.showPresets = !0, this.showPreferences = !0;
	}
	connectedCallback() {
		super.connectedCallback(), this._pollTimer = window.setInterval(() => this._refresh(), this.pollInterval * 1e3), queueMicrotask(() => this._refresh());
	}
	disconnectedCallback() {
		window.clearTimeout(this._armTimer), window.clearInterval(this._pollTimer), super.disconnectedCallback();
	}
	_resolve() {
		return this.hass && this.entityId ? Fe(this.hass, this.entityId) : void 0;
	}
	_refresh() {
		let e = this._resolve()?.sourceMain;
		e && this.hass.callService("homeassistant", "update_entity", { entity_id: e }).catch(() => void 0);
	}
	_press(e) {
		return this.hass.callService("button", "press", { entity_id: e });
	}
	_startManual(e, t, n, r, i) {
		return e.start ? this._press(e.start) : Ue(this.hass, e.sourceMain, t, n, r, i);
	}
	_startBoil(e, t, n, r) {
		return e.boil ? this._press(e.boil) : We(this.hass, e.sourceMain, t, n, r);
	}
	_startPreset(e, t) {
		return e.program ? this.hass.callService("select", "select_option", {
			entity_id: e.program,
			option: t.name
		}) : He(this.hass, e.sourceMain, t);
	}
	_stop(e) {
		return e.stop ? this._press(e.stop) : Promise.reject(/* @__PURE__ */ Error("Stop is unavailable"));
	}
	_openTemperatureHistory(e) {
		let t = this.entityId.startsWith("water_heater.") ? this.entityId : e.main;
		n(this, "hass-more-info", {
			entityId: t,
			view: "history"
		});
	}
	_values(e) {
		let t = this.hass.states[e.main]?.attributes ?? {};
		return {
			target: (this._target ?? Number(t.temperature)) || 70,
			keep: this._keep ?? (e.keepWarm ? this.hass.states[e.keepWarm]?.state === "on" : !1),
			keepTemperature: this._keepTemperature ?? Q(this.hass, e.keepTemp, 40),
			duration: this._keepDuration ?? Q(this.hass, e.keepTime, 1440)
		};
	}
	_arm(e, t) {
		if (this._busy) return;
		let n = Date.now();
		if (this._armedKey === e && this._armedUntil > n) {
			window.clearTimeout(this._armTimer), this._armedKey = void 0, this._armedUntil = 0, this._run(t);
			return;
		}
		window.clearTimeout(this._armTimer), this._armedKey = e, this._armedUntil = n + ke, this._error = void 0, this._armTimer = window.setTimeout(() => {
			this._armedKey === e && (this._armedKey = void 0, this._armedUntil = 0);
		}, ke);
	}
	async _run(e) {
		this._busy = !0, this._error = void 0;
		try {
			await e();
		} catch (e) {
			this._error = e instanceof Error ? e.message : "Kettle command failed";
		} finally {
			this._busy = !1, this._armedKey = void 0, this._refresh();
		}
	}
	_switch(e, t) {
		e && this._run(() => this.hass.callService("switch", t ? "turn_on" : "turn_off", { entity_id: e }));
	}
	_setNumber(e, t) {
		e && this._run(() => this.hass.callService("number", "set_value", {
			entity_id: e,
			value: t
		}));
	}
	_toggleRow(e, t, n, r) {
		if (!e) return R;
		let i = this.hass.states[e]?.state === "on";
		return I`
      <label class="setting-row">
        <span class="setting-icon"><ha-icon icon=${t}></ha-icon></span>
        <span class="setting-copy">
          <strong>${n}</strong>${r ? I`<small>${r}</small>` : R}
        </span>
        <input
          class="switch-input"
          type="checkbox"
          .checked=${i}
          @change=${(t) => this._switch(e, t.currentTarget.checked)}
        />
        <span class="switch" aria-hidden="true"></span>
      </label>
    `;
	}
	_presetButton(e, t) {
		let n = this._armedKey === e.key;
		return I`
      <button
        class=${K({
			program: !0,
			armed: n
		})}
        aria-pressed=${String(n)}
        ?disabled=${this._busy}
        @click=${() => this._arm(e.key, () => this._startPreset(t, e))}
      >
        <ha-icon icon=${e.icon}></ha-icon>
        <strong>${e.name}</strong>
        <small>${n ? "Tap again" : `${e.target}°C`}</small>
      </button>
    `;
	}
	render() {
		let e = this._resolve();
		if (!e) return I`<div class="notice">
        <ha-icon icon="mdi:alert-circle"></ha-icon>Unable to resolve this kettle’s entities.
      </div>`;
		let t = this.hass.states[e.main], n = t?.attributes ?? {}, r = e.lifted ? this.hass.states[e.lifted]?.state === "on" : !1, i = Ve(t, r), a = n.current_temperature ?? n["kettle.temperature"] ?? "—", o = this._values(e), s = Number(n["function.warming_time"] ?? n["function.warming-time"]), c = Q(this.hass, e.warmingTime, Number.isFinite(s) ? s : 0), l = n["function.extended_mode"] ?? n["function.extended-mode"] ?? "", u = n["xiaomi_kettle.preset_icons"], d = ze(l, {
			...typeof u == "object" && u ? u : {},
			...this.presetIcons ?? {}
		}), f = !t || t.state === "unavailable", p = i.code === 1 || i.code === 2, m = p || i.code === 4, h = this._armedKey === "start", g = !m && this._armedKey === "boil", _ = d.find((e) => e.key === this._armedKey), v = _ ?? o, y = Number(n["function.target_mode"] ?? n["function.target-mode"]), ee = m && !i.fault && !i.lifted && Number.isFinite(y) ? Be(y, d) : void 0, te = Le(v.duration, _ ? 0 : c), b = [
			i.code === 4 && !_ ? void 0 : `Target ${v.target}°C`,
			v.keep ? `Keep ${v.keepTemperature}°C` : void 0,
			v.keep ? `${X(te)} left` : void 0
		].filter((e) => !!e).join(" · "), x = g ? "Tap again to boil" : _ ? `Tap again · ${_.name}` : ee ?? i.label;
		return I`
      <main class=${K({
			shell: !0,
			"card-mode": this.cardMode
		})}>
        <section class=${K({
			hero: !0,
			[i.tone]: !0
		})}>
          <div class="temperature">
            <button
              class="temperature-value"
              type="button"
              aria-label="Open temperature history"
              title="Open temperature history"
              @click=${() => this._openTemperatureHistory(e)}
            >
              <strong>${a}<small>°C</small></strong>
            </button>
            <div class="temperature-copy">
              <div
                class=${K({
			status: !0,
			"action-armed": g || !!_
		})}
              >
                <span class="status-dot"></span
                ><span class="status-label">${x}</span>
              </div>
              <div class=${K({
			"hero-meta": !0,
			preview: !!_
		})}>
                ${b}
              </div>
            </div>
          </div>
          <div class="kettle-action">
            <button
              class=${K({
			"kettle-art": !0,
			armed: g
		})}
              type="button"
              aria-label=${m ? "Stop kettle" : g ? "Tap again to boil" : "Boil"}
              title=${m ? "Stop kettle" : g ? "Tap again to boil" : "Boil"}
              aria-pressed=${String(!m && g)}
              ?disabled=${this._busy || f || m && !e.stop}
              @click=${() => {
			if (m) {
				this._run(() => this._stop(e));
				return;
			}
			this._arm("boil", () => {
				let t = this._values(e);
				return this._startBoil(e, t.keep, t.keepTemperature, t.duration);
			});
		}}
            >
              <ha-icon icon=${p || g ? "mdi:kettle-steam" : "mdi:kettle"}></ha-icon>
            </button>
          </div>
        </section>

        ${this._error ? I`<div class="notice">
                <ha-icon icon="mdi:alert-circle"></ha-icon>${this._error}
              </div>` : R}

        <section class=${K({ offline: f })}>
          ${this.showPresets ? I`
                  <div class="programs">
                    ${d.length ? d.map((t) => this._presetButton(t, e)) : I`<p class="empty-programs">No kettle presets available</p>`}
                  </div>
                ` : R}
          ${this.cardMode ? R : I`<label class="control-card">
                    <span class="control-copy">
                      <strong>Target temperature</strong><small>Choose from 40 to 99°C</small>
                    </span>
                    <span class="control-value">${o.target}°C</span>
                    <input
                      type="range"
                      min="40"
                      max="99"
                      step="1"
                      .value=${String(o.target)}
                      aria-label="Target temperature"
                      @input=${(e) => this._target = Number(e.currentTarget.value)}
                      @change=${() => void this._run(() => this.hass.callService("water_heater", "set_temperature", {
			entity_id: e.main,
			temperature: this._values(e).target
		}))}
                    />
                  </label>

                  <div class="keep-grid">
                    <label class="control-card switch-card">
                      <span class="setting-icon"><ha-icon icon="mdi:heat-wave"></ha-icon></span>
                      <span class="control-copy">
                        <strong>Keep warm</strong><small>Maintain temperature after heating</small>
                      </span>
                      <input
                        class="switch-input"
                        type="checkbox"
                        .checked=${o.keep}
                        @change=${(t) => {
			this._keep = t.currentTarget.checked, this._switch(e.keepWarm, this._keep);
		}}
                      />
                      <span class="switch" aria-hidden="true"></span>
                    </label>

                    <label
                      class=${K({
			"control-card": !0,
			disabled: !o.keep
		})}
                      aria-disabled=${String(!o.keep)}
                    >
                      <span class="control-copy"
                        ><strong>Temperature</strong><small>Keep-warm target</small></span
                      >
                      <span class="control-value">${o.keepTemperature}°C</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        .value=${String(o.keepTemperature)}
                        aria-label="Keep-warm temperature"
                        ?disabled=${this._busy || !o.keep}
                        @input=${(e) => this._keepTemperature = Number(e.currentTarget.value)}
                        @change=${() => this._setNumber(e.keepTemp, this._values(e).keepTemperature)}
                      />
                    </label>

                    <label
                      class=${K({
			"control-card": !0,
			disabled: !o.keep
		})}
                      aria-disabled=${String(!o.keep)}
                    >
                      <span class="control-copy"
                        ><strong>Duration</strong><small>1 to 24 hours</small></span
                      >
                      <span class="control-value">${X(o.duration)}</span>
                      <input
                        type="range"
                        min="60"
                        max="1440"
                        step="30"
                        .value=${String(o.duration)}
                        aria-label="Keep-warm duration"
                        ?disabled=${this._busy || !o.keep}
                        @input=${(e) => this._keepDuration = Number(e.currentTarget.value)}
                        @change=${() => this._setNumber(e.keepTime, this._values(e).duration)}
                      />
                    </label>
                  </div>`}
          ${this.showControls ? I`<div class=${K({
			actions: !0,
			"card-actions": this.cardMode
		})}>
                  ${this.cardMode ? R : I`<button
                          class=${K({
			button: !0,
			primary: !0,
			armed: h
		})}
                          aria-pressed=${String(h)}
                          ?disabled=${this._busy}
                          @click=${() => this._arm("start", () => {
			let t = this._values(e);
			return this._startManual(e, t.target, t.keep, t.keepTemperature, t.duration);
		})}
                        >
                          <ha-icon
                            icon=${h ? "mdi:gesture-double-tap" : "mdi:fire"}
                          ></ha-icon>
                          ${h ? "Tap again" : "Start"}
                        </button>`}
                  <button
                    class=${K({
			button: !0,
			boil: !0,
			armed: g
		})}
                    aria-pressed=${String(g)}
                    ?disabled=${this._busy}
                    @click=${() => this._arm("boil", () => {
			let t = this._values(e);
			return this._startBoil(e, t.keep, t.keepTemperature, t.duration);
		})}
                  >
                    <ha-icon
                      icon=${g ? "mdi:gesture-double-tap" : "mdi:kettle-steam"}
                    ></ha-icon>
                    ${g ? "Tap again" : "Boil"}
                  </button>
                  <button
                    class="button stop"
                    ?disabled=${this._busy || !e.stop}
                    @click=${() => e.stop && void this._run(() => this._stop(e))}
                  >
                    <ha-icon icon="mdi:stop-circle-outline"></ha-icon>Stop
                  </button>
                </div>` : R}
          ${this.showPreferences ? I`<details>
                  <summary>
                    <ha-icon icon="mdi:cog-outline"></ha-icon>Preferences
                    <ha-icon class="chevron" icon="mdi:chevron-down"></ha-icon>
                  </summary>
                  <div class="settings">
                    <div class="setting-row">
                      <span class="setting-icon">
                        <ha-icon
                          icon=${r ? "mdi:kettle-alert" : "mdi:kettle-outline"}
                        ></ha-icon>
                      </span>
                      <span class="setting-copy">
                        <strong>Kettle position</strong>
                        <small>${r ? "Lifted from base" : "Seated on base"}</small>
                      </span>
                    </div>
                    ${e.warmingTime ? I`<div class="setting-row">
                            <span class="setting-icon"
                              ><ha-icon icon="mdi:timer-sand"></ha-icon
                            ></span>
                            <span class="setting-copy">
                              <strong>Kept warm</strong
                              ><small>${X(c)}</small>
                            </span>
                          </div>` : R}
                    ${this._toggleRow(e.boilReminder, "mdi:bell-ring-outline", "Boiling reminder")}
                    ${this._toggleRow(e.warmReminder, "mdi:bell-ring-outline", "Keep-warm reminder")}
                    ${this._toggleRow(e.liftMemory, "mdi:memory", "Resume after lifting", "Remember the active keep-warm temperature")}
                    ${this._toggleRow(e.customKnob, "mdi:knob", "Custom knob temperature")}
                    ${this._toggleRow(e.noDisturb, "mdi:moon-waning-crescent", "Do not disturb")}
                  </div>
                </details>` : R}
        </section>
      </main>
    `;
	}
};
customElements.get("xiaomi-kettle-dialog-content") || customElements.define(J, Ge);
//#endregion
//#region src/editor.ts
var Ke = [
	{
		name: "entity",
		required: !0,
		selector: { entity: { domain: "water_heater" } }
	},
	{
		name: "name",
		selector: { text: {} }
	},
	{
		name: "icon",
		selector: { icon: {} }
	},
	{
		name: "show_presets",
		selector: { boolean: {} }
	},
	{
		name: "show_controls",
		selector: { boolean: {} }
	}
], qe = {
	entity: "Kettle entity",
	name: "Title",
	icon: "Icon",
	show_presets: "Show programs",
	show_controls: "Show Boil and Stop controls"
}, Je = class extends G {
	constructor(...e) {
		super(...e), this._config = {
			type: "custom:xiaomi-kettle-card",
			entity: "",
			show_controls: !0,
			show_presets: !0
		};
	}
	static {
		this.properties = {
			hass: { attribute: !1 },
			_config: { state: !0 }
		};
	}
	static {
		this.styles = l`
    ha-form {
      display: block;
      padding: 4px 0;
    }

    .preset-icons {
      margin-top: 18px;
      padding-top: 14px;
      border-top: 1px solid var(--divider-color);
    }

    h3,
    p {
      margin: 0;
    }

    h3 {
      font-size: 15px;
      font-weight: 500;
    }

    p {
      margin-top: 3px;
      color: var(--secondary-text-color);
      font-size: 12px;
    }

    .preset-row {
      display: grid;
      grid-template-columns: 32px minmax(0, 1fr) minmax(150px, 46%);
      align-items: center;
      gap: 10px;
      min-width: 0;
      padding: 8px 0;
    }

    .preset-row > ha-icon {
      color: var(--primary-color);
    }

    .preset-copy {
      min-width: 0;
    }

    .preset-copy strong,
    .preset-copy small {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .preset-copy small {
      color: var(--secondary-text-color);
    }

    ha-selector {
      min-width: 0;
    }

    @media (max-width: 420px) {
      .preset-row {
        grid-template-columns: 28px minmax(0, 1fr);
      }

      .preset-row ha-selector {
        grid-column: 2;
      }
    }
  `;
	}
	setConfig(e) {
		this._config = {
			show_controls: !0,
			show_presets: !0,
			...e
		};
	}
	_label(e) {
		return qe[e.name] ?? String(e.name);
	}
	_valueChanged(e) {
		let t = {
			...this._config,
			...e.detail.value
		};
		t.name || delete t.name, t.icon || delete t.icon, this._setConfig(t);
	}
	_setConfig(e) {
		this._config = e, n(this, "config-changed", { config: e });
	}
	_presets() {
		if (!this.hass || !this._config.entity) return [];
		let e = Fe(this.hass, this._config.entity);
		if (!e) return [];
		let t = this.hass.states[e.main]?.attributes ?? {}, n = this.hass.states[e.sourceMain]?.attributes ?? {}, r = t["function.extended_mode"] ?? t["function.extended-mode"] ?? n["function.extended_mode"] ?? n["function.extended-mode"], i = t["xiaomi_kettle.preset_icons"];
		return ze(r, {
			...typeof i == "object" && i ? i : {},
			...this._config.preset_icons ?? {}
		});
	}
	_presetIconChanged(e, t) {
		let n = { ...this._config.preset_icons }, r = t.detail.value?.trim();
		r ? n[e.name] = r : delete n[e.name];
		let i = {
			...this._config,
			preset_icons: n
		};
		Object.keys(n).length || delete i.preset_icons, this._setConfig(i);
	}
	render() {
		let e = this._presets();
		return I`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${Ke}
        .computeLabel=${this._label}
        @value-changed=${this._valueChanged}
      ></ha-form>
      ${e.length ? I`<section class="preset-icons">
              <h3>Program icons</h3>
              <p>Choose an icon for each preset discovered from Xiaomi Home.</p>
              ${e.map((e) => I`<div class="preset-row">
                    <ha-icon icon=${e.icon}></ha-icon>
                    <span class="preset-copy">
                      <strong>${e.name}</strong>
                      <small>${e.target}°C</small>
                    </span>
                    <ha-selector
                      .hass=${this.hass}
                      .selector=${{ icon: {} }}
                      .value=${this._config.preset_icons?.[e.name] ?? e.icon}
                      .label=${`${e.name} icon`}
                      @value-changed=${(t) => this._presetIconChanged(e, t)}
                    ></ha-selector>
                  </div>`)}
            </section>` : ""}
    `;
	}
};
customElements.get("xiaomi-kettle-card-editor") || customElements.define(Ee, Je);
//#endregion
//#region src/card.ts
var Ye = class extends G {
	static {
		this.properties = {
			hass: { attribute: !1 },
			_config: { state: !0 }
		};
	}
	static {
		this.styles = l`
    ha-card {
      min-width: 0;
      overflow: hidden;
      border-radius: var(--ha-card-border-radius, 12px);
    }

    .header {
      display: flex;
      align-items: center;
      gap: 11px;
      width: 100%;
      padding: 14px 16px 4px;
      border: 0;
      color: var(--primary-text-color);
      background: transparent;
      font: inherit;
      text-align: left;
      cursor: pointer;
    }

    .header > ha-icon:first-child {
      color: var(--primary-color);
      --mdc-icon-size: 25px;
    }

    .header-copy {
      flex: 1;
      min-width: 0;
    }

    .header-copy strong {
      display: block;
      overflow: hidden;
      font-size: 15px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .error {
      display: block;
      padding: 16px;
      color: var(--error-color);
    }

    .loading {
      display: grid;
      gap: 12px;
      padding: 16px;
    }

    .loading-header {
      display: flex;
      align-items: center;
      gap: 11px;
      color: var(--primary-text-color);
    }
  `;
	}
	static getStubConfig() {
		return {
			type: `custom:${q}`,
			entity: "",
			show_controls: !0,
			show_presets: !0
		};
	}
	static getConfigElement() {
		return document.createElement(Ee);
	}
	setConfig(e) {
		if (!e.entity && e.entity !== "") throw Error("Please configure a kettle entity.");
		this._config = {
			show_controls: !0,
			show_presets: !0,
			...e
		};
	}
	getCardSize() {
		return 3 + (this._config?.show_presets === !1 ? 0 : 2) + (this._config?.show_controls === !1 ? 0 : 1);
	}
	_open() {
		this._config?.entity && n(this, "hass-more-info", { entityId: this._config.entity });
	}
	render() {
		let e = this._config?.entity;
		if (!e) return I`<ha-card class="error">Select a yunmi.kettle.v19 water heater entity.</ha-card>`;
		let t = this.hass?.states?.[e];
		if (!t) return I`<ha-card class="loading" aria-label="Kettle is loading">
        <div class="loading-header">
          <ha-icon icon=${this._config?.icon ?? "mdi:kettle-outline"}></ha-icon>
          <strong>${this._config?.name ?? "Kettle"}</strong>
        </div>
        <hui-warning>Home Assistant is starting. Not everything may be available yet.</hui-warning>
      </ha-card>`;
		let n = this._config?.name ?? t.attributes.friendly_name ?? "Kettle", r = Number(t.attributes["kettle.status"]), i = r === 1 || r === 2, a = this._config?.icon ?? (i ? "mdi:kettle-steam" : "mdi:kettle");
		return I`
      <ha-card>
        <button class="header" type="button" @click=${this._open} aria-label="Open kettle dialog">
          <ha-icon icon=${a}></ha-icon>
          <span class="header-copy"><strong>${n}</strong></span>
        </button>
        <xiaomi-kettle-dialog-content
          .hass=${this.hass}
          .entityId=${e}
          .cardMode=${!0}
          .showControls=${this._config?.show_controls !== !1}
          .showPresets=${this._config?.show_presets !== !1}
          .showPreferences=${!1}
          .presetIcons=${this._config?.preset_icons}
        ></xiaomi-kettle-dialog-content>
      </ha-card>
    `;
	}
};
customElements.get("xiaomi-kettle-card") || customElements.define(q, Ye), window.customCards = window.customCards ?? [], window.customCards.some((e) => e.type === "xiaomi-kettle-card") || window.customCards.push({
	type: q,
	name: "Xiaomi Kettle Card",
	description: "Status and controls for Xiaomi Smart Kettle 2 Pro",
	documentationURL: De,
	preview: !0,
	getEntitySuggestion: (e, t) => {
		let n = e.entities?.[t]?.device_id, r = n ? e.devices?.[n]?.model?.toLowerCase() : void 0, i = e.states?.[t]?.attributes?.["xiaomi_kettle.source_entity_id"];
		return r === "yunmi.kettle.v19" || typeof i == "string" ? { config: {
			type: `custom:${q}`,
			entity: t,
			show_controls: !0,
			show_presets: !0
		} } : null;
	}
});
//#endregion
//#region src/more-info-interceptor.ts
function Xe(e, t) {
	for (let n of Array.from(e.children)) {
		if (n === t) continue;
		let e = n;
		e.hidden = !1, e.inert = !1, e.removeAttribute("aria-hidden"), e.style.removeProperty("display");
	}
}
function Ze(e) {
	let t = e.shadowRoot?.querySelector(".content");
	if (!t) return;
	let n = t.querySelector(`:scope > ${J}`);
	if (e.__xiaomiKettleContent !== !0 || e._currView !== "info") {
		Xe(t, n ?? void 0), n?.remove();
		return;
	}
	for (let e of Array.from(t.children)) {
		if (e === n) continue;
		let t = e;
		t.hidden = !0, t.inert = !0, t.setAttribute("aria-hidden", "true"), t.style.setProperty("display", "none", "important");
	}
	n || (n = document.createElement(J), t.append(n)), n.hass = e.hass, n.entityId = e.__xiaomiKettleSourceEntity ?? "";
}
async function Qe() {
	await customElements.whenDefined("ha-more-info-dialog");
	let e = customElements.get("ha-more-info-dialog")?.prototype;
	if (!e || e.__xiaomiKettlePatched) return;
	let t = e.showDialog, n = e.updated;
	e.__xiaomiKettlePatched = !0, e.showDialog = function(e) {
		let n = Pe(e.entityId ? this.hass : void 0, e.entityId);
		return this.__xiaomiKettleContent = n, this.__xiaomiKettleSourceEntity = n ? e.entityId : void 0, t.call(this, e);
	}, e.updated = function(e) {
		let t = n?.call(this, e);
		return queueMicrotask(() => Ze(this)), t;
	};
}
//#endregion
//#region src/notification-icon-interceptor.ts
var $ = "persistent-notification-item", $e = "xiaomi_kettle_", et = "/xiaomi-kettle/icon.png", tt = "data-xiaomi-kettle-icon";
function nt(e) {
	let t = e.shadowRoot;
	if (!t) return;
	let n = t.querySelector(`img[${tt}]`);
	if (e.notification?.notification_id?.startsWith($e) !== !0) {
		n?.remove();
		return;
	}
	if (n) return;
	let r = t.querySelector("[slot=\"header\"]");
	if (!r?.parentElement) return;
	let i = document.createElement("img");
	i.setAttribute(tt, ""), i.setAttribute("aria-hidden", "true"), i.setAttribute("slot", "header"), i.src = et, i.alt = "", i.style.cssText = [
		"width:32px",
		"height:32px",
		"object-fit:contain",
		"vertical-align:middle",
		"margin-inline-end:10px"
	].join(";"), r.before(i);
}
function rt(e) {
	for (let t of e.querySelectorAll("*")) t.localName === $ && nt(t), t.shadowRoot && rt(t.shadowRoot);
}
async function it() {
	await customElements.whenDefined($);
	let e = customElements.get($)?.prototype;
	if (!e || e.__xiaomiKettleIconPatched) return;
	let t = e.updated;
	e.__xiaomiKettleIconPatched = !0, e.updated = function(e) {
		let n = t?.call(this, e);
		return queueMicrotask(() => nt(this)), n;
	}, queueMicrotask(() => rt(document));
}
//#endregion
//#region src/startup-recovery.ts
function at(e = document) {
	let t = /* @__PURE__ */ new Set(), n = (e) => {
		e.querySelectorAll("hui-error-card").forEach((e) => t.add(e)), e.querySelectorAll("*").forEach((e) => {
			e.shadowRoot && n(e.shadowRoot);
		});
	};
	n(e), t.forEach((e) => e.dispatchEvent(new CustomEvent("ll-rebuild", {
		bubbles: !0,
		composed: !0
	})));
}
function ot() {
	for (let e of [
		0,
		250,
		1e3,
		2500
	]) window.setTimeout(() => at(), e);
}
Qe(), it(), ot(), console.info("%c XIAOMI-KETTLE-CARD %c 0.1.0 ", "color:white;background:#03a9f4;font-weight:700", "color:#03a9f4;background:transparent");
//#endregion
