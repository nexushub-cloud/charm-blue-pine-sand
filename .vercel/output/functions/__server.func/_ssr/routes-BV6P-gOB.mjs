import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as Menu, t as X } from "../_libs/lucide-react.mjs";
import { n as previewPathPrefix } from "./router-Db3z0gxC.mjs";
import { a as DialogOverlay, i as DialogDescription, n as DialogClose, o as DialogPortal, r as DialogContent, s as DialogTitle, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BV6P-gOB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function parseHash(hash) {
	const parts = hash.replace(/^#/, "").split("/").filter(Boolean);
	const head = parts[0] ?? "home";
	if (head === "files") return {
		page: "files",
		fileId: parts[1]
	};
	if (head === "shop") {
		if (parts[1] === "game" && parts[2]) return {
			page: "shop",
			gameId: parts[2]
		};
		if (parts[1] === "item" && parts[2]) return {
			page: "shop",
			productId: parts[2]
		};
		return { page: "shop" };
	}
	return { page: "home" };
}
function go(hash, opts) {
	const next = hash.startsWith("#") ? hash : `#${hash}`;
	if (window.location.hash === next) window.dispatchEvent(new HashChangeEvent("hashchange"));
	else window.location.hash = next;
	if (!opts?.keepScroll) window.scrollTo({
		top: 0,
		behavior: "smooth"
	});
}
function useHashView() {
	const [view, setView] = (0, import_react.useState)({ page: "home" });
	(0, import_react.useEffect)(() => {
		const read = () => setView(parseHash(window.location.hash));
		read();
		window.addEventListener("hashchange", read);
		return () => window.removeEventListener("hashchange", read);
	}, []);
	return view;
}
function assetUrl(path) {
	const normalized = path.startsWith("/") ? path : `/${path}`;
	if (typeof window === "undefined") return normalized;
	return `${previewPathPrefix(window.location.hostname, window.location.pathname) ?? ""}${normalized}`;
}
function safeHref(value) {
	if (value.startsWith("/") && !value.startsWith("//")) return assetUrl(value);
	try {
		const url = new URL(value);
		if (url.protocol === "https:" || url.protocol === "http:") return url.toString();
	} catch {
		return null;
	}
	return null;
}
function shareUrl(fileId) {
	const url = new URL(window.location.href);
	url.hash = `files/${fileId}`;
	return url.toString();
}
function isValidKey(file, input) {
	return input.trim() === file.key;
}
async function copyText(value) {
	try {
		await navigator.clipboard.writeText(value);
		return true;
	} catch {
		try {
			const el = document.createElement("textarea");
			el.value = value;
			el.setAttribute("readonly", "");
			el.style.position = "fixed";
			el.style.left = "-9999px";
			document.body.appendChild(el);
			el.select();
			const ok = document.execCommand("copy");
			el.remove();
			return ok;
		} catch {
			return false;
		}
	}
}
function isDatabase(value) {
	if (!value || typeof value !== "object") return false;
	const row = value;
	return Boolean(row.brand && row.gates && Array.isArray(row.files) && Array.isArray(row.games) && Array.isArray(row.products));
}
function useDatabase() {
	const [state, setState] = (0, import_react.useState)({
		status: "loading",
		data: null,
		message: ""
	});
	(0, import_react.useEffect)(() => {
		let cancel = false;
		fetch(assetUrl("/database.json")).then(async (response) => {
			if (!response.ok) throw new Error("Không đọc được database.json");
			const json = await response.json();
			if (!isDatabase(json)) throw new Error("database.json thiếu file, game hoặc sản phẩm");
			return json;
		}).then((data) => {
			if (!cancel) setState({
				status: "ready",
				data,
				message: ""
			});
		}).catch((error) => {
			if (cancel) return;
			const message = error instanceof Error ? error.message : "Lỗi dữ liệu";
			setState({
				status: "error",
				data: null,
				message
			});
		});
		return () => {
			cancel = true;
		};
	}, []);
	return state;
}
function useKeyIssue(waitSeconds) {
	const [issues, setIssues] = (0, import_react.useState)({});
	const [now, setNow] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (!Object.values(issues).some((item) => !item.revealed)) return;
		const tick = () => {
			const time = Date.now();
			setNow(time);
			setIssues((prev) => {
				let changed = false;
				const next = { ...prev };
				for (const id of Object.keys(next)) {
					const item = next[id];
					if (item && !item.revealed && time >= item.deadline) {
						next[id] = {
							...item,
							revealed: true
						};
						changed = true;
					}
				}
				return changed ? next : prev;
			});
		};
		tick();
		const id = window.setInterval(tick, 250);
		return () => window.clearInterval(id);
	}, [issues]);
	const start = (fileId) => {
		setNow(Date.now());
		setIssues((prev) => {
			if (prev[fileId]) return prev;
			return {
				...prev,
				[fileId]: {
					deadline: Date.now() + waitSeconds * 1e3,
					revealed: false
				}
			};
		});
	};
	const status = (fileId) => {
		const item = issues[fileId];
		if (!item) return {
			state: "idle",
			remaining: waitSeconds
		};
		if (item.revealed) return {
			state: "ready",
			remaining: 0
		};
		return {
			state: "wait",
			remaining: Math.max(0, Math.ceil((item.deadline - now) / 1e3))
		};
	};
	return {
		start,
		status
	};
}
var LINKS = [
	{
		id: "home",
		hash: "home",
		label: "Home"
	},
	{
		id: "files",
		hash: "files",
		label: "FileShare"
	},
	{
		id: "shop",
		hash: "shop",
		label: "Shop"
	}
];
var variantClass = {
	signal: "bg-signal text-on-signal hover:bg-ink",
	ink: "bg-ink text-paper hover:bg-signal",
	line: "border border-line bg-paper text-ink hover:border-ink",
	ghost: "text-ink hover:bg-paper"
};
function buttonClass(variant = "signal", extra = "") {
	return `inline-flex min-h-11 items-center justify-center gap-2 px-4 text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:cursor-not-allowed disabled:opacity-50 ${variantClass[variant]} ${extra}`;
}
function Button({ variant = "signal", className = "", type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: buttonClass(variant, className),
		...props
	});
}
var fieldClass = "min-h-11 w-full border border-line bg-canvas px-3 text-sm text-ink outline-none focus-visible:border-ink";
function SiteHeader({ view }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const jump = (hash) => {
		setOpen(false);
		go(hash);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-30 border-t-4 border-b border-t-signal border-b-line bg-canvas/95 backdrop-blur",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => jump("home"),
					className: "text-left",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-display text-2xl leading-none text-ink",
						children: ["MT MEDIA", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "italic text-signal",
							children: ".Client"
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "hidden items-center gap-1 md:flex",
					"aria-label": "Chính",
					children: LINKS.map((link) => {
						const active = view.page === link.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => jump(link.hash),
							className: `min-h-11 px-3 text-sm font-semibold ${active ? "text-signal" : "text-ink"}`,
							"aria-current": active ? "page" : void 0,
							children: link.label
						}, link.id);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "inline-flex size-11 items-center justify-center border border-line md:hidden",
					"aria-label": open ? "Đóng menu" : "Mở menu",
					"aria-expanded": open,
					onClick: () => setOpen((value) => !value),
					children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
				})
			]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			className: "border-t border-line px-4 py-3 md:hidden",
			"aria-label": "Di động",
			children: LINKS.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => jump(link.hash),
				className: "flex min-h-11 w-full items-center text-left text-base font-semibold",
				children: link.label
			}, link.id))
		}) : null]
	});
}
function SiteFooter({ db }) {
	const zalo = db ? safeHref(db.brand.zalo) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
		className: "mt-16 border-t border-line",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-display text-3xl leading-none",
					children: ["MT MEDIA", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "italic text-signal",
						children: ".Client"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: "Kho file có khóa và gian hàng tài khoản cho client."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold tracking-widest text-muted",
					children: "MENU"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 grid",
					children: LINKS.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => go(link.hash),
						className: "min-h-11 text-left text-sm font-semibold",
						children: link.label
					}, link.id))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold tracking-widest text-muted",
					children: "LIÊN HỆ"
				}), zalo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: zalo,
					target: "_blank",
					rel: "noopener noreferrer",
					className: `${buttonClass("ink")} mt-3`,
					children: db?.brand.zaloLabel
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: "Số Zalo nằm trong dữ liệu riêng."
				})] })
			]
		})
	});
}
var CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function randomCode(length = 5) {
	const buf = new Uint32Array(length);
	crypto.getRandomValues(buf);
	let code = "";
	for (let i = 0; i < length; i += 1) code += CHARS[(buf[i] ?? 0) % 32];
	return code;
}
function paintCaptcha(canvas, code) {
	const style = getComputedStyle(document.documentElement);
	const paper = style.getPropertyValue("--color-paper").trim() || "#fffdf8";
	const ink = style.getPropertyValue("--color-ink").trim() || "#1c1915";
	const signal = style.getPropertyValue("--color-signal").trim() || "#9e1b12";
	const line = style.getPropertyValue("--color-line").trim() || "#e4dccb";
	const dpr = Math.min(window.devicePixelRatio || 1, 2);
	const width = canvas.clientWidth || 320;
	const height = canvas.clientHeight || 96;
	canvas.width = Math.floor(width * dpr);
	canvas.height = Math.floor(height * dpr);
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	ctx.fillStyle = paper;
	ctx.fillRect(0, 0, width, height);
	ctx.strokeStyle = line;
	ctx.lineWidth = 1;
	for (let i = 0; i < 7; i += 1) {
		ctx.beginPath();
		ctx.moveTo(Math.random() * width, Math.random() * height);
		ctx.lineTo(Math.random() * width, Math.random() * height);
		ctx.stroke();
	}
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.font = "700 32px Manrope, sans-serif";
	const gap = width / (code.length + 1);
	for (let i = 0; i < code.length; i += 1) {
		ctx.save();
		ctx.translate(gap * (i + 1), height / 2);
		ctx.rotate((Math.random() - .5) * .6);
		ctx.fillStyle = i % 2 === 0 ? ink : signal;
		ctx.fillText(code[i] ?? "", 0, 0);
		ctx.restore();
	}
}
function RobotCheck({ onPass }) {
	const canvasRef = (0, import_react.useRef)(null);
	const codeRef = (0, import_react.useRef)("");
	const [human, setHuman] = (0, import_react.useState)(false);
	const [nonce, setNonce] = (0, import_react.useState)(0);
	const [value, setValue] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!human) return;
		const canvas = canvasRef.current;
		if (!canvas) return;
		const code = randomCode();
		codeRef.current = code;
		const draw = () => paintCaptcha(canvas, code);
		draw();
		const frame = requestAnimationFrame(draw);
		return () => cancelAnimationFrame(frame);
	}, [human, nonce]);
	const submit = () => {
		if (value.trim().toUpperCase() !== codeRef.current) {
			setError("Mã robot chưa đúng. Hãy nhìn hình và nhập lại.");
			setValue("");
			setNonce((item) => item + 1);
			return;
		}
		onPass();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: (event) => {
			event.preventDefault();
			if (human) submit();
		},
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex min-h-16 items-center justify-between gap-4 border border-line bg-paper px-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-3 text-sm font-semibold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						className: "size-5 accent-signal",
						checked: human,
						onChange: (event) => {
							setHuman(event.target.checked);
							setError("");
						}
					}), "Tôi không phải robot"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-right",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-display text-xl leading-none",
						children: "MT"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted",
						children: "xác minh"
					})]
				})]
			}),
			human ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
						ref: canvasRef,
						className: "h-24 w-full border border-line bg-paper",
						"aria-label": "Mã xác minh robot"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sr-only",
								children: "Nhập mã trên hình"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: fieldClass,
								value,
								autoComplete: "off",
								autoCapitalize: "characters",
								spellCheck: false,
								placeholder: "Nhập mã trên hình",
								onChange: (event) => setValue(event.target.value.toUpperCase())
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "line",
							onClick: () => setNonce((item) => item + 1),
							children: "Đổi mã"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Xác nhận robot"
					})
				]
			}) : null,
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "text-sm text-signal",
				children: error
			}) : null
		]
	});
}
function Countdown({ seconds, onDone }) {
	const [left, setLeft] = (0, import_react.useState)(seconds);
	const done = (0, import_react.useRef)(onDone);
	done.current = onDone;
	(0, import_react.useEffect)(() => {
		const started = Date.now();
		const id = window.setInterval(() => {
			const remain = Math.max(0, seconds - Math.floor((Date.now() - started) / 1e3));
			setLeft(remain);
			if (remain <= 0) {
				window.clearInterval(id);
				done.current();
			}
		}, 200);
		return () => window.clearInterval(id);
	}, [seconds]);
	const progress = seconds === 0 ? 100 : (seconds - left) / seconds * 100;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border border-line bg-paper p-6 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold text-muted",
				children: "Đang chờ"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 font-display text-7xl leading-none",
				"aria-live": "polite",
				children: left
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "Giây nữa mới tới bước nhập key."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 h-1 bg-line",
				role: "progressbar",
				"aria-valuemin": 0,
				"aria-valuemax": seconds,
				"aria-valuenow": seconds - left,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full bg-signal",
					style: { width: `${progress}%` }
				})
			})
		]
	});
}
function KeyPanel({ file, status, onStart, showBuy, buyUrl, buyLabel, onUse }) {
	const [copied, setCopied] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3 border border-line bg-paper p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-semibold",
				children: "Lấy key xác minh"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: status.state === "ready" ? "Key đã mã hóa Base64. Dán vào ô xác minh để tải file." : `Chờ ${status.remaining} giây. Key trả về là chuỗi Base64.`
			})] }),
			status.state === "idle" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: onStart,
				children: [
					"Lấy key xác minh · ",
					status.remaining,
					"s"
				]
			}) : null,
			status.state === "wait" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-5xl leading-none",
				"aria-live": "polite",
				children: status.remaining
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Đang mã hóa key sang Base64. Đừng tắt trang."
			})] }) : null,
			status.state === "ready" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-widest text-brass",
						children: "KEY BASE64"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "break-all border border-line bg-canvas p-3 text-sm select-all",
						children: file.key
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "line",
							onClick: () => {
								copyText(file.key).then((ok) => setCopied(ok));
							},
							children: copied ? "Đã chép" : "Chép key"
						}), onUse ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ink",
							onClick: () => onUse(file.key),
							children: "Điền key này"
						}) : null]
					})
				]
			}) : null,
			showBuy && buyUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: buyUrl,
				target: "_blank",
				rel: "noopener noreferrer",
				className: buttonClass("ghost"),
				children: ["Mua key xác minh · ", buyLabel]
			}) : null
		]
	});
}
function Stepper({ phase }) {
	const steps = [
		{
			id: "robot",
			label: "Robot"
		},
		{
			id: "wait",
			label: "Đếm ngược"
		},
		{
			id: "unlock",
			label: "Key Base64"
		}
	];
	const current = steps.findIndex((step) => step.id === phase);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
		className: "grid grid-cols-3 gap-2",
		children: steps.map((step, index) => {
			const state = index === current ? "current" : index < current ? "done" : "next";
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: `border px-2 py-3 text-center text-xs font-semibold ${state === "current" ? "border-signal bg-signal text-on-signal" : state === "done" ? "border-ink bg-ink text-paper" : "border-line bg-paper text-muted"}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "block",
					children: ["0", index + 1]
				}), step.label]
			}, step.id);
		})
	});
}
function FileDetail({ db, file, onBack }) {
	const issue = useKeyIssue(db.gates.keyWaitSeconds);
	const keyStatus = issue.status(file.id);
	const [mode, setMode] = (0, import_react.useState)("idle");
	const [phase, setPhase] = (0, import_react.useState)("robot");
	const [keyInput, setKeyInput] = (0, import_react.useState)("");
	const [keyError, setKeyError] = (0, import_react.useState)("");
	const [opened, setOpened] = (0, import_react.useState)(false);
	const [copied, setCopied] = (0, import_react.useState)("");
	const pageLink = shareUrl(file.id);
	const fileHref = safeHref(file.link);
	const buyUrl = safeHref(db.brand.buyKeyUrl);
	(0, import_react.useEffect)(() => {
		setMode("idle");
		setPhase("robot");
		setKeyInput("");
		setKeyError("");
		setOpened(false);
		setCopied("");
	}, [file.id]);
	const copy = (label, value) => {
		copyText(value).then((ok) => setCopied(ok ? label : ""));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "min-w-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onBack,
				className: "mb-4 min-h-11 text-sm font-semibold text-signal lg:hidden",
				children: "Quay lại danh sách"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs font-semibold tracking-widest text-signal",
				children: [
					file.shareCode,
					" · ",
					file.category
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 font-display text-4xl leading-tight sm:text-5xl",
				children: file.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-sm text-muted",
				children: [
					file.format,
					" · ",
					file.size,
					" · cập nhật ",
					file.updated
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-2xl text-base",
				children: file.detail
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-3 border border-line bg-paper p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "Liên kết riêng của file"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "break-all text-sm",
							children: pageLink
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "line",
						onClick: () => copy("link", pageLink),
						children: copied === "link" ? "Đã chép" : "Chép liên kết"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Liên kết tải chỉ hiện sau 3 bước và khi key Base64 đúng."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => {
						setMode("gate");
						setPhase("robot");
						setKeyError("");
					},
					children: "Lấy file"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "line",
					onClick: () => {
						setMode("key");
					},
					children: "Lấy key xác minh"
				})]
			}),
			opened ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 border border-ink bg-paper p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold",
					children: "Đã xác minh. File mở trong phiên này."
				}), fileHref ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 break-all text-sm",
					children: file.link
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: fileHref,
					download: true,
					className: `${buttonClass("signal")} mt-3`,
					children: "Tải file"
				})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-signal",
					children: "Liên kết tải trong dữ liệu không hợp lệ."
				})]
			}) : null,
			mode === "key" && !opened ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyPanel, {
					file,
					status: keyStatus,
					onStart: () => issue.start(file.id),
					showBuy: false,
					buyUrl,
					buyLabel: db.brand.buyKeyLabel
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "Dán key này ở bước 3 khi bấm Lấy file."
				})]
			}) : null,
			mode === "gate" && !opened ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stepper, { phase }),
					phase === "robot" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RobotCheck, { onPass: () => setPhase("wait") }) : null,
					phase === "wait" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Countdown, {
						seconds: db.gates.countdownSeconds,
						onDone: () => setPhase("unlock")
					}) : null,
					phase === "unlock" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "grid gap-4",
						onSubmit: (event) => {
							event.preventDefault();
							if (!isValidKey(file, keyInput)) {
								setKeyError("Key chưa đúng. Hãy nhập đúng chuỗi Base64, có phân biệt hoa thường.");
								setOpened(false);
								return;
							}
							setKeyError("");
							setOpened(true);
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "grid gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-semibold",
									children: "Nhập key xác minh"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									className: fieldClass,
									value: keyInput,
									autoComplete: "off",
									spellCheck: false,
									placeholder: "Dán key Base64",
									onChange: (event) => setKeyInput(event.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								children: "Xác nhận và lấy file"
							}),
							keyError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								role: "alert",
								className: "text-sm text-signal",
								children: keyError
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-center text-xs font-semibold tracking-widest text-muted",
								children: "HOẶC"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyPanel, {
								file,
								status: keyStatus,
								onStart: () => issue.start(file.id),
								showBuy: true,
								buyUrl,
								buyLabel: db.brand.buyKeyLabel,
								onUse: (key) => {
									setKeyInput(key);
									setKeyError("");
								}
							})
						]
					}) : null
				]
			}) : null
		]
	});
}
function FilesView({ db, fileId }) {
	const [query, setQuery] = (0, import_react.useState)("");
	const active = db.files.find((file) => file.id === fileId) ?? null;
	const q = query.trim().toLowerCase();
	const files = db.files.filter((file) => {
		if (!q) return true;
		return file.name.toLowerCase().includes(q) || file.category.toLowerCase().includes(q) || file.shareCode.toLowerCase().includes(q);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "py-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold tracking-widest text-signal",
					children: "FILESHARE"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-5xl leading-tight",
					children: "Kho file"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-xl text-muted",
					children: "Mỗi file một tên và một liên kết. Bấm xem chi tiết, rồi lấy key hoặc đi 3 bước để tải."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "w-full sm:w-64",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "sr-only",
					children: "Tìm file"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: fieldClass,
					value: query,
					placeholder: "Tìm tên hoặc mã",
					onChange: (event) => setQuery(event.target.value)
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:pt-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: active ? "hidden lg:block" : "",
				children: files.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-8 text-sm text-muted",
					children: "Không có file khớp."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-line border-y border-line lg:border",
					children: files.map((file) => {
						const selected = file.id === active?.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => go(`files/${file.id}`),
							className: `flex w-full flex-col gap-1 px-1 py-4 text-left lg:px-4 ${selected ? "bg-paper" : ""}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-muted",
									children: [
										file.shareCode,
										" · ",
										file.category
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold",
									children: file.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm text-muted",
									children: file.summary
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-2 text-sm font-semibold text-signal",
									children: "Xem chi tiết"
								})
							]
						}) }, file.id);
					})
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: active ? "" : "hidden lg:block",
				children: active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDetail, {
					db,
					file: active,
					onBack: () => go("files")
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border border-line bg-paper p-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-3xl",
						children: "Chọn một file"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Chi tiết hiện tên, liên kết riêng, nút lấy key Base64 và nút lấy file qua 3 bước."
					})]
				})
			})]
		})]
	});
}
var STEPS = [
	{
		n: "01",
		title: "Xác minh robot",
		text: "Xác nhận bạn không phải robot và nhập mã trên hình."
	},
	{
		n: "02",
		title: "Đếm ngược",
		text: "Chờ hết giờ then chốt. Không bỏ qua được bước này."
	},
	{
		n: "03",
		title: "Key Base64",
		text: "Nhập key, mua key, hoặc tự lấy key sau 30 giây."
	}
];
function HomeView({ db }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "grid gap-10 border-b border-line py-12 lg:grid-cols-12 lg:py-16",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:col-span-7",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold text-signal",
						children: "Phòng client"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "mt-4 font-display text-5xl leading-tight text-ink sm:text-7xl",
						children: [
							"File có khóa.",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"Acc có mã."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 max-w-xl text-lg text-muted",
						children: db.brand.tagline
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex flex-wrap gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => go("files"),
							children: "Mở FileShare"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "line",
							onClick: () => go("shop"),
							children: "Vào Shop"
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "border border-line bg-paper p-6 lg:col-span-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold",
							children: "Phiếu trực"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-center gap-2 text-xs font-semibold text-signal",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "size-2 rounded-full bg-signal",
								"aria-hidden": "true"
							}), "Trực tuyến"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-6 grid grid-cols-3 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "File",
								value: String(db.files.length)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Game",
								value: String(db.games.length)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Acc",
								value: String(db.products.length)
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-6 text-sm text-muted",
						children: [
							"Key chờ ",
							db.gates.keyWaitSeconds,
							"s và được lưu dạng Base64. Đếm ngược trước khi nhập key là",
							" ",
							db.gates.countdownSeconds,
							"s."
						]
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "grid border-b border-line md:grid-cols-3",
			"aria-label": "Ba bước lấy file",
			children: STEPS.map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "border-b border-line py-8 md:border-b-0 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0 md:last:pr-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-4xl text-signal",
						children: step.n
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-3 text-lg font-semibold",
						children: step.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: step.text
					})
				]
			}, step.n))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "grid gap-10 py-12 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-4xl",
					children: "File mới"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => go("files"),
					className: "min-h-11 text-sm font-semibold text-signal",
					children: "Tất cả file"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 divide-y divide-line border-y border-line",
				children: db.files.slice(0, 4).map((file) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => go(`files/${file.id}`),
					className: "flex w-full items-center justify-between gap-4 py-4 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "block text-xs text-muted",
						children: [
							file.shareCode,
							" · ",
							file.category
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block font-semibold",
						children: file.name
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "shrink-0 text-sm text-muted",
						children: file.format
					})]
				}) }, file.id))
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-4xl",
					children: "Gian hàng"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => go("shop"),
					className: "min-h-11 text-sm font-semibold text-signal",
					children: "Vào shop"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 grid gap-3 sm:grid-cols-2",
				children: db.games.map((game) => {
					const count = db.products.filter((item) => item.gameId === game.id).length;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => go(`shop/game/${game.id}`, { keepScroll: true }),
						className: "flex min-h-24 w-full items-center gap-4 border border-line bg-paper p-4 text-left hover:border-ink",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex size-12 shrink-0 items-center justify-center bg-ink text-sm font-semibold text-paper",
							children: game.monogram
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block font-semibold",
							children: game.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-1 block text-sm text-muted",
							children: [count, " mã"]
						})] })]
					}) }, game.id);
				})
			})] })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "border-t border-line py-6 text-sm text-muted",
			children: "File, key Base64, mã acc và liên hệ nằm riêng trong database.json. Đổi số Zalo hoặc link tải ở đó rồi tải lại trang."
		})
	] });
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border border-line px-3 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-xs text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "mt-1 font-display text-3xl leading-none",
			children: value
		})]
	});
}
function ProductDialog({ product, game, onClose }) {
	const href = safeHref(product.contactUrl);
	const via = product.contactKind === "zalo" ? "Mở Zalo" : "Mở liên kết";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: (open) => {
			if (!open) onClose();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-40 bg-ink/50" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "fixed inset-x-4 top-[8vh] z-50 mx-auto max-h-[84vh] max-w-lg overflow-auto border border-line bg-paper p-6 focus:outline-none",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold tracking-widest text-signal",
					children: game?.name ?? "Shop"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "mt-2 font-display text-4xl leading-tight",
					children: product.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "mt-3 text-sm text-muted",
					children: product.detail
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-5 grid grid-cols-2 gap-3 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border border-line p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-xs text-muted",
								children: "Mã sản phẩm"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "mt-1 font-semibold tracking-wide",
								children: product.code
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border border-line p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-xs text-muted",
								children: "Giá"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "mt-1 font-semibold",
								children: product.price
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border border-line p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-xs text-muted",
								children: "Rank"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "mt-1 font-semibold",
								children: product.rank
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border border-line p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-xs text-muted",
								children: "Kho"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "mt-1 font-semibold",
								children: product.stock
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 divide-y divide-line border-y border-line",
					children: product.points.map((point) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "py-3 text-sm",
						children: point
					}, point))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 grid gap-2",
					children: [href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href,
						target: "_blank",
						rel: "noopener noreferrer",
						className: buttonClass("signal"),
						children: "Liên hệ mua / bán"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-signal",
						children: "Liên hệ chưa có liên kết hợp lệ."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							via,
							" · ",
							product.contactLabel
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
					className: `${buttonClass("line")} mt-4 w-full`,
					children: "Đóng"
				})
			]
		})] })
	});
}
function ShopView({ db, gameId, productId }) {
	const product = db.products.find((item) => item.id === productId) ?? null;
	const productGame = product ? db.games.find((game) => game.id === product.gameId) : void 0;
	(0, import_react.useEffect)(() => {
		if (!gameId) return;
		document.getElementById(`game-${gameId}`)?.scrollIntoView({
			behavior: "smooth",
			block: "start"
		});
	}, [gameId]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "border-b border-line pb-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-widest text-signal",
						children: "SHOP"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 font-display text-5xl leading-tight",
						children: "Gian hàng acc"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-xl text-muted",
						children: "Bốn mục riêng: Free Fire, Liên Quân, Roblox và Skyblock BlockMan Go. Mỗi acc một mã. Chi tiết mới hiện nút liên hệ mua hoặc bán."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "sticky top-16 z-20 -mx-4 flex gap-2 overflow-x-auto border-b border-line bg-canvas px-4 py-3",
				"aria-label": "Mục game",
				children: db.games.map((game) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => go(`shop/game/${game.id}`, { keepScroll: true }),
					className: `min-h-11 shrink-0 border px-4 text-sm font-semibold ${gameId === game.id ? "border-signal bg-signal text-on-signal" : "border-line bg-paper text-ink"}`,
					children: game.name
				}, game.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-12 pt-8",
				children: db.games.map((game) => {
					const items = db.products.filter((item) => item.gameId === game.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						id: `game-${game.id}`,
						className: "scroll-mt-32",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex size-12 shrink-0 items-center justify-center bg-ink text-sm font-semibold text-paper",
								children: game.monogram
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-4xl leading-tight",
								children: game.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: game.blurb
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
							children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex flex-col border border-line bg-paper p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold tracking-widest text-brass",
										children: item.code
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "mt-2 text-lg font-semibold",
										children: item.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-sm text-muted",
										children: [
											item.rank,
											" · ",
											item.stock
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-4 font-display text-3xl leading-none",
										children: item.price
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: `${buttonClass("line")} mt-5 w-full`,
										onClick: () => go(`shop/item/${item.id}`, { keepScroll: true }),
										children: "Xem chi tiết"
									})
								]
							}, item.id))
						})]
					}, game.id);
				})
			}),
			product ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductDialog, {
				product,
				game: productGame,
				onClose: () => go("shop", { keepScroll: true })
			}) : null
		]
	});
}
function App() {
	const db = useDatabase();
	const view = useHashView();
	(0, import_react.useEffect)(() => {
		const name = "MT MEDIA.Client";
		if (view.page === "files") document.title = `FileShare · ${name}`;
		else if (view.page === "shop") document.title = `Shop · ${name}`;
		else document.title = name;
	}, [view]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-canvas text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, { view }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto w-full max-w-6xl px-4",
				children: [
					db.status === "loading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "py-16 text-sm text-muted",
						children: "Đang đọc database.json…"
					}) : null,
					db.status === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "py-16",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display text-4xl",
								children: "Không mở được dữ liệu"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-muted",
								children: db.message
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-6",
								onClick: () => window.location.reload(),
								children: "Thử lại"
							})
						]
					}) : null,
					db.status === "ready" && db.data && view.page === "home" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeView, { db: db.data }) : null,
					db.status === "ready" && db.data && view.page === "files" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilesView, {
						db: db.data,
						fileId: view.fileId
					}) : null,
					db.status === "ready" && db.data && view.page === "shop" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopView, {
						db: db.data,
						gameId: view.gameId,
						productId: view.productId
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, { db: db.data })
		]
	});
}
//#endregion
export { App as component };
