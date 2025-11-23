'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { motion } from 'framer-motion';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  cta: {
    text: string;
    href: string;
  };
}

const slides: HeroSlide[] = [
  {
    id: '1',
    title: 'STEP INTO STYLE',
    subtitle: 'Discover the latest collection of premium footwear',
    image: '/images/slides/slide1.avif',
    cta: { text: 'Shop Now', href: '/products?tag=new' },
  },
  {
    id: '2',
    title: 'RUN THE WORLD',
    subtitle: 'Performance sneakers for athletes',
    image: '/images/slides/slide2.avif',
    cta: { text: 'Explore Collection', href: '/products?category=athletic' },
  },
  {
    id: '3',
    title: 'TIMELESS CLASSICS',
    subtitle: 'Elegant designs that never go out of style',
    image: '/images/slides/slide3.avif',
    cta: { text: 'View Classics', href: '/products?tag=classic' },
  },
];

const HeroCarousel: React.FC = () => {
  return (
    <section className="relative h-[500px] md:h-[600px] lg:h-[700px] bg-neutral-900">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: false,
        }}
        loop={true}
        speed={1000}
        className="h-full w-full"
        grabCursor={true}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <SlideContent slide={slide} isPriority={index === 0} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Pagination Styles */}
      <style jsx global>{`
        .swiper-pagination {
          bottom: 24px !important;
          z-index: 10;
        }

        .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.6);
          opacity: 1;
          width: 12px;
          height: 12px;
          transition: all 0.3s ease;
        }

        .swiper-pagination-bullet-active {
          background: white;
          width: 32px;
          border-radius: 6px;
        }

        @media (min-width: 768px) {
          .swiper-pagination {
            bottom: 32px !important;
          }
        }
      `}</style>
    </section>
  );
};

// Separate component for slide content to optimize re-renders
interface SlideContentProps {
  slide: HeroSlide;
  isPriority: boolean;
}

const SlideContent: React.FC<SlideContentProps> = ({ slide, isPriority }) => {
  return (
    <div className="relative h-full w-full">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={slide.image}
          alt={slide.title}
          fill
          className="object-cover object-center"
          // priority={isPriority}
          priority
          quality={90}
          sizes="100vw"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k="
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

      {/* Content Container */}
      <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-6">
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl"
          >
            {slide.title}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-base text-neutral-200 sm:text-lg lg:text-xl"
          >
            {slide.subtitle}
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Link
              href={slide.cta.href}
              className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-neutral-900 shadow-xl transition-all duration-300 hover:scale-105 hover:bg-neutral-100 hover:shadow-2xl sm:px-10 sm:py-4 sm:text-base"
              aria-label={`${slide.cta.text} - ${slide.title}`}
            >
              {slide.cta.text}
              <svg
                className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
  );
};

export default HeroCarousel;