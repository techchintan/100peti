import type {Metadata} from "next";
import {EB_Garamond, Poppins} from "next/font/google";
import "../globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import {Settings as SettingsType} from "@/sanity.types";
import {sanityFetch, SanityLive} from "@/sanity/lib/live";
import {SETTINGS} from "@/sanity/queries";
import {Toaster} from "@/components/ui/sonner";

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

export async function generateMetadata(): Promise<Metadata> {
  const {data: settings} = await sanityFetch<SettingsType>({query: SETTINGS});

  return {
    title: {
      default: `${settings?.brand?.name || "Sudani Family"} Finance`,
      template: `%s · ${settings?.brand?.name || "Sudani Family"}`,
    },
    description: "Private family wealth dashboard for cash, notes, trading, and gold.",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {data: settings} = await sanityFetch<SettingsType>({query: SETTINGS});

  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${ebGaramond.variable} ${poppins.variable} bg-zinc-50 antialiased`}>
        <div className="container min-h-screen">
          <Header {...settings} />
          <main>{children}</main>
          <Toaster />
        </div>
        <Footer {...settings} />
        <SanityLive />
      </body>
    </html>
  );
}
