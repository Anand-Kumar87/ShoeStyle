import { GetServerSideProps } from 'next';
import prisma from '@/lib/prisma';

function generateSiteMap(
  baseUrl: string,
  products: { slug: string; updatedAt: Date }[],
  categories: { slug: string }[]
) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Core Static Pages -->
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/products</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/sale</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/new-arrivals</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/faq</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/shipping</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/returns</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/size-guide</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/stores</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- Dynamic Active Products -->
  ${products
    .map(({ slug, updatedAt }) => {
      const date = updatedAt ? new Date(updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      return `
  <url>
    <loc>${baseUrl}/products/${slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join('')}

  <!-- Dynamic Categories -->
  ${categories
    .map(({ slug }) => {
      return `
  <url>
    <loc>${baseUrl}/products?category=${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    })
    .join('')}
</urlset>
`;
}

export const getServerSideProps: GetServerSideProps = async ({ res, req }) => {
  const host = req.headers.host || 'shoestyle.in';
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const baseUrl = `${protocol}://${host}`;

  let products: { slug: string; updatedAt: Date }[] = [];
  let categories: { slug: string }[] = [];

  try {
    products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
      take: 2000,
    });
  } catch (error) {
    console.error('Sitemap product fetch error:', error);
  }

  try {
    categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true },
    });
  } catch (error) {
    console.error('Sitemap category fetch error:', error);
  }

  const sitemap = generateSiteMap(baseUrl, products, categories);

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.write(sitemap.trim());
  res.end();

  return {
    props: {},
  };
};

export default function SiteMap() {
  return null;
}
