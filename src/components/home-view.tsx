import { go, type Database } from "@/lib/media";
import { Button } from "@/components/chrome";

const STEPS = [
  { n: "01", title: "Xác minh robot", text: "Xác nhận bạn không phải robot và nhập mã trên hình." },
  { n: "02", title: "Đếm ngược", text: "Chờ hết giờ then chốt. Không bỏ qua được bước này." },
  { n: "03", title: "Key Base64", text: "Nhập key, mua key, hoặc tự lấy key sau 30 giây." },
];

export function HomeView({ db }: { db: Database }) {
  return (
    <div>
      <section className="grid gap-10 border-b border-line py-12 lg:grid-cols-12 lg:py-16">
        <div className="lg:col-span-7">
          <p className="text-xs font-semibold text-signal">Phòng client</p>
          <h1 className="mt-4 font-display text-5xl leading-tight text-ink sm:text-7xl">
            File có khóa.
            <br />
            Acc có mã.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted">{db.brand.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={() => go("files")}>Mở FileShare</Button>
            <Button variant="line" onClick={() => go("shop")}>
              Vào Shop
            </Button>
          </div>
        </div>
        <aside className="border border-line bg-paper p-6 lg:col-span-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold">Phiếu trực</p>
            <p className="flex items-center gap-2 text-xs font-semibold text-signal">
              <span className="size-2 rounded-full bg-signal" aria-hidden="true" />
              Trực tuyến
            </p>
          </div>
          <dl className="mt-6 grid grid-cols-3 gap-3">
            <Stat label="File" value={String(db.files.length)} />
            <Stat label="Game" value={String(db.games.length)} />
            <Stat label="Acc" value={String(db.products.length)} />
          </dl>
          <p className="mt-6 text-sm text-muted">
            Key chờ {db.gates.keyWaitSeconds}s và được lưu dạng Base64. Đếm ngược trước khi nhập key là{" "}
            {db.gates.countdownSeconds}s.
          </p>
        </aside>
      </section>

      <section className="grid border-b border-line md:grid-cols-3" aria-label="Ba bước lấy file">
        {STEPS.map((step) => (
          <article key={step.n} className="border-b border-line py-8 md:border-b-0 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0 md:last:pr-0">
            <p className="font-display text-4xl text-signal">{step.n}</p>
            <h2 className="mt-3 text-lg font-semibold">{step.title}</h2>
            <p className="mt-2 text-sm text-muted">{step.text}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-10 py-12 lg:grid-cols-2">
        <div>
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-4xl">File mới</h2>
            <button type="button" onClick={() => go("files")} className="min-h-11 text-sm font-semibold text-signal">
              Tất cả file
            </button>
          </div>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {db.files.slice(0, 4).map((file) => (
              <li key={file.id}>
                <button
                  type="button"
                  onClick={() => go(`files/${file.id}`)}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left"
                >
                  <span>
                    <span className="block text-xs text-muted">
                      {file.shareCode} · {file.category}
                    </span>
                    <span className="mt-1 block font-semibold">{file.name}</span>
                  </span>
                  <span className="shrink-0 text-sm text-muted">{file.format}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-4xl">Gian hàng</h2>
            <button type="button" onClick={() => go("shop")} className="min-h-11 text-sm font-semibold text-signal">
              Vào shop
            </button>
          </div>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {db.games.map((game) => {
              const count = db.products.filter((item) => item.gameId === game.id).length;
              return (
                <li key={game.id}>
                  <button
                    type="button"
                    onClick={() => go(`shop/game/${game.id}`, { keepScroll: true })}
                    className="flex min-h-24 w-full items-center gap-4 border border-line bg-paper p-4 text-left hover:border-ink"
                  >
                    <span className="flex size-12 shrink-0 items-center justify-center bg-ink text-sm font-semibold text-paper">
                      {game.monogram}
                    </span>
                    <span>
                      <span className="block font-semibold">{game.name}</span>
                      <span className="mt-1 block text-sm text-muted">{count} mã</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <p className="border-t border-line py-6 text-sm text-muted">
        File, key Base64, mã acc và liên hệ nằm riêng trong database.json. Đổi số Zalo hoặc link tải ở đó rồi tải lại trang.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line px-3 py-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 font-display text-3xl leading-none">{value}</dd>
    </div>
  );
}
