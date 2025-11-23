import { GetStaticProps } from 'next';
import Head from 'next/head';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PromoTicker from '@/components/layout/PromoTicker';
import HeroCarousel from '@/components/hero/HeroCarousel';
import ProductGrid from '@/components/product/ProductGrid';
import BrandCarousel from '@/components/ui/BrandCarousel';
import { Product } from '@/types/product';
import { prisma } from '@/lib/prisma';
import { generateSEO } from '@/utils/seo';
import Button from '@/components/common/Button';
import Link from 'next/link';

interface HomeProps {
  featuredProducts: Product[];
  newArrivals: Product[];
}

export default function Home({ featuredProducts, newArrivals }: HomeProps) {
  const seo = generateSEO({
    title: 'Home',
    description: 'Shop the latest collection of premium footwear at ShoeStyle',
    url: 'https://shoestyle.com',
  });

  return (
    <>
      <Head>
        <title>{seo.title as string}</title>
        <meta name="description" content={seo.description as string} />
        <meta property="og:title" content={seo.openGraph?.title as string} />
        <meta property="og:description" content={seo.openGraph?.description as string} />
      </Head>

      <PromoTicker />
      <Header />

      <main>
        {/* Hero Section */}
        <HeroCarousel />

        {/* Featured Products */}
        <section className="py-16">
          <div className="container-custom">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-neutral-900">Featured Products</h2>
              <p className="mt-2 text-neutral-600">Discover our most popular items</p>
            </div>
            <ProductGrid products={featuredProducts} />
            <div className="mt-12 text-center">
              <Link href="/products">
                <Button size="lg">View All Products</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Brand Carousel */}
        <BrandCarousel />

        {/* New Arrivals */}
        <section className="py-16">
          <div className="container-custom">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-neutral-900">New Arrivals</h2>
              <p className="mt-2 text-neutral-600">Check out the latest additions</p>
            </div>
            <ProductGrid products={newArrivals} />
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-neutral-900 py-16 text-white">
          <div className="container-custom text-center">
            <h2 className="text-3xl font-bold">Join Our Newsletter</h2>
            <p className="mt-4 text-neutral-300">
              Get exclusive offers and early access to new products
            </p>
            <div className="mt-8 flex justify-center">
              <div className="flex w-full max-w-md gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-lg border-0 px-4 py-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <Button variant="secondary">Subscribe</Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const featuredProducts = await prisma.product.findMany({
    where: { isFeatured: true },
    take: 8,
  });

  const newArrivals = await prisma.product.findMany({
    where: { isNew: true },
    take: 8,
    orderBy: { createdAt: 'desc' },
  });

  return {
    props: {
      featuredProducts: JSON.parse(JSON.stringify(featuredProducts)),
      newArrivals: JSON.parse(JSON.stringify(newArrivals)),
    },
    revalidate: 3600, // Revalidate every hour
  };
};