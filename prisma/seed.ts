import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...\n');

  // Create admin user
  console.log('👤 Creating admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@shoestyle.com' },
    });

    if (!existingAdmin) {
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@shoestyle.com',
          name: 'Admin User',
          hashedPassword,
          role: 'admin',
          emailVerified: new Date(),
        },
      });
      console.log('✅ Created admin user:', adminUser.email);
    } else {
      console.log('ℹ️  Admin user already exists:', existingAdmin.email);
    }
  } catch (error: any) {
    console.log('❌ Error creating admin user:', error.message);
  }

  // Create regular user
  console.log('\n👤 Creating regular user...');
  const userPassword = await bcrypt.hash('user123', 10);
  
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: 'user@shoestyle.com' },
    });

    if (!existingUser) {
      const regularUser = await prisma.user.create({
        data: {
          email: 'user@shoestyle.com',
          name: 'Test User',
          hashedPassword: userPassword,
          role: 'user',
          emailVerified: new Date(),
        },
      });
      console.log('✅ Created regular user:', regularUser.email);
    } else {
      console.log('ℹ️  Regular user already exists:', existingUser.email);
    }
  } catch (error: any) {
    console.log('❌ Error creating regular user:', error.message);
  }

  // Create sample products
  console.log('\n📦 Creating products...');
  const products = [
    {
      slug: 'air-max-classic',
      name: 'Air Max Classic',
      description: 'Comfortable and stylish running shoes with superior cushioning.',
      price: 129.99,
      compareAtPrice: 159.99,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772',
      ],
      category: 'Sneakers',
      colors: ['Black', 'White', 'Red'],
      sizes: ['7', '8', '9', '10', '11', '12'],
      stock: 50,
      isNew: true,
      isFeatured: true,
      rating: 4.5,
      reviewCount: 128,
      tags: ['running', 'athletic', 'popular'],
      sku: 'AMC-001',
      brand: 'Nike',
      material: 'Mesh and Synthetic',
      isActive: true,
    },
    {
      slug: 'leather-boots',
      name: 'Premium Leather Boots',
      description: 'Handcrafted leather boots for any occasion.',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f',
      images: ['https://images.unsplash.com/photo-1608256246200-53e635b5b65f'],
      category: 'Boots',
      colors: ['Brown', 'Black'],
      sizes: ['7', '8', '9', '10', '11', '12'],
      stock: 30,
      isFeatured: true,
      rating: 4.8,
      reviewCount: 95,
      tags: ['formal', 'leather', 'premium'],
      sku: 'PLB-001',
      brand: 'Timberland',
      material: 'Genuine Leather',
      isActive: true,
    },
    {
      slug: 'casual-sneakers',
      name: 'Casual Comfort Sneakers',
      description: 'Perfect for everyday wear with maximum comfort.',
      price: 79.99,
      compareAtPrice: 99.99,
      image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2',
      images: ['https://images.unsplash.com/photo-1460353581641-37baddab0fa2'],
      category: 'Casual',
      colors: ['White', 'Navy', 'Gray'],
      sizes: ['6', '7', '8', '9', '10', '11'],
      stock: 75,
      isNew: true,
      rating: 4.3,
      reviewCount: 64,
      tags: ['casual', 'comfortable'],
      sku: 'CCS-001',
      brand: 'Adidas',
      material: 'Canvas',
      isActive: true,
    },
  ];

  let productsCreated = 0;
  for (const product of products) {
    try {
      const existingProduct = await prisma.product.findUnique({
        where: { slug: product.slug },
      });

      if (!existingProduct) {
        await prisma.product.create({ data: product });
        console.log('  ✅ Created:', product.name);
        productsCreated++;
      } else {
        console.log('  ℹ️  Exists:', product.name);
      }
    } catch (error: any) {
      console.log('  ❌ Error:', product.name, '-', error.message);
    }
  }

  console.log(`\n📊 Products created: ${productsCreated} / ${products.length}`);

  // Create sample coupons
  console.log('\n🎟️  Creating coupons...');
  const coupons = [
    {
      code: 'WELCOME10',
      description: 'Welcome discount for new customers',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      usageLimit: 100,
      isActive: true,
      categories: [],
      excludedCategories: [],
      productIds: [],
      excludedProductIds: [],
    },
    {
      code: 'SAVE20',
      description: '$20 off on orders over $100',
      discountType: 'FIXED_AMOUNT',
      discountValue: 20,
      minPurchase: 100,
      usageLimit: 50,
      isActive: true,
      categories: [],
      excludedCategories: [],
      productIds: [],
      excludedProductIds: [],
    },
  ];

  let couponsCreated = 0;
  for (const coupon of coupons) {
    try {
      const existingCoupon = await prisma.coupon.findUnique({
        where: { code: coupon.code },
      });

      if (!existingCoupon) {
        await prisma.coupon.create({ data: coupon });
        console.log('  ✅ Created:', coupon.code);
        couponsCreated++;
      } else {
        console.log('  ℹ️  Exists:', coupon.code);
      }
    } catch (error: any) {
      console.log('  ❌ Error:', coupon.code, '-', error.message);
    }
  }

  console.log(`\n📊 Coupons created: ${couponsCreated} / ${coupons.length}`);

  // Create shipping zones
  console.log('\n🚚 Creating shipping zones...');
  const shippingZones = [
    {
      name: 'United States',
      countries: ['US'],
      states: [],
      baseCost: 10,
      perKgCost: 2,
      freeShippingThreshold: 100,
      isActive: true,
    },
    {
      name: 'International',
      countries: ['CA', 'UK', 'AU'],
      states: [],
      baseCost: 25,
      perKgCost: 5,
      freeShippingThreshold: 200,
      isActive: true,
    },
  ];

  for (const zone of shippingZones) {
    try {
      const existing = await prisma.shippingZone.findFirst({
        where: { name: zone.name },
      });

      if (!existing) {
        await prisma.shippingZone.create({ data: zone });
        console.log('  ✅ Created:', zone.name);
      } else {
        console.log('  ℹ️  Exists:', zone.name);
      }
    } catch (error: any) {
      console.log('  ❌ Error:', zone.name, '-', error.message);
    }
  }

  console.log('\n🎉 Seeding completed!\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Fatal error during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });