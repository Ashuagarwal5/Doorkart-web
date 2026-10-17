import { notFound } from "next/navigation";
import { getCatalog, getProduct } from "@/lib/store-api";
import { ProductDetail } from "@/components/product-detail";
import { ProductCard } from "@/components/product-card";
type Props = { params: Promise<{ slug: string }> };
export async function generateStaticParams() {
  const catalog = await getCatalog();
  const params = catalog.products.map((p) => ({ slug: p.slug }));
  return params.length ? params : [{ slug: "_" }];
}
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { product } = await getProduct(slug);
  return {
    title: product?.name || "Product",
    description: product?.description,
  };
}
export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const { product, demo, error } = await getProduct(slug);
  if (error)
    return (
      <div className="container page-section">
        <h1>We couldn’t open this find.</h1>
        <p role="alert">{error}</p>
      </div>
    );
  if (!product) notFound();
  const catalog = await getCatalog();
  const related = catalog.products
    .filter(
      (p) => p.category.slug === product.category.slug && p.id !== product.id,
    )
    .slice(0, 4);
  return (
    <div className="container page-section">
      <ProductDetail product={product} demo={demo} />
      {related.length > 0 && (
        <section className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">KEEP THE GOOD FINDS COMING</span>
              <h2>
                You might also <em>love.</em>
              </h2>
            </div>
          </div>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
