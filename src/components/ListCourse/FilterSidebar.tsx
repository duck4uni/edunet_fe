import React from 'react';
import { Button, Slider, Rate, Tag, Spin, Typography } from 'antd';
import { ReloadOutlined, StarFilled } from '@ant-design/icons';
import { useGetCategoriesQuery } from '../../services/courseApi';

const { Text } = Typography;

type LevelFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

interface FilterSidebarProps {
  selectedCategoryId?: string;
  onCategoryChange: (categoryId?: string) => void;
  selectedLevel: LevelFilter;
  onLevelChange: (level: LevelFilter) => void;
  minimumRating: number;
  onMinimumRatingChange: (rating: number) => void;
  priceRange: [number, number];
  maxPrice: number;
  onPriceRangeChange: (value: [number, number]) => void;
  onReset: () => void;
}

const LEVEL_OPTIONS: Array<{ label: string; value: LevelFilter }> = [
  { label: 'Tất cả trình độ', value: 'all' },
  { label: 'Người mới', value: 'beginner' },
  { label: 'Trung cấp', value: 'intermediate' },
  { label: 'Nâng cao', value: 'advanced' },
];

const formatPrice = (value: number): string => {
  if (value <= 0) return '0 đ';
  if (value < 1000) return `$${value.toFixed(2).replace(/\.00$/, '')}`;
  return `${new Intl.NumberFormat('vi-VN').format(value)} đ`;
};

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  selectedCategoryId,
  onCategoryChange,
  selectedLevel,
  onLevelChange,
  minimumRating,
  onMinimumRatingChange,
  priceRange,
  maxPrice,
  onPriceRangeChange,
  onReset,
}) => {
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetCategoriesQuery({ size: 'unlimited' });
  const categories = categoriesData?.data?.rows || [];

  return (
    <aside className="h-full rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold" style={{ color: 'var(--primaryColor)' }}>
          Bộ lọc khóa học
        </h3>
        <Button
          type="text"
          size="small"
          icon={<ReloadOutlined />}
          onClick={onReset}
          className="!px-1 font-medium"
          style={{ color: 'var(--textState500Secondary)' }}
        >
          Đặt lại
        </Button>
      </div>

      {(selectedCategoryId || selectedLevel !== 'all' || minimumRating > 0) && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {selectedCategoryId && (
            <Tag
              closable
              onClose={() => onCategoryChange(undefined)}
              className="!rounded-full !border-none !px-2 !py-0 !text-xs"
              style={{
                backgroundColor: 'var(--textState500Secondary)',
                color: 'var(--textStateWhite)',
              }}
            >
              {categories.find((category) => category.id === selectedCategoryId)?.name || 'Danh mục đã chọn'}
            </Tag>
          )}
          {selectedLevel !== 'all' && (
            <Tag className="!rounded-full !border-none !px-2 !py-0 !text-xs" style={{ backgroundColor: 'var(--primaryColor50)' }}>
              {LEVEL_OPTIONS.find((item) => item.value === selectedLevel)?.label}
            </Tag>
          )}
          {minimumRating > 0 && (
            <Tag className="!rounded-full !border-none !px-2 !py-0 !text-xs" style={{ backgroundColor: 'var(--textStateLightOrange)' }}>
              <StarFilled /> {minimumRating}+ sao
            </Tag>
          )}
        </div>
      )}

      <div className="space-y-5">
        <section>
          <Text className="mb-2 block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--primaryColor)' }}>
            Danh mục
          </Text>
          {isCategoriesLoading ? (
            <div className="flex justify-center py-3">
              <Spin size="small" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {categories.map((category) => {
                const isActive = selectedCategoryId === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => onCategoryChange(isActive ? undefined : category.id)}
                    className="rounded-full border px-2.5 py-1 text-xs transition-all"
                    style={{
                      borderColor: isActive ? 'var(--textState500Secondary)' : '#dbeafe',
                      color: isActive ? 'var(--textStateWhite)' : 'var(--primaryColor)',
                      backgroundColor: isActive ? 'var(--textState500Secondary)' : 'transparent',
                    }}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <Text className="mb-2 block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--primaryColor)' }}>
            Trình độ
          </Text>
          <div className="grid gap-1.5">
            {LEVEL_OPTIONS.map((levelOption) => {
              const isActive = selectedLevel === levelOption.value;

              return (
                <button
                  key={levelOption.value}
                  type="button"
                  onClick={() => onLevelChange(levelOption.value)}
                  className="rounded-lg border px-2.5 py-1.5 text-left text-xs transition-all"
                  style={{
                    borderColor: isActive ? 'var(--textState500Primary)' : '#e2e8f0',
                    backgroundColor: isActive ? 'var(--primaryColor50)' : 'transparent',
                    color: 'var(--primaryColor)',
                  }}
                >
                  {levelOption.label}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <Text className="mb-2 block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--primaryColor)' }}>
            Khoảng giá
          </Text>
          <Slider
            range
            value={priceRange}
            onChange={(value) => onPriceRangeChange(value as [number, number])}
            min={0}
            max={maxPrice}
            className="course-filter-slider"
            tooltip={{ formatter: (value) => formatPrice(value || 0) }}
          />
          <div className="mt-1.5 flex justify-between text-xs text-gray-500">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </section>

        <section>
          <Text className="mb-2 block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--primaryColor)' }}>
            Đánh giá tối thiểu
          </Text>
          <Rate
            className="text-base"
            allowClear
            value={minimumRating}
            onChange={(value) => onMinimumRatingChange(value || 0)}
            style={{ color: 'var(--textStateLightOrange)' }}
          />
        </section>
      </div>
    </aside>
  );
};

export default FilterSidebar;
