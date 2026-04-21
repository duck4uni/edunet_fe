import { useEffect } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import {
  ADMIN_DEFAULT_SEO,
  AUTH_DEFAULT_SEO,
  DEFAULT_SEO,
  ROUTE_SEO_CONFIG,
} from '../constants/seo';
import type { RouteSeoConfig } from '../constants/seo';
import { applySeo } from '../utils/seo';

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

const findRouteSeo = (pathname: string): RouteSeoConfig | null => {
  let bestMatch: RouteSeoConfig | null = null;
  let bestScore = -1;

  ROUTE_SEO_CONFIG.forEach((config) => {
    const isWildcard = config.path.endsWith('/*');
    const matched = matchPath({ path: config.path, end: !isWildcard }, pathname);
    if (!matched) return;

    const score = computeScore(config.path);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = config;
    }
  });

  return bestMatch;
};

const getDefaultSeoByPath = (pathname: string) => {
  if (pathname.startsWith('/admin')) return ADMIN_DEFAULT_SEO;
  if (pathname.startsWith('/auth')) return AUTH_DEFAULT_SEO;
  return DEFAULT_SEO;
};

export const useRouteSeo = () => {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;
    const defaultSeo = getDefaultSeoByPath(pathname);
    const routeSeo = findRouteSeo(pathname);

    applySeo({
      title: routeSeo?.title || defaultSeo.title,
      description: routeSeo?.description || defaultSeo.description,
      keywords: routeSeo?.keywords || defaultSeo.keywords,
      robots: routeSeo?.robots || defaultSeo.robots,
      canonicalPath: pathname,
      type: pathname.startsWith('/courses/') ? 'article' : 'website',
    });
  }, [location.pathname]);
};