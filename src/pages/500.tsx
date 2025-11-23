import Head from 'next/head';
import Link from 'next/link';
import Button from '@/components/common/Button';
import { Home, RefreshCw } from 'lucide-react';

export default function Custom500() {
  return (
    <>
      <Head>
        <title>500 - Server Error | ShoeStyle</title>
      </Head>

      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-neutral-900">500</h1>
          <h2 className="mt-4 text-3xl font-bold text-neutral-900">
            Server Error
          </h2>
          <p className="mt-4 text-lg text-neutral-600">
            Oops! Something went wrong on our end.
          </p>
          <p className="mt-2 text-neutral-500">
            We're working to fix the issue. Please try again later.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button
              leftIcon={<RefreshCw className="h-5 w-5" />}
              size="lg"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
            <Link href="/">
              <Button variant="outline" leftIcon={<Home className="h-5 w-5" />} size="lg">
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}