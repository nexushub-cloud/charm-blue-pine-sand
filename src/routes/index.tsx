import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteHeader, Button } from "@/components/chrome";
import { FilesView } from "@/components/files-view";
import { HomeView } from "@/components/home-view";
import { ShopView } from "@/components/shop-view";
import { useDatabase, useHashView } from "@/lib/media";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const db = useDatabase();
  const view = useHashView();

  useEffect(() => {
    const name = "MT MEDIA.Client";
    if (view.page === "files") document.title = `FileShare · ${name}`;
    else if (view.page === "shop") document.title = `Shop · ${name}`;
    else document.title = name;
  }, [view]);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <SiteHeader view={view} />
      <main className="mx-auto w-full max-w-6xl px-4">
        {db.status === "loading" ? <p className="py-16 text-sm text-muted">Đang đọc database.json…</p> : null}
        {db.status === "error" ? (
          <div className="py-16">
            <h1 className="font-display text-4xl">Không mở được dữ liệu</h1>
            <p className="mt-3 text-sm text-muted">{db.message}</p>
            <Button className="mt-6" onClick={() => window.location.reload()}>
              Thử lại
            </Button>
          </div>
        ) : null}
        {db.status === "ready" && db.data && view.page === "home" ? <HomeView db={db.data} /> : null}
        {db.status === "ready" && db.data && view.page === "files" ? (
          <FilesView db={db.data} fileId={view.fileId} />
        ) : null}
        {db.status === "ready" && db.data && view.page === "shop" ? (
          <ShopView db={db.data} gameId={view.gameId} productId={view.productId} />
        ) : null}
      </main>
      <SiteFooter db={db.data} />
    </div>
  );
}
