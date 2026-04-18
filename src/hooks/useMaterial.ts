import { useState, useMemo } from 'react';

import { useGetMaterialsByCourseQuery, useCreateMaterialMutation, useDeleteMaterialMutation } from '../services/learningApi';
import { useGetProfileQuery } from '../services/authApi';
import type { MaterialItem } from '../types/myCourse';

import { notify } from '../utils/notify';
export const useMaterial = (courseId: string) => {
  const { data: profileData } = useGetProfileQuery();
  const userRole = (profileData?.data?.role as 'student' | 'teacher') || 'student';

  const { data: materialsData, isLoading } = useGetMaterialsByCourseQuery(courseId, {
    skip: !courseId,
  });
  const [createMaterial] = useCreateMaterialMutation();
  const [deleteMaterial] = useDeleteMaterialMutation();

  const materials: MaterialItem[] = useMemo(() => {
    const raw = materialsData?.data;
    if (!raw) return [];
    return raw.map((m) => ({
      id: m.id,
      title: m.title,
      type: m.type,
      size: m.size,
      uploadedAt: m.createdAt,
      downloadUrl: m.downloadUrl,
      description: m.description,
    }));
  }, [materialsData]);

  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredMaterials = useMemo(() => {
    return materials.filter(material => {
      const matchesSearch = material.title.toLowerCase().includes(searchText.toLowerCase());
      const matchesType = filterType === 'all' || material.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [materials, searchText, filterType]);

  const stats = useMemo(() => ({
    total: materials.length,
    pdf: materials.filter(m => m.type === 'pdf').length,
    video: materials.filter(m => m.type === 'video').length,
    document: materials.filter(m => m.type === 'document').length,
  }), [materials]);

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'pdf':
        return { color: 'red', text: 'PDF' };
      case 'video':
        return { color: 'blue', text: 'Video' };
      case 'document':
        return { color: 'green', text: 'Tài liệu' };
      case 'link':
        return { color: 'purple', text: 'Liên kết' };
      case 'image':
        return { color: 'orange', text: 'Hình ảnh' };
      default:
        return { color: 'default', text: 'Tệp' };
    }
  };

  const handleUpload = () => {
    setIsModalOpen(true);
  };

  const handleDelete = async (materialId: string) => {
    try {
      await deleteMaterial(materialId).unwrap();
      notify.success('Đã xóa tài liệu');
    } catch {
      notify.error('Xóa tài liệu thất bại');
    }
  };

  const handleSubmit = async (values: { title: string; type: string; downloadUrl?: string; description?: string }) => {
    try {
      await createMaterial({
        title: values.title,
        type: values.type as MaterialItem['type'],
        downloadUrl: values.downloadUrl || '',
        description: values.description,
        courseId,
      }).unwrap();
      notify.success('Đã tải lên tài liệu');
      setIsModalOpen(false);
    } catch {
      notify.error('Tải lên tài liệu thất bại');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return {
    userRole,
    materials,
    filteredMaterials,
    searchText,
    setSearchText,
    filterType,
    setFilterType,
    isModalOpen,
    isLoading,
    stats,
    getTypeConfig,
    handleUpload,
    handleDelete,
    handleSubmit,
    closeModal,
  };
};
