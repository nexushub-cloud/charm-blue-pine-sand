import { useState } from "react";
import type { ButtonHTMLAttributes } from "react";
import { Menu, X } from "lucide-react";
import { go, safeHref, type Database, type View } from "@/lib/media";

const LINKS: { id: View["page"]; hash: string; label: string }[] = [
  { id: "home", hash: "home", label: "Home" },
  { id: "files", hash: "files", label: "FileShare" },
  { id: "shop", hash: "shop", label: "Shop" },
];

type Variant = "signal" | "ink" | "line" | "ghost";

const variantClass: Record<Variant, string> = {
  signal: "bg-signal text-on-signal hover:bg-ink",
  ink: "bg-ink text-paper hover:bg-signal",
  line: "border border-line bg-paper text-ink hover:border-ink",
  ghost: "text-ink hover:bg-paper",
};

export function buttonClass(variant: Variant = "signal", extra = "") {
  return `inline-flex min-h-11 items-center justify-center gap-2 px-4 text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:cursor-not-allowed disabled:opacity-50 ${variantClass[variant]} ${extra}`;
}

export function Button({
  variant = "signal",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />;
}

export const fieldClass =
  "min-h-11 w-full border border-line bg-canvas px-3 text-sm text-ink outline-none focus-visible:border-ink";

export function SiteHeader({ view }: { view: View }) {
  const [open, setOpen] = useState(false);

  const jump = (hash: string) => {
    setOpen(false);
    go(hash);
  };

  return (
    <header className="sticky top-0 z-30 border-t-4 border-b border-t-signal border-b-line bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <button type="button" onClick={() => jump("home")} className="text-left">
          <span className="font-display text-2xl leading-none text-ink">
            MT MEDIA
            <span className="italic text-signal">.Client</span>
          </span>
        </button>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Chính">
          {LINKS.map((link) => {
            const active = view.page === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => jump(link.hash)}
                className={`min-h-11 px-3 text-sm font-semibold ${active ? "text-signal" : "text-ink"}`}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </button>
            );
          })}
        </nav>
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center border border-line md:hidden"
          aria-label={open ? "Đóng menu" : "Mở menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open ? (
        <nav className="border-t border-line px-4 py-3 md:hidden" aria-label="Di động">
          {LINKS.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => jump(link.hash)}
              className="flex min-h-11 w-full items-center text-left text-base font-semibold"
            >
              {link.label}
            </button>
          ))}
        </nav>
      ) : null}
    </header>
  );
}

export function SiteFooter({ db }: { db: Database | null }) {
  const zalo = db ? safeHref(db.brand.zalo) : null;
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="font-display text-3xl leading-none">
            MT MEDIA<span className="italic text-signal">.Client</span>
          </p>
          <p className="mt-3 text-sm text-muted">Kho file có khóa và gian hàng tài khoản cho client.</p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-widest text-muted">MENU</p>
          <div className="mt-3 grid">
            {LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => go(link.hash)}
                className="min-h-11 text-left text-sm font-semibold"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-widest text-muted">LIÊN HỆ</p>
          {zalo ? (
            <a href={zalo} target="_blank" rel="noopener noreferrer" className={`${buttonClass("ink")} mt-3`}>
              {db?.brand.zaloLabel}
            </a>
          ) : (
            <p className="mt-3 text-sm text-muted">Số Zalo nằm trong dữ liệu riêng.</p>
          )}
        </div>
      </div>
    </footer>
  );
}
