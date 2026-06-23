import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'Name required').max(255),
  sku: z.string().min(2).max(50),
  category: z.string().min(1, 'Select category'),
  price: z.number().min(0.01, 'Price required'),
  originalPrice: z.number().min(0).optional(),
  stock: z.number().int().min(0),
  description: z.string().max(1000).optional(),
  image: z.string().url().optional(),
});

export type Product = z.infer<typeof productSchema> & { id: string; createdAt: string };

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  search: string;
  category: string;
  status: string;
}

export interface ApiResponse<T> {
  data: T;
  total: number;
  page: number;
  limit: number;
}
