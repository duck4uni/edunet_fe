// Page Header Component
import React from 'react';
import { Breadcrumb, Button, Space } from 'antd';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

interface BreadcrumbItem {
  title: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: BreadcrumbItem[];
  extra?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumb = [],
  extra,
  showBack = false,
  onBack,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const breadcrumbItems = [
    {
      title: (
        <Link to="/admin">
          <HomeOutlined />
        </Link>
      ),
    },
    ...breadcrumb.map((item) => ({
      title: item.path ? (
        <Link to={item.path}>{item.title}</Link>
      ) : (
        item.title
      ),
    })),
  ];

  return (
    <div className="page-header mb-6">
      {breadcrumb.length > 0 && (
        <Breadcrumb 
          items={breadcrumbItems}
          className="mb-3"
        />
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBack && (
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={handleBack}
              className="flex items-center justify-center"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-800 m-0">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-500 mt-1 mb-0">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {extra && (
          <Space>
            {extra}
          </Space>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
