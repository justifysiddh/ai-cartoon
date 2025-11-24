export const metadata = {
  title: "AI Cartoon Maker",
  description: "Convert your photo into a cartoon using AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
