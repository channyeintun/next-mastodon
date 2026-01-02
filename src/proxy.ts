import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
    '/compose',
    '/bookmarks',
    '/settings',
    '/profile/edit',
    '/scheduled',
    '/follow-requests',
    '/lists',
    '/conversations',
    '/notifications/requests',
];

// Routes that should redirect to home if authenticated
const authRoutes = ['/auth/signin'];

// Next.js proxy
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get auth state from cookies
    const accessToken = request.cookies.get('accessToken')?.value;
    const isAuthenticated = !!accessToken;

    // Check if accessing protected route
    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    // Check if accessing auth route
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

    // Redirect unauthenticated users from protected routes to sign-in
    if (isProtectedRoute && !isAuthenticated) {
        const signInUrl = new URL('/auth/signin', request.url);
        const response = NextResponse.redirect(signInUrl);
        // Store the intended destination in a cookie for post-auth redirect
        // Note: Not httpOnly so client-side JS can read it in the callback
        response.cookies.set('authRedirect', pathname, {
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 10, // 10 minutes - short-lived
        });
        return response;
    }

    // Redirect authenticated users from auth routes to home
    if (isAuthRoute && isAuthenticated) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Redirect unauthenticated users from home page to explore
    if (pathname === '/' && !isAuthenticated) {
        return NextResponse.redirect(new URL('/explore', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
