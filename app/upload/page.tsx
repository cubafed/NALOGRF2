import { CsvUploadPanel } from "@/components/upload/CsvUploadPanel";
import { FooterDisclaimer } from "@/components/layout/FooterDisclaimer";
import { Header } from "@/components/layout/Header";

export default function UploadPage() {
  return (
    <>
      <Header />
      <main>
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Universal CSV import</p>
              <h1 style={{ margin: 0, fontSize: "clamp(38px, 5vw, 68px)", lineHeight: 1 }}>
                Загрузите CSV с операциями
              </h1>
              <p className="lead" style={{ marginTop: "14px" }}>
                Файл обрабатывается локально в браузере. В этом MVP данные не сохраняются
                и не отправляются на сервер.
              </p>
            </div>
            <CsvUploadPanel />
          </div>
        </section>
      </main>
      <FooterDisclaimer />
    </>
  );
}
