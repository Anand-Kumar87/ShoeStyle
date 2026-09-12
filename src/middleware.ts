import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 🔥 Z+ Security Optimization: Token sirf ek baar fetch karein
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // ==========================================
  // 1. 🚨 ADMIN ROUTES PROTECTION (Pages + API Endpoints)
  // ==========================================
  if (path.startsWith('/admin')) {
    const userRole = token?.role?.toString().toUpperCase();

    if (!token || userRole !== 'ADMIN') {
      console.warn(`[GATEWAY SECURITY ALERT] Unauthorized admin page access attempt: ${path}`);
      return NextResponse.redirect(new URL('/auth/signin?error=AccessDenied', request.url));
    }
  }

  // 🛡️ API Gateway Level Protection for Admin APIs
  if (path.startsWith('/api/admin')) {
    const userRole = token?.role?.toString().toUpperCase();

    if (!token || userRole !== 'ADMIN') {
      console.warn(`[GATEWAY SECURITY ALERT] Blocked unauthorized API access: ${path}`);
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Admin authentication token required at Gateway level.',
          gatewayBlocked: true,
        },
        { status: 401 }
      );
    }
  }

  // ==========================================
  // 2. 👤 USER ROUTES PROTECTION (Account, Orders)
  // ==========================================
  if (path.startsWith('/account') || path.startsWith('/orders')) {
    if (!token) {
      const callbackUrl = encodeURIComponent(path);
      return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, request.url));
    }
  }

  // 3. Security Headers for Enterprise Hardening
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

// 🎯 MATCHER: Intercept both page routes and protected API endpoints at Gateway Edge
export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    '/orders/:path*',
    '/api/admin/:path*'
  ],
};