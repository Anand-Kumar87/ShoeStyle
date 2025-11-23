import Head from 'next/head';
import Link from 'next/link';
import Button from '@/components/common/Button';
import { Home, Search } from 'lucide-react';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found | ShoeStyle</title>
      </Head>

      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-neutral-900">404</h1>
          <h2 className="mt-4 text-3xl font-bold text-neutral-900">
            Page Not Found
          </h2>
          <p className="mt-4 text-lg text-neutral-600">
            Sorry, we couldn't find the page you're looking for.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/">
              <Button leftIcon={<Home className="h-5 w-5" />} size="lg">
                Go Home
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" leftIcon={<Search className="h-5 w-5" />} size="lg">
                Browse Products
              </Button>
            </Link>
          </div>

          <div className="mt-12">
            <p className="text-sm text-neutral-500">
              Lost? Try using our search or navigation menu.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}