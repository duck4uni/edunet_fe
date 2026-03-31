import React from 'react';

interface DescriptionTabProps {
  goal: string;
}

const DescriptionTab: React.FC<DescriptionTabProps> = ({ goal }) => {
  return (
    <div className="py-4">
      <h3 className="text-xl font-bold mb-4 text-[#012643]">Bạn sẽ học được gì</h3>
      <div dangerouslySetInnerHTML={{ __html: goal || '' }} className="text-gray-600 leading-relaxed" />
    </div>
  );
};

export default DescriptionTab;
