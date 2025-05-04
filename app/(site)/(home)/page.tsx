import {Home as HomeType} from "@/sanity.types";
import {sanityFetch} from "@/sanity/lib/live";
import {HOME} from "@/sanity/queries";

export default async function HomePage() {
  const {data: home} = await sanityFetch<HomeType>({query: HOME});
  
  return (
    <section className="bg-white font-sans">
      <h2 className="text-secondary text-3xl font-light italic">{home?.tagline}</h2>
    </section>
  );
}

export async function generateMetadata() {
  const {data: home} = await sanityFetch<HomeType>({query: HOME});

  return {
    title: home?.seo?.metaTitle,
    description: home?.seo?.metaDescription,
    keywords: home?.seo?.keywords?.join(", ") || [],
    canonical: home?.seo?.canonical,
  };
}