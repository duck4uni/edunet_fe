import React from 'react';
import { Collapse, Empty } from 'antd';
import { ClockCircleOutlined, FileProtectOutlined, PlayCircleOutlined, ReadOutlined, UnlockOutlined } from '@ant-design/icons';
import type { CourseSection } from '../../models/course';

const { Panel } = Collapse;

interface ContentTabProps {
  content: CourseSection[];
}

const ContentTab: React.FC<ContentTabProps> = ({ content }) => {
  if (!content?.length) {
    return (
      <div className="py-4">
        <Empty description="Nội dung khóa học đang được cập nhật" />
      </div>
    );
  }

  return (
    <div className="py-2">
      <Collapse defaultActiveKey={['0']} ghost className="detail-course-collapse">
        {content?.map((section, index) => (
          <Panel
            key={index}
            header={
              <div className="flex items-center justify-between gap-4 pr-3">
                <span className="text-base font-semibold text-[var(--primaryColor)] md:text-lg">
                  {typeof section.order === 'number' ? `Bài ${section.order}: ` : ''}
                  {section.title}
                </span>
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 md:text-sm">
                  {section.duration ? (
                    <span className="inline-flex items-center gap-1">
                      <ClockCircleOutlined className="text-state-500-primary" />
                      {section.duration}
                    </span>
                  ) : null}
                  <span>{section.items.length} mục</span>
                </div>
              </div>
            }
          >
            <ul className="list-none pl-0">
              {section.items.map((item, idx) => (
                <li
                  key={idx}
                  className="mb-2 flex items-center justify-between rounded-xl border border-[rgba(48,194,236,0.16)] bg-white px-3 py-2.5 last:mb-0"
                >
                  <div className="flex flex-col gap-1 text-gray-600">
                    <div className="flex items-center gap-2">
                      <ReadOutlined className="text-state-500-secondary" />
                      <span>{item}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      {section.type ? (
                        <span className="inline-flex items-center gap-1">
                          <PlayCircleOutlined className="text-state-500-primary" />
                          {section.type}
                        </span>
                      ) : null}
                      <span className="inline-flex items-center gap-1">
                        {section.isFree ? (
                          <UnlockOutlined className="text-state-500-secondary" />
                        ) : (
                          <FileProtectOutlined className="text-state-light-orange" />
                        )}
                        {section.isFree ? 'Miễn phí' : 'Nội dung trả phí'}
                      </span>
                    </div>
                  </div>
                  <FileProtectOutlined className="text-state-500-primary" />
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </Collapse>
    </div>
  );
};

export default ContentTab;
