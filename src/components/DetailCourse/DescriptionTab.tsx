import React from 'react';

interface DescriptionTabProps {
  goal: string;
}

const DescriptionTab: React.FC<DescriptionTabProps> = ({ goal }) => {
  const hasGoal = Boolean(goal?.trim());

  return (
    <div className="py-2">
      <h3 className="detail-course-section-title">Bạn sẽ học được gì</h3>
      {hasGoal ? (
        <div dangerouslySetInnerHTML={{ __html: goal }} className="detail-course-richtext" />
      ) : (
        <p className="detail-course-empty-note">Mục tiêu học tập đang được cập nhật.</p>
      )}
    </div>
  );
};

export default DescriptionTab;
