// Employee Management Hook
import { useState, useEffect, useCallback, useMemo } from 'react';

import type { Employee, TableParams, AdminRole } from '../types/admin';
import { employees as mockEmployees } from '../constants/adminData';

import { notify } from '../utils/notify';
interface EmployeeFilters {
  status?: string;
  department?: string;
  role?: AdminRole;
  search?: string;
}

export const useEmployeeManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [filters, setFilters] = useState<EmployeeFilters>({});
  const [tableParams, setTableParams] = useState<TableParams>({
    page: 1,
    pageSize: 10,
  });

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setEmployees(mockEmployees);
    } catch (error) {
      notify.error('Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    let result = [...employees];

    if (filters.status) {
      result = result.filter(e => e.status === filters.status);
    }

    if (filters.department) {
      result = result.filter(e => e.department === filters.department);
    }

    if (filters.role) {
      result = result.filter(e => e.role === filters.role);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        e =>
          `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchLower) ||
          e.email.toLowerCase().includes(searchLower) ||
          e.employeeId.toLowerCase().includes(searchLower) ||
          e.position.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [employees, filters]);

  // Paginated employees
  const paginatedEmployees = useMemo(() => {
    const { page, pageSize } = tableParams;
    const start = (page - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, tableParams]);

  // Create employee
  const createEmployee = useCallback(async (data: Omit<Employee, 'id' | 'createdAt'>) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newEmployee: Employee = {
        ...data,
        id: `emp-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      
      setEmployees(prev => [...prev, newEmployee]);
      
      notify.success('Đã thêm nhân viên mới');
      return { success: true, employee: newEmployee };
    } catch (error) {
      notify.error('Không thể thêm nhân viên');
      return { success: false };
    }
  }, []);

  // Add employee (alias for createEmployee)
  const addEmployee = createEmployee;

  // Update employee
  const updateEmployee = useCallback(async (employeeId: string, data: Partial<Employee>) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setEmployees(prev =>
        prev.map(e =>
          e.id === employeeId ? { ...e, ...data } : e
        )
      );
      
      notify.success('Đã cập nhật thông tin nhân viên');
      return { success: true };
    } catch (error) {
      notify.error('Không thể cập nhật nhân viên');
      return { success: false };
    }
  }, []);

  // Delete employee
  const deleteEmployee = useCallback(async (employeeId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setEmployees(prev => prev.filter(e => e.id !== employeeId));
      
      notify.success('Đã xóa nhân viên');
      return { success: true };
    } catch (error) {
      notify.error('Không thể xóa nhân viên');
      return { success: false };
    }
  }, []);

  // Change employee status
  const changeEmployeeStatus = useCallback(async (employeeId: string, status: Employee['status']) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setEmployees(prev =>
        prev.map(e =>
          e.id === employeeId ? { ...e, status } : e
        )
      );
      
      const statusLabels = {
        active: 'Đang làm việc',
        inactive: 'Nghỉ việc',
        on_leave: 'Nghỉ phép',
      };
      
      notify.success(`Đã cập nhật trạng thái: ${statusLabels[status]}`);
      return { success: true };
    } catch (error) {
      notify.error('Không thể cập nhật trạng thái');
      return { success: false };
    }
  }, []);

  // Get employee by ID
  const getEmployeeById = useCallback((employeeId: string) => {
    return employees.find(e => e.id === employeeId) || null;
  }, [employees]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Statistics
  const statistics = useMemo(() => ({
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    onLeave: employees.filter(e => e.status === 'on_leave').length,
    inactive: employees.filter(e => e.status === 'inactive').length,
    totalSalary: employees
      .filter(e => e.status === 'active')
      .reduce((sum, e) => sum + (e.salary || 0), 0),
    byDepartment: employees.reduce((acc, e) => {
      acc[e.department] = (acc[e.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  }), [employees]);

  // Get all departments for filters
  const allDepartments = useMemo(() => {
    const depts = new Set<string>();
    employees.forEach(e => depts.add(e.department));
    return Array.from(depts).sort();
  }, [employees]);

  // Get all positions for filters  
  const allPositions = useMemo(() => {
    const positions = new Set<string>();
    employees.forEach(e => positions.add(e.position));
    return Array.from(positions).sort();
  }, [employees]);

  return {
    employees: paginatedEmployees,
    allEmployees: filteredEmployees,
    loading,
    selectedEmployee,
    setSelectedEmployee,
    filters,
    setFilters,
    tableParams,
    setTableParams,
    statistics,
    total: filteredEmployees.length,
    allDepartments,
    allPositions,
    fetchEmployees,
    addEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    changeEmployeeStatus,
    getEmployeeById,
  };
};
