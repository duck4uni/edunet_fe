import React, { useMemo } from 'react';
import { Breadcrumb, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useLocation, useMatches, useNavigate } from 'react-router-dom';

type BreadcrumbHandle = {
  breadcrumb?: string | ((params: Record<string, string | undefined>) => string);
  hideBreadcrumb?: boolean;
};

type RouteMatch = {
  id: string;
  pathname: string;
  params: Record<string, string | undefined>;
  handle?: BreadcrumbHandle;
};

const prettifySegment = (segment: string) =>
  segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());

const RouteBreadcrumb: React.FC = () => {
  const matches = useMatches() as RouteMatch[];
  const navigate = useNavigate();
  const location = useLocation();

  const breadcrumbItems = useMemo(() => {
    const crumbs = matches
      .filter((match) => !match.handle?.hideBreadcrumb)
      .map((match) => {
        const handler = match.handle?.breadcrumb;

        if (typeof handler === 'function') {
          return {
            key: match.id,
            label: handler(match.params),
            path: match.pathname,
          };
        }

        if (typeof handler === 'string') {
          return {
            key: match.id,
            label: handler,
            path: match.pathname,
          };
        }

        const fallbackSegment = match.pathname.split('/').filter(Boolean).pop();
        if (!fallbackSegment) {
          return null;
        }

        return {
          key: match.id,
          label: prettifySegment(fallbackSegment),
          path: match.pathname,
        };
      })
      .filter((item): item is { key: string; label: string; path: string } => Boolean(item));

    return crumbs.map((crumb, index) => {
      const isLast = index === crumbs.length - 1;

      return {
        key: crumb.key,
        title: isLast ? (
          <span className="global-route-current">{crumb.label}</span>
        ) : (
          <Link to={crumb.path}>{crumb.label}</Link>
        ),
      };
    });
  }, [matches]);

  if (!location.pathname.startsWith('/my-course')) {
    return null;
  }

  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <div className="global-route-breadcrumb">
      <div className="global-route-breadcrumb-inner">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          className="global-route-back-btn"
          onClick={() => navigate(-1)}
          disabled={location.pathname === '/'}
        >
          Trở về
        </Button>
        <Breadcrumb items={breadcrumbItems} className="global-route-breadcrumb-path" />
      </div>
    </div>
  );
};

export default RouteBreadcrumb;
