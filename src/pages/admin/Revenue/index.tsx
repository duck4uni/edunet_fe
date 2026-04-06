// Revenue Management Page - Simplified
import React from 'react';
import { Card, Typography } from 'antd';
import { PageHeader } from '../../../components/admin';

const { Text, Title } = Typography;

const RevenueManagement: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Doanh thu & Thống kê"
        subtitle="Thông tin doanh số đã được ẩn khỏi khu vực quản trị"
        breadcrumb={[{ title: 'Doanh thu' }]}
      />

      <Card>
        <div className="py-10 text-center">
          <Title level={4}>Không hiển thị số liệu doanh số</Title>
          <Text type="secondary">Theo cấu hình hiện tại, toàn bộ chỉ số và báo cáo doanh số ở Admin đã được ẩn.</Text>
        </div>
      </Card>
    </div>
  );
};

export default RevenueManagement;