import type {Metadata} from "next";
import {EB_Garamond, Poppins} from "next/font/google";
import "../globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import {Settings as SettingsType} from "@/sanity.types";
import {sanityFetch} from "@/sanity/lib/live";
import {SETTINGS} from "@/sanity/queries";

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
  title: "Chintan Sudani - Developer, Tinkerer, Human",
  description:
    "Hi, I'm Chintan Sudani. A visionary developer and creative tinkerer, driven by a passion for coding and its endless possibilities.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {data: settings} = await sanityFetch<SettingsType>({query: SETTINGS});

  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${ebGaramond.variable} ${poppins.variable} bg-white-smoke antialiased`}>
        <div className="container">
          <Header {...settings} />
          <main>{children}</main>
        </div>
        <Footer {...settings} />
      </body>
    </html>
  );
}
