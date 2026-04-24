import React from 'react';
import { Input, Select, Segmented, Typography } from 'antd';
import { SearchOutlined, AppstoreOutlined, UnorderedListOutlined, SortAscendingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export type CourseViewMode = 'grid' | 'list';
export type CourseSortOption = 'newest' | 'popular' | 'rating' | 'price-low' | 'price-high';

interface SortAndSearchProps {
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  view: CourseViewMode;
  onViewChange: (view: CourseViewMode) => void;
  sortValue: CourseSortOption;
  onSortChange: (value: CourseSortOption) => void;
  totalCourses: number;
  totalFromApi: number;
}

const SortAndSearch: React.FC<SortAndSearchProps> = ({
  searchValue,
  onSearchValueChange,
  view,
  onViewChange,
  sortValue,
  onSortChange,
  totalCourses,
  totalFromApi,
}) => {
  const handleViewChange = (value: string | number) => {
    onViewChange(value as CourseViewMode);
  };

  return (
    <div className="course-toolbar-panel rounded-[8px] border px-3 py-2 shadow-sm">
      <div className="course-toolbar-row flex flex-wrap items-center gap-2 md:flex-nowrap">
        <div className="course-toolbar-head flex items-center gap-2">
          <Title level={5} className="!mb-0 !text-[14px] font-semibold" style={{ color: 'var(--primaryColor)' }}>
            Khám phá khóa học
          </Title>
          <span className="course-toolbar-divider inline-block h-4 w-px" aria-hidden="true" />
          <Text className="whitespace-nowrap text-[13px]" style={{ color: 'var(--textState500Primary)' }}>
            Hiển thị
            <span className="font-semibold" style={{ color: 'var(--textState500Secondary)' }}>
              {' '}{totalCourses}
            </span>
            / {totalFromApi} khóa học
          </Text>
        </div>

        <div className="course-toolbar-view flex shrink-0 items-center gap-2">
          <Text className="text-[13px]" style={{ color: 'var(--textState500Primary)' }}>Dạng xem:</Text>
          <Segmented
            size="small"
            value={view}
            onChange={handleViewChange}
            options={[
              { label: 'Lưới', value: 'grid', icon: <AppstoreOutlined /> },
              { label: 'Danh sách', value: 'list', icon: <UnorderedListOutlined /> },
            ]}
            className="course-list-segmented bg-[var(--primaryColor50)]"
          />
        </div>

        <div className="course-toolbar-search-wrap min-w-[220px] flex-1">
          <Input
            size="small"
            placeholder="Tìm tên khóa học hoặc giảng viên"
            prefix={<SearchOutlined className="course-toolbar-search-icon" />}
            value={searchValue}
            onChange={(event) => onSearchValueChange(event.target.value)}
            className="course-toolbar-search !w-full !rounded-lg"
            allowClear
          />
        </div>

        <Select
          size="small"
          value={sortValue}
          onChange={(value) => onSortChange(value as CourseSortOption)}
          className="course-toolbar-sort !w-full md:!w-[168px]"
          popupClassName="rounded-lg"
          suffixIcon={<SortAscendingOutlined className="course-toolbar-sort-icon" />}
          options={[
            { value: 'newest', label: 'Mới cập nhật' },
            { value: 'popular', label: 'Nhiều học viên' },
            { value: 'rating', label: 'Đánh giá cao' },
            { value: 'price-low', label: 'Giá tăng dần' },
            { value: 'price-high', label: 'Giá giảm dần' },
          ]}
        />
      </div>
    </div>
  );
};

export default SortAndSearch;
