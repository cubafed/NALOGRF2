import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crypto Audit Report",
  description: "Prepare your crypto history before a bank, accountant, or tax office asks questions.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <div className="shell">{children}</div>
      </body>
    </html>
  );
}
