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
    <div className="rounded-2xl border border-sky-100 bg-white p-3.5 shadow-sm md:p-4">
      <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto pb-1">
        <div className="flex min-w-max items-center gap-2">
          <Title level={5} className="!mb-0 !text-base md:!text-lg" style={{ color: 'var(--primaryColor)' }}>
            Khám phá khóa học
          </Title>
          <span className="text-xs text-gray-300">|</span>
          <Text className="whitespace-nowrap text-xs text-gray-500 md:text-sm">
            Hiển thị
            <span className="font-semibold" style={{ color: 'var(--textState500Secondary)' }}>
              {' '}{totalCourses}
            </span>
            / {totalFromApi} khóa học
          </Text>
        </div>

        <div className="mx-1 h-5 w-px shrink-0 bg-gray-200" aria-hidden="true" />

        <div className="flex shrink-0 items-center gap-2">
          <Text className="text-xs text-gray-500">Dạng xem:</Text>
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

        <div className="mx-1 h-5 w-px shrink-0 bg-gray-200" aria-hidden="true" />

        <Input
          size="middle"
          placeholder="Tìm tên khóa học hoặc giảng viên"
          prefix={<SearchOutlined className="text-gray-400" />}
          value={searchValue}
          onChange={(event) => onSearchValueChange(event.target.value)}
          className="!w-72 !rounded-lg !border-gray-200 hover:!border-[var(--textState500Primary)] focus:!border-[var(--textState500Primary)]"
          allowClear
        />

        <Select
          size="middle"
          value={sortValue}
          onChange={(value) => onSortChange(value as CourseSortOption)}
          className="!w-[170px]"
          popupClassName="rounded-xl"
          suffixIcon={<SortAscendingOutlined className="text-gray-400" />}
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
