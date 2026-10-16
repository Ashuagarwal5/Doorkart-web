import Link from 'next/link';
import { ArrowUpRight, Shapes } from 'lucide-react';
import { StoreImage } from './product-card';
import type { Category } from '@/lib/types';
export function CategoryCard({ category }: { category: Category }) {
  return <Link className="category-card" href={`/categories/${category.slug}`}><div className="category-picture">{category.imageUrl ? <StoreImage src={category.imageUrl} alt={category.name} sizes="(max-width: 600px) 50vw, 20vw" /> : <Shapes size={48} strokeWidth={1} />}</div><div><h3>{category.name}</h3><ArrowUpRight size={17} /></div><p>{category.description || 'Discover something for you.'}</p></Link>;
}
