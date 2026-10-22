import { useEffect, useRef, useState } from "react";
import { copyText, go, isValidKey, safeHref, shareUrl, useKeyIssue, type Database, type MediaFile } from "@/lib/media";
import { Button, buttonClass, fieldClass } from "@/components/chrome";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(length = 5) {
  const buf = new Uint32Array(length);
  crypto.getRandomValues(buf);
  let code = "";
  for (let i = 0; i < length; i += 1) code += CHARS[(buf[i] ?? 0) % CHARS.length];
  return code;
}

function paintCaptcha(canvas: HTMLCanvasElement, code: string) {
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
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
    ctx.stroke();
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "700 36px Manrope, sans-serif";
  const gap = width / (code.length + 1);
  for (let i = 0; i < code.length; i += 1) {
    ctx.save();
    ctx.translate(gap * (i + 1), height / 2);
    ctx.rotate((Math.random() - 0.5) * 0.18);
    ctx.fillStyle = i % 2 === 0 ? ink : signal;
    ctx.fillText(code[i] ?? "", 0, 0);
    ctx.restore();
  }
}

function RobotCheck({ onPass }: { onPass: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const codeRef = useRef("");
  const [human, setHuman] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!human) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const code = randomCode();
    codeRef.current = code;
    const draw = () => {
      const node = canvasRef.current;
      if (!node) return;
      node.dataset.code = code;
      paintCaptcha(node, code);
    };
    draw();
    const frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [human, nonce]);

  const submit = () => {
    const typed = value.trim().toUpperCase();
    const expected = codeRef.current;
    (window as Window & { __cap?: string }).__cap = `${typed} vs ${expected}`;
    if (typed !== expected) {
      setError("Mã robot chưa đúng. Hãy nhìn hình và nhập lại.");
      setValue("");
      setNonce((item) => item + 1);
      return;
    }
    onPass();
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (human) submit();
      }}
      className="grid gap-4"
    >
      <label className="flex min-h-16 items-center justify-between gap-4 border border-line bg-paper px-4">
        <span className="flex items-center gap-3 text-sm font-semibold">
          <input
            type="checkbox"
            className="size-5 accent-signal"
            checked={human}
            onChange={(event) => {
              setHuman(event.target.checked);
              setError("");
            }}
          />
          Tôi không phải robot
        </span>
        <span className="text-right">
          <span className="block font-display text-xl leading-none">MT</span>
          <span className="text-xs text-muted">xác minh</span>
        </span>
      </label>
      {human ? (
        <div className="grid gap-3">
          <canvas ref={canvasRef} className="h-24 w-full border border-line bg-paper" aria-label="Mã xác minh robot" />
          <div className="flex flex-wrap gap-2">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Nhập mã trên hình</span>
              <input
                className={fieldClass}
                value={value}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                placeholder="Nhập mã trên hình"
                onChange={(event) => setValue(event.target.value.toUpperCase())}
              />
            </label>
            <Button variant="line" onClick={() => setNonce((item) => item + 1)}>
              Đổi mã
            </Button>
          </div>
          <Button type="submit">Xác nhận robot</Button>
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-signal">
          {error}
        </p>
      ) : null}
    </form>
  );
}

