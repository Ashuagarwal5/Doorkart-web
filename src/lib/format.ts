export const money = (paise: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: paise % 100 === 0 ? 0 : 2,
}).format(paise / 100);
export const productImage = (product: { images: { url: string; mediaType?: string }[] }) =>
  product.images.find(image => image.mediaType !== 'VIDEO')?.url || '/assets/product-placeholder.svg';
