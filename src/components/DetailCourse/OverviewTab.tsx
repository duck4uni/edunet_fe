import React from 'react';

interface OverviewTabProps {
  description: string;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ description }) => {
  const hasDescription = Boolean(description?.trim());

  return (
    <div className="py-2">
      <h3 className="detail-course-section-title">Tổng quan khóa học</h3>
      {hasDescription ? (
        <div dangerouslySetInnerHTML={{ __html: description }} className="detail-course-richtext" />
      ) : (
        <p className="detail-course-empty-note">Nội dung tổng quan đang được cập nhật.</p>
      )}
    </div>
  );
};

export default OverviewTab;
