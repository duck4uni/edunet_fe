import {
  ADMIN_DEFAULT_SEO,
  AUTH_DEFAULT_SEO,
  DEFAULT_SEO,
  ROUTE_SEO_CONFIG,
  type RouteSeoConfig,
} from '../src/constants/seo';

interface SeoPayload {
  title: string;
  description: string;
  keywords?: string[];
  robots?: string;
  image?: string;
  type?: 'website' | 'article';
}

const getDefaultSeoByPath = (pathname: string) => {
  if (pathname.startsWith('/admin')) return ADMIN_DEFAULT_SEO;
  if (pathname.startsWith('/auth')) return AUTH_DEFAULT_SEO;
  return DEFAULT_SEO;
};

const computeScore = (pattern: string): number => {
  return pattern
    .split('/')
    .filter(Boolean)
    .reduce((score, segment) => {
      if (segment === '*') return score;
      if (segment.startsWith(':')) return score + 1;
      return score + 3;
    }, 0);
};

const matchesPattern = (pattern: string, pathname: string): boolean => {
  if (pattern === pathname) return true;

  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/:\w+/g, '[^/]+')
    .replace(/\*/g, '.*');

  const regex = new RegExp(`^${escaped}$`);
  return regex.test(pathname);
};

const findRouteSeo = (pathname: string): RouteSeoConfig | null => {
  let bestMatch: RouteSeoConfig | null = null;
  let bestScore = -1;

  ROUTE_SEO_CONFIG.forEach((config) => {
    if (!matchesPattern(config.path, pathname)) return;

    const score = computeScore(config.path);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = config;
    }
  });

  return bestMatch;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');

const getOrigin = (req: any): string => {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
};

const toAbsoluteUrl = (url: string | undefined, origin: string): string => {
  if (!url) return `${origin}/academix-seo.png`;
  try {
    return new URL(url, origin).toString();
  } catch {
    return `${origin}/academix-seo.png`;
  }
};

const getApiBaseUrl = (): string | null => {
  const candidates = [
    process.env.SEO_API_BASE_URL,
    process.env.VITE_API_BASE_URL,
    process.env.API_BASE_URL,
  ];

  const found = candidates.find((value) => typeof value === 'string' && value.trim());
  return found ? found.replace(/\/+$/, '') : null;
};

const getCourseSeo = async (courseId: string, origin: string): Promise<SeoPayload | null> => {
  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) return null;

  try {
    const response = await fetch(
      `${apiBaseUrl}/courses/${encodeURIComponent(courseId)}?include=category|teacher`,
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
      },
    );

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as any;
    const course = payload?.data;
    if (!course) return null;

    const description = String(
      course.description || course.goal || 'Khám phá khóa học chất lượng trên Academix.',
    )
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 180);

    const keywords = [
      'Academix',
      'khóa học',
      course.category?.name,
      course.level,
      course.language,
      ...(Array.isArray(course.tags) ? course.tags : []),
    ].filter(Boolean);

    return {
      title: `${course.title} | Khóa học | Academix`,
      description,
      keywords,
      robots: 'index, follow',
      image: toAbsoluteUrl(course.thumbnail, origin),
      type: 'article',
    };
  } catch {
    return null;
  }
};

const buildHtml = (seo: SeoPayload, canonicalUrl: string, imageUrl: string) => {
  const title = escapeHtml(seo.title);
  const description = escapeHtml(seo.description);
  const keywords = escapeHtml((seo.keywords || []).join(', '));
  const robots = escapeHtml(seo.robots || 'index, follow');
  const type = escapeHtml(seo.type || 'website');
  const escapedCanonical = escapeHtml(canonicalUrl);
  const escapedImage = escapeHtml(imageUrl);
  const escapedFavicon = escapeHtml(new URL('/academix.ico', canonicalUrl).toString());

  return `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/x-icon" href="${escapedFavicon}" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="keywords" content="${keywords}" />
    <meta name="robots" content="${robots}" />
    <link rel="canonical" href="${escapedCanonical}" />

    <meta property="og:site_name" content="Academix" />
    <meta property="og:type" content="${type}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${escapedCanonical}" />
    <meta property="og:image" content="${escapedImage}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${escapedImage}" />
  </head>
  <body>
    <main>
      <h1>${title}</h1>
      <p>${description}</p>
      <p><a href="${escapedCanonical}">Mở trang</a></p>
    </main>
  </body>
</html>`;
};

export default async function handler(req: any, res: any) {
  const origin = getOrigin(req);
  const rawPath = typeof req.query.path === 'string' ? req.query.path : '/';
  const pathname = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  const canonicalUrl = `${origin}${pathname}`;

  let seo: SeoPayload | null = null;

  const courseMatch = pathname.match(/^\/courses\/([^/]+)$/);
  if (courseMatch) {
    seo = await getCourseSeo(courseMatch[1], origin);
  }

  if (!seo) {
    const defaultSeo = getDefaultSeoByPath(pathname);
    const routeSeo = findRouteSeo(pathname);

    seo = {
      title: routeSeo?.title || defaultSeo.title,
      description: routeSeo?.description || defaultSeo.description,
      keywords: routeSeo?.keywords || defaultSeo.keywords,
      robots: routeSeo?.robots || defaultSeo.robots,
      type: pathname.startsWith('/courses/') ? 'article' : 'website',
    };
  }

  const imageUrl = toAbsoluteUrl(seo.image, origin);
  const html = buildHtml(seo, canonicalUrl, imageUrl);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400');
  return res.status(200).send(html);
}
