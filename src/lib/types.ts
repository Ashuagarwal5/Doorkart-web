export type Category = {
  id: string; name: string; slug: string; description: string | null;
  imageUrl: string | null; displayOrder: number;
};
export type Product = {
  id: string; name: string; slug: string; description: string; sku: string;
  sellingPricePaise: number; mrpPaise: number; availableQuantity: number;
  inStock: boolean; isFeatured: boolean; isNew: boolean;
  category: Pick<Category, 'id' | 'name' | 'slug'>;
  images: { url: string; altText: string | null; mediaType?: string }[];
};
export type ProductPage = {
  items: Product[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};
export type DeliveryArea = {
  id: string; name: string; pincode: string | null; deliveryChargePaise: number;
  minimumOrderPaise: number | null; freeDeliveryThresholdPaise: number | null;
};
export type ShopInfo = {
  name: string; phone: string | null; email: string | null; whatsapp: string | null;
  address: string | null; hours: string | null;
};
export type CartLine = { product: Product; quantity: number };
export type OrderInput = {
  clientRequestId: string;
  customer: { fullName: string; mobile: string };
  address: { addressLine1: string; addressLine2: string; landmark: string; city: string; pincode: string };
  deliveryAreaId: string;
  items: { productId: string; quantity: number }[];
  paymentMethod: 'COD';
};
export type Order = {
  orderNumber: string; orderStatus: string; paymentStatus: string; paymentMethod: 'COD';
  customerName: string; customerPhone: string;
  deliveryAddress: { addressLine1: string; addressLine2: string | null; landmark: string | null; area: string; city: string; pincode: string };
  items: { productId: string; productName: string; quantity: number; unitPricePaise: number; lineTotalPaise: number }[];
  subtotalPaise: number; deliveryChargePaise: number; discountPaise: number; grandTotalPaise: number;
  createdAt: string; statusHistory: { status: string; note: string | null; createdAt: string }[];
};
export type PlacedOrder = Order & { trackingToken: string };
export type Catalog = { categories: Category[]; products: Product[]; demo: boolean; error: string | null; shop: ShopInfo | null };
