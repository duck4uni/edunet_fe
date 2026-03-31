import React from 'react';

interface OverviewTabProps {
  description: string;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ description }) => {
  return (
    <div className="py-4">
      <h3 className="text-xl font-bold mb-4 text-[#012643]">Tổng quan khóa học</h3>
      <div dangerouslySetInnerHTML={{ __html: description || '' }} className="text-gray-600 leading-relaxed" />
    </div>
  );
};

export default OverviewTab;
