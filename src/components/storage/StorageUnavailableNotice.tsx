export function StorageUnavailableNotice() {
  return (
    <div className="notice-box">
      <strong>Supabase Storage не настроен.</strong>
      <p className="muted" style={{ marginBottom: 0 }}>
        PDF attachments доступны только после настройки Supabase и входа в аккаунт.
        Локальный MVP продолжает работать без cloud storage.
      </p>
    </div>
  );
}
