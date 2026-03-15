import "./globals.css";
import SwipeNav from "./SwipeNav";

export const metadata = {
  title: "OBD.LIBRARY",
  description: "Team visual reference library",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SwipeNav>{children}</SwipeNav>
      </body>
    </html>
  );
}