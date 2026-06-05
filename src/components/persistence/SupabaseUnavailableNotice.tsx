export function SupabaseUnavailableNotice() {
  return (
    <div className="notice-box">
      <strong>Облачное сохранение не настроено.</strong>
      <p className="muted" style={{ marginBottom: 0 }}>
        Сейчас отчет доступен только в локальном браузерном сеансе. Локальный MVP
        продолжает работать без Supabase.
      </p>
    </div>
  );
}
