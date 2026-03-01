export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export type View = 'shop' | 'cart' | 'checkout' | 'admin' | 'product-detail' | 'collections' | 'about' | 'new-arrivals' | 'best-sellers' | 'sale' | 'shipping' | 'returns' | 'faq' | 'contact';
