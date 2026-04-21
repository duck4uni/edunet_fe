import { useEffect } from 'react';
import type { SeoOptions } from '../utils/seo';
import { applySeo } from '../utils/seo';

export const useSeo = (options: SeoOptions) => {
  const keywordsDigest = (options.keywords || []).join('|');
  const structuredDataDigest = options.structuredData
    ? JSON.stringify(options.structuredData)
    : '';

  useEffect(() => {
    applySeo(options);
  }, [
    options.title,
    options.description,
    options.image,
    options.robots,
    options.type,
    options.canonicalPath,
    keywordsDigest,
    structuredDataDigest,
  ]);
};