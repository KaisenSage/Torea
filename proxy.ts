import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    await auth.protect();
  }
}, {
  contentSecurityPolicy: {
    reportOnly: true,
    directives: {
      "default-src": ["'self'"],
      "base-uri": ["'self'"],
      "object-src": ["'none'"],
      "frame-ancestors": ["'self'"],
      "form-action": ["'self'", "https://*.clerk.accounts.dev", "https://*.clerk.com"],
      "script-src": [
        "'self'",
        "'unsafe-inline'",
        "https://*.clerk.accounts.dev",
        "https://*.clerk.com",
        "https://challenges.cloudflare.com",
      ],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:", "blob:", "https:"],
      "font-src": ["'self'", "data:"],
      "connect-src": [
        "'self'",
        "https://*.clerk.accounts.dev",
        "https://*.clerk.com",
        "https://challenges.cloudflare.com",
        "wss://*.clerk.accounts.dev",
        "wss://*.clerk.com",
      ],
      "frame-src": [
        "'self'",
        "https://*.clerk.accounts.dev",
        "https://*.clerk.com",
        "https://challenges.cloudflare.com",
      ],
      "media-src": ["'self'", "blob:", "https:"],
      "worker-src": ["'self'", "blob:"],
    },
  },
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};