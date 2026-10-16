import type { Category, Product } from './types';

// Isolated preview data. Never used for order placement or as a fallback for a failed live API.
export const sampleCategories: Category[] = [
  ['stationery', 'Stationery', 'For your next big idea.', '/assets/notebook.jpg'],
  ['gifts', 'Gift Items', 'Little things. Big smiles.', '/assets/gifts.jpg'],
  ['toys', 'Toys', 'A world of play awaits.', '/assets/toys.jpg'],
  ['sports', 'Sports Items', 'Find your everyday energy.', '/assets/sports.jpg'],
  ['decoration', 'Decoration Items', 'Make your space feel like you.', '/assets/decor.jpg'],
  ['watches', 'Watches', 'A little time for your style.', '/assets/watch.jpg'],
].map(([slug, name, description, imageUrl], displayOrder) => ({ id: `demo-${slug}`, slug, name, description, imageUrl, displayOrder }));

const entries = [
  ['everyday-notebook', 'The everyday notebook', 24900, 'stationery', 'notebook', 'A fresh page for plans, sketches, and everything in between. An illustrative ruled notebook for everyday ideas.'],
  ['ceramic-mug', 'A little joy ceramic mug', 39900, 'gifts', 'mug', 'A simple ceramic mug for slow mornings and thoughtful gifting. Illustrative catalogue item.'],
  ['wooden-play-blocks', 'Colourful play blocks', 64900, 'toys', 'toys', 'A colourful collection for imaginative play. Sample product; age guidance and specifications will be supplied with the live catalogue.'],
  ['classic-watch', 'The classic everyday watch', 129900, 'watches', 'watch', 'An understated finishing touch for your everyday style. Illustrative watch; live specifications may differ.'],
  ['desk-companion', 'The desk companion', 34900, 'stationery', 'desk', 'Make a little room for your next good idea. A sample stationery selection for a thoughtful workspace.'],
  ['everyday-basketball', 'Everyday basketball', 79900, 'sports', 'sports', 'Bring a little play to your day. Sample sports catalogue item; final details will appear in the live store.'],
  ['little-green-corner', 'A little green corner', 49900, 'decoration', 'decor', 'A small decorative touch to bring a room together. Illustrative catalogue item.'],
  ['thoughtful-gift-box', 'The thoughtful gift box', 59900, 'gifts', 'gifts', 'A little something for someone special. A sample gift presentation; final contents will be listed in the live catalogue.'],
] as const;

export const sampleProducts: Product[] = entries.map(([slug, name, price, categorySlug, image, description], i) => {
  const category = sampleCategories.find(c => c.slug === categorySlug)!;
  return { id: `demo-${slug}`, slug, name, description, sku: `PREVIEW-${i + 1}`, sellingPricePaise: price, mrpPaise: price,
    availableQuantity: i === 6 ? 0 : 12, inStock: i !== 6, isFeatured: i < 4, isNew: i >= 4,
    category: { id: category.id, slug: category.slug, name: category.name },
    images: [{ url: `/assets/${image}.jpg`, altText: name, mediaType: 'IMAGE' }],
  };
});
