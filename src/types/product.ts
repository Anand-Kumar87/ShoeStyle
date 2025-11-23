export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  images?: string[];
  category: string;
  colors?: string[];
  sizes?: string[];
  stock: number;
  isNew?: boolean;
  isFeatured?: boolean;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  tags?: string[];
  search?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'popular';
}