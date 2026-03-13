import "./globals.css";

export const metadata = {
  title: "OBD.LIBRARY",
  description: "Team visual reference library",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}