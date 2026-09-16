import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/request';

const PROTECTED_PREFIXES = ['/editor', '/api/editor'];

const intlMiddleware = createIntlMiddleware({
  locales: locales as unknown as string[],
  defaultLocale: defaultLocale,
  localePrefix: 'always',
});

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function unauthorizedResponse(): NextResponse {
  return new NextResponse('Auth required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="RuralCommerce Editor"',
    },
  });
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const pathLocale = pathname.split('/').filter(Boolean)[0];
  const locale = locales.includes(pathLocale as (typeof locales)[number]) ? pathLocale : defaultLocale;
  const stripped = pathname.replace(/^\/(es|pt-BR|en)(?=\/|$)/, '') || '/';

  if (stripped === '/planta' || stripped.startsWith('/planta/')) {
    const url = request.nextUrl.clone();
    if (stripped === '/planta/convite' || stripped.startsWith('/planta/convite')) {
      url.pathname = `/${locale}/impulsacr/convite`;
    } else {
      url.pathname = `/${locale}/impulsacr/planta${stripped.slice('/planta'.length)}`;
    }
    return NextResponse.redirect(url);
  }

  // Handle editor authentication
  if (isProtectedPath(pathname)) {
    const isDev = process.env.NODE_ENV !== 'production';
    const forceAuthInDev = process.env.EDITOR_FORCE_AUTH_IN_DEV === '1';
    
    if (!isDev || forceAuthInDev) {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Basic ')) {
        return unauthorizedResponse();
      }

      const encoded = authHeader.slice(6);
      let decoded = '';
      try {
        decoded = atob(encoded);
      } catch {
        return unauthorizedResponse();
      }
      const separator = decoded.indexOf(':');
      if (separator === -1) {
        return unauthorizedResponse();
      }

      const user = decoded.slice(0, separator);
      const password = decoded.slice(separator + 1);

      const expectedUser = process.env.EDITOR_BASIC_USER || 'admin';
      const expectedPassword = process.env.EDITOR_BASIC_PASSWORD || 'ruralcommerce123';

      if (user !== expectedUser || password !== expectedPassword) {
        return unauthorizedResponse();
      }
    }

    return NextResponse.next();
  }

  // Apply i18n middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)', '/api/editor/:path*'],
};
