'use client';

import { useState, useEffect } from 'react';
import { Product, ProductFilters } from '@/types/product';

interface UseProductsOptions {
  filters?: ProductFilters;
  limit?: number;
}

export const useProducts = (options: UseProductsOptions = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();

        if (options.filters?.category) {
          queryParams.append('category', options.filters.category);
        }
        if (options.filters?.minPrice) {
          queryParams.append('minPrice', options.filters.minPrice.toString());
        }
        if (options.filters?.maxPrice) {
          queryParams.append('maxPrice', options.filters.maxPrice.toString());
        }
        if (options.filters?.search) {
          queryParams.append('search', options.filters.search);
        }
        if (options.filters?.sortBy) {
          queryParams.append('sortBy', options.filters.sortBy);
        }
        if (options.limit) {
          queryParams.append('limit', options.limit.toString());
        }

        const response = await fetch(`/api/products?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        setProducts(data.products || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [
    options.filters?.category,
    options.filters?.minPrice,
    options.filters?.maxPrice,
    options.filters?.search,
    options.filters?.sortBy,
    options.limit,
  ]);

  return { products, isLoading, error };
};