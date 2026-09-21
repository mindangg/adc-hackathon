import "./globals.css";

export const metadata = { title: "Career Navigator" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <a href="#main" className="skip">Bỏ qua, tới nội dung chính</a>
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
