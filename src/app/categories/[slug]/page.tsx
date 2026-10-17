import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCatalog } from "@/lib/store-api";
import { CatalogBrowser } from "@/components/catalog-browser";
type Props = { params: Promise<{ slug: string }> };
export async function generateStaticParams() {
  const catalog = await getCatalog();
  const params = catalog.categories.map((c) => ({ slug: c.slug }));
  return params.length ? params : [{ slug: "_" }];
}
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const catalog = await getCatalog();
  return {
    title: catalog.categories.find((c) => c.slug === slug)?.name || "Category",
  };
}
export default async function Category({ params }: Props) {
  const { slug } = await params;
  const catalog = await getCatalog();
  const category = catalog.categories.find((c) => c.slug === slug);
  if (!category && !catalog.error) notFound();
  return (
    <div className="container page-section">
      <div className="page-heading">
        <span className="eyebrow">EXPLORE THE COLLECTION</span>
        <h1>
          {category?.name || "Your next find"}
          <span className="orange">.</span>
        </h1>
        <p>
          {category?.description ||
            "Find a little something that feels like you."}
        </p>
      </div>
      <Suspense fallback={<p>Loading the collection…</p>}>
        <CatalogBrowser catalog={catalog} category={slug} />
      </Suspense>
    </div>
  );
}
