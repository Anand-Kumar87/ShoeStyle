import { create } from 'zustand';
import { PaginationParams, Product, ApiResponse } from '@/types/products';

interface ProductStore {
  products: Product[];
  total: number;
  loading: boolean;
  error: string | null;
  params: PaginationParams;
  
  setParams: (params: Partial<PaginationParams>) => void;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  reset: () => void;
}

const defaultParams: PaginationParams = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  search: '',
  category: '',
  status: '',
};

export const useProductStore = create<ProductStore>((set, get) => {
  return {
    products: [],
    total: 0,
    loading: false,
    error: null,
    params: defaultParams,

  setParams: (newParams) => {
    set((state) => ({
      params: { ...state.params, ...newParams, page: newParams.page ? newParams.page : 1 }
    }));
  },

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const { params } = get();
      const query = new URLSearchParams({
        page: String(params.page),
        limit: String(params.limit),
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
        search: params.search,
        category: params.category,
        status: params.status,
      });

      const res = await fetch(`/api/admin/products?${query}`);
      if (!res.ok) throw new Error('Failed to fetch');

      const data: ApiResponse<Product[]> = await res.json();
      set({ products: data.data, total: data.total });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  addProduct: async (product) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (!res.ok) throw new Error('Failed to add product');
      await get().fetchProducts();
    } catch (error) {
      throw error;
    }
  },

  updateProduct: async (id, updates) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update');
      await get().fetchProducts();
    } catch (error) {
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      await get().fetchProducts();
    } catch (error) {
      throw error;
    }
  },

  reset: () => set({ params: defaultParams, products: [], total: 0 }),
  };
});
