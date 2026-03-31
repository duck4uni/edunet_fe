import React, { useState } from 'react';
import { Input, Select, Button, Segmented, Typography } from 'antd';
import { SearchOutlined, AppstoreOutlined, UnorderedListOutlined, FilterOutlined, SortAscendingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface SortAndSearchProps {
  onSearch: (value: string) => void;
  onViewChange?: (view: 'grid' | 'list') => void;
  totalCourses?: number;
}

const SortAndSearch: React.FC<SortAndSearchProps> = ({ onSearch, onViewChange, totalCourses = 156 }) => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchValue, setSearchValue] = useState('');

  const handleViewChange = (value: string | number) => {
    const newView = value as 'grid' | 'list';
    setView(newView);
    onViewChange?.(newView);
  };

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <Title level={2} className="!mb-1 !text-[#012643]">Khám phá khóa học</Title>
          <Text className="text-gray-500">
            Hiển thị <span className="font-semibold text-[#012643]">{totalCourses}</span> khóa học có sẵn
          </Text>
        </div>
        
        {/* View Toggle - Desktop */}
        <div className="hidden md:flex items-center gap-3">
          <Text className="text-gray-500">Hiển thị:</Text>
          <Segmented
            value={view}
            onChange={handleViewChange}
            options={[
              { value: 'grid', icon: <AppstoreOutlined /> },
              { value: 'list', icon: <UnorderedListOutlined /> },
            ]}
            className="bg-gray-100"
          />
        </div>
      </div>

      {/* Search and Sort Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <Input
              size="large"
              placeholder="Tìm khóa học, chủ đề hoặc giảng viên..."
              prefix={<SearchOutlined className="text-gray-400 text-lg" />}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onPressEnter={() => onSearch(searchValue)}
              className="!rounded-xl !border-gray-200 hover:!border-[#e5698e] focus:!border-[#e5698e]"
              allowClear
            />
          </div>

          {/* Sort and Filter */}
          <div className="flex gap-3">
            <Select
              size="large"
              defaultValue="newest"
              className="w-full lg:w-48"
              popupClassName="rounded-xl"
              suffixIcon={<SortAscendingOutlined className="text-gray-400" />}
              options={[
                { value: 'newest', label: 'Mới nhất' },
                { value: 'popular', label: 'Phổ biến nhất' },
                { value: 'rating', label: 'Đánh giá cao nhất' },
                { value: 'price-low', label: 'Giá: Thấp đến Cao' },
                { value: 'price-high', label: 'Giá: Cao đến Thấp' },
              ]}
            />
            
            {/* Mobile Filter Button */}
            <Button 
              size="large" 
              icon={<FilterOutlined />}
              className="lg:hidden !rounded-xl !border-gray-200"
            >
              Bộ lọc
            </Button>

            <Button 
              type="primary" 
              size="large" 
              icon={<SearchOutlined />}
              onClick={() => onSearch(searchValue)}
              className="!bg-[#012643] !border-[#012643] hover:!bg-[#023e6d] !rounded-xl !px-6"
            >
              Tìm kiếm
            </Button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Text className="text-gray-500 mr-2">Lọc nhanh:</Text>
          {['Miễn phí', 'Phù hợp người mới', 'Có chứng chỉ', 'Mới trong tuần', 'Đánh giá cao'].map((filter) => (
            <Button 
              key={filter}
              size="small"
              className="!rounded-full !border-gray-200 hover:!border-[#e5698e] hover:!text-[#e5698e]"
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SortAndSearch;
