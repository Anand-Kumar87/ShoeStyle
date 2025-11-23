import * as Sentry from '@sentry/nextjs';

export const initSentry = () => {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
      beforeSend(event, hint) {
        // Filter out certain errors
        if (event.exception) {
          const error = hint.originalException;
          if (error && typeof error === 'object' && 'statusCode' in error) {
            if ((error as any).statusCode === 404) {
              return null;
            }
          }
        }
        return event;
      },
    });
  }
};

export const captureException = Sentry.captureException;
export const captureMessage = Sentry.captureMessage;