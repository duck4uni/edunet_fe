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
    <aside className="course-filter-panel h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_26px_-20px_rgba(15,23,42,0.45)]">
      <div className="mb-1 flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.04em]">
          Bộ lọc khóa học
        </h3>
        <Button
          type="text"
          size="small"
          icon={<ReloadOutlined />}
          onClick={onReset}
          className="course-filter-reset !h-7 !px-1.5 !text-[11px] font-medium"
        >
          Đặt lại
        </Button>
      </div>

      {(selectedCategoryId || selectedLevel !== 'all' || minimumRating > 0) && (
        <div className="mb-3.5 flex flex-wrap gap-1.5">
          {selectedCategoryId && (
            <Tag
              closable
              onClose={() => onCategoryChange(undefined)}
              className="course-filter-active-tag !rounded-full !border-none !px-2 !py-0.5 !text-[11px]"
              style={{
                backgroundColor: 'var(--textState500Secondary)',
                color: 'var(--textStateWhite)',
              }}
            >
              {categories.find((category) => category.id === selectedCategoryId)?.name || 'Danh mục đã chọn'}
            </Tag>
          )}
       
          {minimumRating > 0 && (
            <Tag className="course-filter-active-tag !rounded-full !border-none !px-2 !py-0.5 !text-[11px]" style={{ backgroundColor: 'var(--textStateLightOrange)' }}>
              <StarFilled /> {minimumRating}+ sao
            </Tag>
          )}
        </div>
      )}

      <div className="space-y-4">
        <section className="course-filter-section">
          <Text className="course-filter-label mb-2 block text-[11px] font-semibold uppercase">
            Danh mục
          </Text>
          {isCategoriesLoading ? (
            <div className="flex justify-center py-3">
              <Spin size="small" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const isActive = selectedCategoryId === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => onCategoryChange(isActive ? undefined : category.id)}
                    className={`course-filter-chip ${isActive ? 'is-active' : ''}`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="course-filter-section">
          <Text className="course-filter-label mb-2 block text-[11px] font-semibold uppercase">
            Trình độ
          </Text>
          <div className="grid gap-2">
            {LEVEL_OPTIONS.map((levelOption) => {
              const isActive = selectedLevel === levelOption.value;

              return (
                <button
                  key={levelOption.value}
                  type="button"
                  onClick={() => onLevelChange(levelOption.value)}
                  className={`course-filter-level ${isActive ? 'is-active' : ''}`}
                >
                  {levelOption.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="course-filter-section">
          <Text className="course-filter-label mb-2 block text-[11px] font-semibold uppercase">
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
          <div className="mt-1.5 flex justify-between text-[12px] text-slate-500">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </section>

        <section>
          <Text className="course-filter-label mb-2 block text-[11px] font-semibold uppercase">
            Đánh giá tối thiểu
          </Text>
          <Rate
            className="text-[13px]"
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
