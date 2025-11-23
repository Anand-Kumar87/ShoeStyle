export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';

// Log page view
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Log specific events
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// E-commerce events
export const trackPurchase = (transaction: {
  id: string;
  revenue: number;
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
}) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'purchase', {
      transaction_id: transaction.id,
      value: transaction.revenue,
      currency: 'USD',
      items: transaction.items,
    });
  }
};

export const trackAddToCart = (product: {
  id: string;
  name: string;
  price: number;
}) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'add_to_cart', {
      currency: 'USD',
      value: product.price,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          price: product.price,
        },
      ],
    });
  }
};