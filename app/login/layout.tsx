import type {Metadata} from "next";
import {EB_Garamond, Poppins} from "next/font/google";
import "../globals.css";

const ebGaramond = EB_Garamond({
  variable: "--font-ebg",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Login - Chintan Sudani",
  description: "Login to your account",
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${ebGaramond.variable} ${poppins.variable} bg-white-smoke antialiased`}>
        {children}
      </body>
    </html>
  );
}
