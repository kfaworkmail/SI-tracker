import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "СИ-Трекер",
  description: "Реестр средств измерений и контроль сроков поверки",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
