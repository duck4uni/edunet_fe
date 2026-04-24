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
      <div className="py-3">
        <Empty description="Nội dung khóa học đang được cập nhật" />
      </div>
    );
  }

  return (
    <div className="py-1">
      <Collapse defaultActiveKey={['0']} ghost className="detail-course-collapse">
        {content?.map((section, index) => (
          <Panel
            key={index}
            header={
              <div className="flex items-center justify-between gap-2 pr-2">
                <span className="text-[13px] font-semibold text-[var(--primaryColor)] md:text-[14px]">
                  {typeof section.order === 'number' ? `Bài ${section.order}: ` : ''}
                  {section.title}
                </span>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
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
                  className="mb-1.5 flex items-center justify-between rounded-md border border-[rgba(48,194,236,0.16)] bg-white px-2.5 py-1.5 last:mb-0"
                >
                  <div className="flex flex-col gap-0.5 text-[12px] text-gray-600">
                    <div className="flex items-center gap-2">
                      <ReadOutlined className="text-state-500-secondary" />
                      <span>{item}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-gray-500">
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
