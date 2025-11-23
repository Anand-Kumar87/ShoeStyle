import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/common/Button';
import { CheckCircle } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const { orderId } = router.query;

  return (
    <>
      <Head>
        <title>Order Successful | ShoeStyle</title>
      </Head>

      <Header />

      <main className="min-h-screen bg-neutral-50 py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-2xl rounded-lg bg-white p-12 text-center">
            <CheckCircle className="mx-auto mb-6 h-16 w-16 text-green-600" />
            <h1 className="mb-4 text-3xl font-bold text-neutral-900">
              Order Successful!
            </h1>
            <p className="mb-2 text-lg text-neutral-600">
              Thank you for your purchase
            </p>
            <p className="mb-8 text-sm text-neutral-500">
              Order #{orderId}
            </p>
            <p className="mb-8 text-neutral-600">
              We've sent a confirmation email with your order details.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/products">
                <Button variant="outline">Continue Shopping</Button>
              </Link>
              <Link href={`/orders/${orderId}`}>
                <Button>View Order</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}