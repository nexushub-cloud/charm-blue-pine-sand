import { useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { go, safeHref, type Database, type Game, type Product } from "@/lib/media";
import { buttonClass } from "@/components/chrome";

function ProductDialog({
  product,
  game,
  onClose,
}: {
  product: Product;
  game: Game | undefined;
  onClose: () => void;
}) {
  const href = safeHref(product.contactUrl);
  const via = product.contactKind === "zalo" ? "Mở Zalo" : "Mở liên kết";
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/50" />
        <Dialog.Content className="fixed inset-x-4 top-[8vh] z-50 mx-auto max-h-[84vh] max-w-lg overflow-auto border border-line bg-paper p-6 focus:outline-none">
          <p className="text-xs font-semibold tracking-widest text-signal">{game?.name ?? "Shop"}</p>
          <Dialog.Title className="mt-2 font-display text-4xl leading-tight">{product.name}</Dialog.Title>
          <Dialog.Description className="mt-3 text-sm text-muted">{product.detail}</Dialog.Description>
          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="border border-line p-3">
              <dt className="text-xs text-muted">Mã sản phẩm</dt>
              <dd className="mt-1 font-semibold tracking-wide">{product.code}</dd>
            </div>
            <div className="border border-line p-3">
              <dt className="text-xs text-muted">Giá</dt>
              <dd className="mt-1 font-semibold">{product.price}</dd>
            </div>
            <div className="border border-line p-3">
              <dt className="text-xs text-muted">Rank</dt>
              <dd className="mt-1 font-semibold">{product.rank}</dd>
            </div>
            <div className="border border-line p-3">
              <dt className="text-xs text-muted">Kho</dt>
              <dd className="mt-1 font-semibold">{product.stock}</dd>
            </div>
          </dl>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {product.points.map((point) => (
              <li key={point} className="py-3 text-sm">
                {point}
              </li>
            ))}
          </ul>
          <div className="mt-5 grid gap-2">
            {href ? (
              <a href={href} target="_blank" rel="noopener noreferrer" className={buttonClass("signal")}>
                Liên hệ mua / bán
              </a>
            ) : (
              <p className="text-sm text-signal">Liên hệ chưa có liên kết hợp lệ.</p>
            )}
            <p className="text-sm text-muted">
              {via} · {product.contactLabel}
            </p>
          </div>
          <Dialog.Close className={`${buttonClass("line")} mt-4 w-full`}>Đóng</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ShopView({
  db,
  gameId,
  productId,
}: {
  db: Database;
  gameId?: string;
  productId?: string;
}) {
  const product = db.products.find((item) => item.id === productId) ?? null;
  const productGame = product ? db.games.find((game) => game.id === product.gameId) : undefined;

  useEffect(() => {
    if (!gameId) return;
    document.getElementById(`game-${gameId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [gameId]);

  return (
    <div className="py-8">
      <header className="border-b border-line pb-6">
        <p className="text-xs font-semibold tracking-widest text-signal">SHOP</p>
        <h1 className="mt-2 font-display text-5xl leading-tight">Gian hàng acc</h1>
        <p className="mt-3 max-w-xl text-muted">
          Bốn mục riêng: Free Fire, Liên Quân, Roblox và Skyblock BlockMan Go. Mỗi acc một mã. Chi tiết mới hiện nút liên hệ mua hoặc bán.
        </p>
      </header>
      <nav className="sticky top-16 z-20 -mx-4 flex gap-2 overflow-x-auto border-b border-line bg-canvas px-4 py-3" aria-label="Mục game">
        {db.games.map((game) => (
          <button
            key={game.id}
            type="button"
            onClick={() => go(`shop/game/${game.id}`, { keepScroll: true })}
            className={`min-h-11 shrink-0 border px-4 text-sm font-semibold ${gameId === game.id ? "border-signal bg-signal text-on-signal" : "border-line bg-paper text-ink"}`}
          >
            {game.name}
          </button>
        ))}
      </nav>

      <div className="grid gap-12 pt-8">
        {db.games.map((game) => {
          const items = db.products.filter((item) => item.gameId === game.id);
          return (
            <section key={game.id} id={`game-${game.id}`} className="scroll-mt-32">
              <div className="flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center bg-ink text-sm font-semibold text-paper">
                  {game.monogram}
                </span>
                <div>
                  <h2 className="font-display text-4xl leading-tight">{game.name}</h2>
                  <p className="mt-1 text-sm text-muted">{game.blurb}</p>
                </div>
              </div>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <li key={item.id} className="flex flex-col border border-line bg-paper p-4">
                    <p className="text-xs font-semibold tracking-widest text-brass">{item.code}</p>
                    <h3 className="mt-2 text-lg font-semibold">{item.name}</h3>
                    <p className="mt-1 text-sm text-muted">
                      {item.rank} · {item.stock}
                    </p>
                    <p className="mt-4 font-display text-3xl leading-none">{item.price}</p>
                    <button
                      type="button"
                      className={`${buttonClass("line")} mt-5 w-full`}
                      onClick={() => go(`shop/item/${item.id}`, { keepScroll: true })}
                    >
                      Xem chi tiết
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {product ? (
        <ProductDialog
          product={product}
          game={productGame}
          onClose={() => go("shop", { keepScroll: true })}
        />
      ) : null}
    </div>
  );
}
