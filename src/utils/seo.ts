export interface SeoOptions {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  robots?: string;
  type?: 'website' | 'article';
  canonicalPath?: string;
  structuredData?: Record<string, unknown> | null;
}

const SEO_MARKER = 'data-academix-seo';
const DEFAULT_OG_IMAGE = '/academix-seo.png';

const getAbsoluteUrl = (pathOrUrl?: string): string => {
  if (!pathOrUrl) return window.location.href;

  try {
    return new URL(pathOrUrl, window.location.origin).toString();
  } catch {
    return window.location.href;
  }
};

const upsertMetaByName = (name: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
  element.setAttribute(SEO_MARKER, '1');
};

const upsertMetaByProperty = (property: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
  element.setAttribute(SEO_MARKER, '1');
};

const upsertCanonical = (href: string) => {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
  element.setAttribute(SEO_MARKER, '1');
};

const upsertJsonLd = (data: Record<string, unknown> | null | undefined) => {
  const selector = 'script[type="application/ld+json"][data-seo-id="academix-jsonld"]';
  const existing = document.head.querySelector<HTMLScriptElement>(selector);

  if (!data) {
    if (existing) {
      existing.remove();
    }
    return;
  }

  const script = existing || document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-seo-id', 'academix-jsonld');
  script.setAttribute(SEO_MARKER, '1');
  script.text = JSON.stringify(data);

  if (!existing) {
    document.head.appendChild(script);
  }
};

export const applySeo = (options: SeoOptions) => {
  const canonicalUrl = getAbsoluteUrl(options.canonicalPath || window.location.pathname);
  const imageUrl = getAbsoluteUrl(options.image || DEFAULT_OG_IMAGE);
  const robotsValue = options.robots || 'index, follow';
  const typeValue = options.type || 'website';

  document.title = options.title;

  upsertMetaByName('description', options.description);
  upsertMetaByName('robots', robotsValue);

  if (options.keywords && options.keywords.length > 0) {
    upsertMetaByName('keywords', options.keywords.join(', '));
  }

  upsertMetaByProperty('og:title', options.title);
  upsertMetaByProperty('og:description', options.description);
  upsertMetaByProperty('og:type', typeValue);
  upsertMetaByProperty('og:url', canonicalUrl);
  upsertMetaByProperty('og:image', imageUrl);
  upsertMetaByProperty('og:site_name', 'Academix');

  upsertMetaByName('twitter:card', 'summary_large_image');
  upsertMetaByName('twitter:title', options.title);
  upsertMetaByName('twitter:description', options.description);
  upsertMetaByName('twitter:image', imageUrl);

  upsertCanonical(canonicalUrl);
  upsertJsonLd(options.structuredData);
};