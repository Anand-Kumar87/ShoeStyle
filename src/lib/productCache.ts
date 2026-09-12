/**
 * High-Performance In-Memory Cache for Products
 * 
 * Designed to sustain 200,000 to 500,000+ daily visitors without database bottleneck.
 * Features:
 * - Ultra-fast in-memory cache for storefront product catalog (TTL: 30s)
 * - Single-product lookup caching (TTL: 60s)
 * - Instant invalidation when admin creates, updates, or deletes any product
 * - Zero external dependency (runs directly in Node.js process memory)
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

let productListCache: CacheEntry<any[]> | null = null;
const singleProductCache = new Map<string, CacheEntry<any>>();

const CATALOG_CACHE_TTL_MS = 30 * 1000; // 30 seconds
const SINGLE_PRODUCT_TTL_MS = 60 * 1000; // 60 seconds

export function getCachedProducts(): any[] | null {
  if (productListCache && Date.now() < productListCache.expiresAt) {
    return productListCache.data;
  }
  return null;
}

export function setCachedProducts(products: any[]): void {
  productListCache = {
    data: products,
    expiresAt: Date.now() + CATALOG_CACHE_TTL_MS,
  };
}

export function getCachedSingleProduct(idOrSlug: string): any | null {
  const entry = singleProductCache.get(idOrSlug);
  if (entry && Date.now() < entry.expiresAt) {
    return entry.data;
  }
  return null;
}

export function setCachedSingleProduct(idOrSlug: string, product: any): void {
  // Cap map size to prevent unbounded memory growth
  if (singleProductCache.size > 2000) {
    const oldestKey = singleProductCache.keys().next().value;
    if (oldestKey) singleProductCache.delete(oldestKey);
  }

  singleProductCache.set(idOrSlug, {
    data: product,
    expiresAt: Date.now() + SINGLE_PRODUCT_TTL_MS,
  });
}

/**
 * Invalidate all product caches immediately upon create/update/delete
 */
export function invalidateProductCache(): void {
  productListCache = null;
  singleProductCache.clear();
}
