import { useEffect, useState } from "react";
import { previewPathPrefix } from "@/lib/preview-path-prefix";
import bundledRaw from "../../public/database.json";

export type Brand = {
  name: string;
  tagline: string;
  zalo: string;
  zaloLabel: string;
  buyKeyUrl: string;
  buyKeyLabel: string;
};

export type Gates = {
  countdownSeconds: number;
  keyWaitSeconds: number;
};

export type MediaFile = {
  id: string;
  name: string;
  category: string;
  size: string;
  format: string;
  updated: string;
  shareCode: string;
  summary: string;
  detail: string;
  key: string;
  link: string;
};

export type Game = {
  id: string;
  name: string;
  monogram: string;
  blurb: string;
};

export type Product = {
  id: string;
  gameId: string;
  code: string;
  name: string;
  price: string;
  rank: string;
  stock: string;
  points: string[];
  detail: string;
  contactUrl: string;
  contactKind: "zalo" | "link";
  contactLabel: string;
};

export type Database = {
  brand: Brand;
  gates: Gates;
  files: MediaFile[];
  games: Game[];
  products: Product[];
};

export type View =
  | { page: "home" }
  | { page: "files"; fileId?: string }
  | { page: "shop"; gameId?: string; productId?: string };

export function parseHash(hash: string): View {
  const parts = hash.replace(/^#/, "").split("/").filter(Boolean);
  const head = parts[0] ?? "home";
  if (head === "files") return { page: "files", fileId: parts[1] };
  if (head === "shop") {
    if (parts[1] === "game" && parts[2]) return { page: "shop", gameId: parts[2] };
    if (parts[1] === "item" && parts[2]) return { page: "shop", productId: parts[2] };
    return { page: "shop" };
  }
  return { page: "home" };
}

export function go(hash: string, opts?: { keepScroll?: boolean }) {
  const next = hash.startsWith("#") ? hash : `#${hash}`;
  if (window.location.hash === next) {
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  } else {
    window.location.hash = next;
  }
  if (!opts?.keepScroll) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

export function useHashView(): View {
  const [view, setView] = useState<View>({ page: "home" });
  useEffect(() => {
    const read = () => setView(parseHash(window.location.hash));
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  return view;
}

export function assetUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (typeof window === "undefined") return normalized;
  const prefix = previewPathPrefix(window.location.hostname, window.location.pathname) ?? "";
  return `${prefix}${normalized}`;
}

export function safeHref(value: string): string | null {
  if (value.startsWith("/") && !value.startsWith("//")) return assetUrl(value);
  try {
    const url = new URL(value);
    if (url.protocol === "https:" || url.protocol === "http:") return url.toString();
  } catch {
    return null;
  }
  return null;
}

export function shareUrl(fileId: string): string {
  const url = new URL(window.location.href);
  url.hash = `files/${fileId}`;
  return url.toString();
}

export function isValidKey(file: MediaFile, input: string): boolean {
  return input.trim() === file.key;
}

export async function copyText(value: string): Promise<boolean> {
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

function isDatabase(value: unknown): value is Database {
  if (!value || typeof value !== "object") return false;
  const row = value as Partial<Database>;
  return Boolean(
    row.brand &&
      row.gates &&
      Array.isArray(row.files) &&
      Array.isArray(row.games) &&
      Array.isArray(row.products),
  );
}

const bundled = isDatabase(bundledRaw) ? bundledRaw : null;

export function useDatabase() {
  const [state, setState] = useState<{
    status: "loading" | "ready" | "error";
    data: Database | null;
    message: string;
  }>(
    bundled
      ? { status: "ready", data: bundled, message: "" }
      : { status: "error", data: null, message: "database.json không hợp lệ" },
  );

  useEffect(() => {
    let cancel = false;
    fetch(assetUrl("/database.json"))
      .then(async (response) => {
        if (!response.ok) throw new Error("Không đọc được database.json");
        const json: unknown = await response.json();
        if (!isDatabase(json)) throw new Error("database.json thiếu file, game hoặc sản phẩm");
        return json;
      })
      .then((data) => {
        if (!cancel) setState({ status: "ready", data, message: "" });
      })
      .catch(() => {
        if (cancel || bundled) return;
        setState({ status: "error", data: null, message: "Không đọc được database.json" });
      });
    return () => {
      cancel = true;
    };
  }, []);

  return state;
}

export type KeyStatus =
  | { state: "idle"; remaining: number }
  | { state: "wait"; remaining: number }
  | { state: "ready"; remaining: number };

export function useKeyIssue(waitSeconds: number) {
  const [issues, setIssues] = useState<Record<string, { deadline: number; revealed: boolean }>>({});
  const [now, setNow] = useState(0);

  useEffect(() => {
    const pending = Object.values(issues).some((item) => !item.revealed);
    if (!pending) return;
    const tick = () => {
      const time = Date.now();
      setNow(time);
      setIssues((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const id of Object.keys(next)) {
          const item = next[id];
          if (item && !item.revealed && time >= item.deadline) {
            next[id] = { ...item, revealed: true };
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

  const start = (fileId: string) => {
    setNow(Date.now());
    setIssues((prev) => {
      if (prev[fileId]) return prev;
      return {
        ...prev,
        [fileId]: { deadline: Date.now() + waitSeconds * 1000, revealed: false },
      };
    });
  };

  const status = (fileId: string): KeyStatus => {
    const item = issues[fileId];
    if (!item) return { state: "idle", remaining: waitSeconds };
    if (item.revealed) return { state: "ready", remaining: 0 };
    const remaining = Math.max(0, Math.ceil((item.deadline - now) / 1000));
    return { state: "wait", remaining };
  };

  return { start, status };
}