function Countdown({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [left, setLeft] = useState(seconds);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const started = Date.now();
    const id = window.setInterval(() => {
      const remain = Math.max(0, seconds - Math.floor((Date.now() - started) / 1000));
      setLeft(remain);
      if (remain <= 0) {
        window.clearInterval(id);
        done.current();
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [seconds]);

  const progress = seconds === 0 ? 100 : ((seconds - left) / seconds) * 100;

  return (
    <div className="border border-line bg-paper p-6 text-center">
      <p className="text-xs font-semibold text-muted">Đang chờ</p>
      <p className="mt-3 font-display text-7xl leading-none" aria-live="polite">
        {left}
      </p>
      <p className="mt-3 text-sm text-muted">Giây nữa mới tới bước nhập key.</p>
      <div
        className="mt-6 h-1 bg-line"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={seconds}
        aria-valuenow={seconds - left}
      >
        <div className="h-full bg-signal" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function KeyPanel({
  file,
  status,
  onStart,
  showBuy,
  buyUrl,
  buyLabel,
  onUse,
}: {
  file: MediaFile;
  status: { state: "idle" | "wait" | "ready"; remaining: number };
  onStart: () => void;
  showBuy: boolean;
  buyUrl: string | null;
  buyLabel: string;
  onUse?: (key: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="grid gap-3 border border-line bg-paper p-4">
      <div>
        <p className="text-sm font-semibold">Lấy key xác minh</p>
        <p className="mt-1 text-sm text-muted">
        {status.state === "ready"
          ? "Key đã mã hóa Base64. Dán vào ô xác minh để tải file."
          : `Chờ ${status.remaining} giây. Key trả về là chuỗi Base64.`}
      </p>
      </div>
      {status.state === "idle" ? (
        <Button onClick={onStart}>Lấy key xác minh · {status.remaining}s</Button>
      ) : null}
      {status.state === "wait" ? (
        <div>
          <p className="font-display text-5xl leading-none" aria-live="polite">
            {status.remaining}
          </p>
          <p className="mt-2 text-sm text-muted">Đang mã hóa key sang Base64. Đừng tắt trang.</p>
        </div>
      ) : null}
      {status.state === "ready" ? (
        <div className="grid gap-3">
          <p className="text-xs font-semibold tracking-widest text-brass">KEY BASE64</p>
          <p className="break-all border border-line bg-canvas p-3 text-sm select-all">{file.key}</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="line"
              onClick={() => {
                void copyText(file.key).then((ok) => setCopied(ok));
              }}
            >
              {copied ? "Đã chép" : "Chép key"}
            </Button>
            {onUse ? (
              <Button variant="ink" onClick={() => onUse(file.key)}>
                Điền key này
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
      {showBuy && buyUrl ? (
        <a href={buyUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("ghost")}>
          Mua key xác minh · {buyLabel}
        </a>
      ) : null}
    </div>
  );
}

function Stepper({ phase }: { phase: "robot" | "wait" | "unlock" }) {
  const steps = [
    { id: "robot", label: "Robot" },
    { id: "wait", label: "Đếm ngược" },
    { id: "unlock", label: "Key Base64" },
  ] as const;
  const current = steps.findIndex((step) => step.id === phase);
  return (
    <ol className="grid grid-cols-3 gap-2">
      {steps.map((step, index) => {
        const state = index === current ? "current" : index < current ? "done" : "next";
        const tone =
          state === "current"
            ? "border-signal bg-signal text-on-signal"
            : state === "done"
              ? "border-ink bg-ink text-paper"
              : "border-line bg-paper text-muted";
        return (
          <li key={step.id} className={`border px-2 py-3 text-center text-xs font-semibold ${tone}`}>
            <span className="block">0{index + 1}</span>
            {step.label}
          </li>
        );
      })}
    </ol>
  );
}

function FileDetail({
  db,
  file,
  onBack,
}: {
  db: Database;
  file: MediaFile;
  onBack: () => void;
}) {
  const issue = useKeyIssue(db.gates.keyWaitSeconds);
  const keyStatus = issue.status(file.id);
  const [mode, setMode] = useState<"idle" | "key" | "gate">("idle");
  const [phase, setPhase] = useState<"robot" | "wait" | "unlock">("robot");
  const [keyInput, setKeyInput] = useState("");
  const [keyError, setKeyError] = useState("");
  const [opened, setOpened] = useState(false);
  const [copied, setCopied] = useState("");
  const pageLink = shareUrl(file.id);
  const fileHref = safeHref(file.link);
  const buyUrl = safeHref(db.brand.buyKeyUrl);

  useEffect(() => {
    setMode("idle");
    setPhase("robot");
    setKeyInput("");
    setKeyError("");
    setOpened(false);
    setCopied("");
  }, [file.id]);

  const copy = (label: string, value: string) => {
    void copyText(value).then((ok) => setCopied(ok ? label : ""));
  };

  return (
    <article className="min-w-0">
      <button type="button" onClick={onBack} className="mb-4 min-h-11 text-sm font-semibold text-signal lg:hidden">
        Quay lại danh sách
      </button>
      <p className="text-xs font-semibold tracking-widest text-signal">
        {file.shareCode} · {file.category}
      </p>
      <h2 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">{file.name}</h2>
      <p className="mt-3 text-sm text-muted">
        {file.format} · {file.size} · cập nhật {file.updated}
      </p>
      <p className="mt-4 max-w-2xl text-base">{file.detail}</p>

      <div className="mt-6 grid gap-3 border border-line bg-paper p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted">Liên kết riêng của file</p>
            <p className="break-all text-sm">{pageLink}</p>
          </div>
          <Button variant="line" onClick={() => copy("link", pageLink)}>
            {copied === "link" ? "Đã chép" : "Chép liên kết"}
          </Button>
        </div>
        <p className="text-sm text-muted">
          Liên kết tải chỉ hiện sau 3 bước và khi key Base64 đúng.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          onClick={() => {
            setMode("gate");
            setPhase("robot");
            setKeyError("");
          }}
        >
          Lấy file
        </Button>
        <Button
          variant="line"
          onClick={() => {
            setMode("key");
          }}
        >
          Lấy key xác minh
        </Button>
      </div>

      {opened ? (
        <div className="mt-4 border border-ink bg-paper p-4">
          <p className="text-sm font-semibold">Đã xác minh. File mở trong phiên này.</p>
          {fileHref ? (
            <>
              <p className="mt-2 break-all text-sm">{file.link}</p>
              <a href={fileHref} download className={`${buttonClass("signal")} mt-3`}>
                Tải file
              </a>
            </>
          ) : (
            <p className="mt-2 text-sm text-signal">Liên kết tải trong dữ liệu không hợp lệ.</p>
          )}
        </div>
      ) : null}

      {mode === "key" && !opened ? (
        <div className="mt-4">
          <KeyPanel
            file={file}
            status={keyStatus}
            onStart={() => issue.start(file.id)}
            showBuy={false}
            buyUrl={buyUrl}
            buyLabel={db.brand.buyKeyLabel}
          />
          <p className="mt-2 text-sm text-muted">Dán key này ở bước 3 khi bấm Lấy file.</p>
        </div>
      ) : null}

      {mode === "gate" && !opened ? (
        <div className="mt-4 grid gap-4">
          <Stepper phase={phase} />
          {phase === "robot" ? <RobotCheck onPass={() => setPhase("wait")} /> : null}
          {phase === "wait" ? (
            <Countdown seconds={db.gates.countdownSeconds} onDone={() => setPhase("unlock")} />
          ) : null}
          {phase === "unlock" ? (
            <form
              className="grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (!isValidKey(file, keyInput)) {
                  setKeyError("Key chưa đúng. Hãy nhập đúng chuỗi Base64, có phân biệt hoa thường.");
                  setOpened(false);
                  return;
                }
                setKeyError("");
                setOpened(true);
              }}
            >
              <label className="grid gap-2">
                <span className="text-sm font-semibold">Nhập key xác minh</span>
                <input
                  className={fieldClass}
                  value={keyInput}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="Dán key Base64"
                  onChange={(event) => setKeyInput(event.target.value)}
                />
              </label>
              <Button type="submit">Xác nhận và lấy file</Button>
              {keyError ? (
                <p role="alert" className="text-sm text-signal">
                  {keyError}
                </p>
              ) : null}
              <p className="text-center text-xs font-semibold tracking-widest text-muted">HOẶC</p>
              <KeyPanel
                file={file}
                status={keyStatus}
                onStart={() => issue.start(file.id)}
                showBuy
                buyUrl={buyUrl}
                buyLabel={db.brand.buyKeyLabel}
                onUse={(key) => {
                  setKeyInput(key);
                  setKeyError("");
                }}
              />
            </form>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function FilesView({ db, fileId }: { db: Database; fileId?: string }) {
  const [query, setQuery] = useState("");
  const active = db.files.find((file) => file.id === fileId) ?? null;
  const q = query.trim().toLowerCase();
  const files = db.files.filter((file) => {
    if (!q) return true;
    return (
      file.name.toLowerCase().includes(q) ||
      file.category.toLowerCase().includes(q) ||
      file.shareCode.toLowerCase().includes(q)
    );
  });

  return (
    <div className="py-8">
      <header className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-signal">FILESHARE</p>
          <h1 className="mt-2 font-display text-5xl leading-tight">Kho file</h1>
          <p className="mt-3 max-w-xl text-muted">
            Mỗi file một tên và một liên kết. Bấm xem chi tiết, rồi lấy key hoặc đi 3 bước để tải.
          </p>
        </div>
        <label className="w-full sm:w-64">
          <span className="sr-only">Tìm file</span>
          <input
            className={fieldClass}
            value={query}
            placeholder="Tìm tên hoặc mã"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </header>

      <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:pt-6">
        <div className={active ? "hidden lg:block" : ""}>
          {files.length === 0 ? (
            <p className="py-8 text-sm text-muted">Không có file khớp.</p>
          ) : (
            <ul className="divide-y divide-line border-y border-line lg:border">
              {files.map((file) => {
                const selected = file.id === active?.id;
                return (
                  <li key={file.id}>
                    <button
                      type="button"
                      onClick={() => go(`files/${file.id}`)}
                      className={`flex w-full flex-col gap-1 px-1 py-4 text-left lg:px-4 ${selected ? "bg-paper" : ""}`}
                    >
                      <span className="text-xs text-muted">
                        {file.shareCode} · {file.category}
                      </span>
                      <span className="font-semibold">{file.name}</span>
                      <span className="text-sm text-muted">{file.summary}</span>
                      <span className="mt-2 text-sm font-semibold text-signal">Xem chi tiết</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className={active ? "" : "hidden lg:block"}>
          {active ? (
            <FileDetail
              db={db}
              file={active}
              onBack={() => go("files")}
            />
          ) : (
            <div className="border border-line bg-paper p-8">
              <h2 className="font-display text-3xl">Chọn một file</h2>
              <p className="mt-2 text-sm text-muted">
                Chi tiết hiện tên, liên kết riêng, nút lấy key Base64 và nút lấy file qua 3 bước.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
