// Employee Management Hook — connected to real API
import { useState, useCallback, useMemo } from 'react';

import type { Employee, TableParams, AdminRole } from '../types/admin';
import { useGetUsersQuery, useUpdateUserMutation, useDeleteUserMutation } from '../services/userApi';
import { useRegisterMutation } from '../services/authApi';

import { notify } from '../utils/notify';

interface EmployeeFilters {
  status?: string;
  department?: string;
  role?: AdminRole;
  search?: string;
}

interface CreateEmployeeInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  status?: Employee['status'];
  address?: string;
}

const DEFAULT_DEPARTMENT = 'Vận hành';
const DEFAULT_POSITION = 'Quản trị viên';

const mapToEmployee = (user: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  address?: string;
}, index: number): Employee => ({
  id: user.id,
  employeeId: `EMP${String(index + 1).padStart(3, '0')}`,
  firstName: user.firstName || '',
  lastName: user.lastName || '',
  email: user.email,
  phone: user.phone || '',
  avatar: user.avatar,
  department: DEFAULT_DEPARTMENT,
  position: DEFAULT_POSITION,
  role: 'admin',
  status: user.isActive ? 'active' : 'inactive',
  hireDate: user.createdAt,
  salary: undefined,
  address: user.address || '',
  createdAt: user.createdAt,
});

export const useEmployeeManagement = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [filters, setFilters] = useState<EmployeeFilters>({});
  const [tableParams, setTableParams] = useState<TableParams>({
    page: 1,
    pageSize: 10,
  });

  const {
    data: usersData,
    isLoading,
    isFetching,
    refetch,
  } = useGetUsersQuery({
    size: 'unlimited',
    filter: 'role:eq:admin',
    sort: 'createdAt:desc',
  });

  const [registerUser] = useRegisterMutation();
  const [updateUserApi] = useUpdateUserMutation();
  const [deleteUserApi] = useDeleteUserMutation();

  const allEmployeesData = useMemo(() => {
    const rows = usersData?.data?.rows || [];
    return rows.map((user, index) => mapToEmployee(user, index));
  }, [usersData]);

  const filteredEmployees = useMemo(() => {
    let result = [...allEmployeesData];

    if (filters.status) {
      result = result.filter((employee) => employee.status === filters.status);
    }

    if (filters.department) {
      result = result.filter((employee) => employee.department === filters.department);
    }

    if (filters.role) {
      result = result.filter((employee) => employee.role === filters.role);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (employee) =>
          `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchLower) ||
          employee.email.toLowerCase().includes(searchLower) ||
          employee.employeeId.toLowerCase().includes(searchLower) ||
          employee.position.toLowerCase().includes(searchLower),
      );
    }

    return result;
  }, [allEmployeesData, filters]);

  const paginatedEmployees = useMemo(() => {
    const { page, pageSize } = tableParams;
    const start = (page - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, tableParams]);

  const fetchEmployees = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const createEmployee = useCallback(async (data: CreateEmployeeInput) => {
    try {
      const created = await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: 'admin',
      }).unwrap();

      const createdUserId = created?.data?.user?.id;
      if (createdUserId && (data.status === 'inactive' || data.address)) {
        await updateUserApi({
          id: createdUserId,
          data: {
            isActive: data.status !== 'inactive',
            address: data.address,
          },
        }).unwrap();
      }

      await refetch();
      notify.success('Đã thêm nhân viên mới');
      return { success: true };
    } catch {
      notify.error('Không thể thêm nhân viên');
      return { success: false };
    }
  }, [registerUser, updateUserApi, refetch]);

  const addEmployee = createEmployee;

  const updateEmployee = useCallback(async (employeeId: string, data: Partial<Employee>) => {
    try {
      const payload: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        avatar?: string;
        address?: string;
        city?: string;
        country?: string;
        isActive?: boolean;
      } = {};

      if (data.firstName !== undefined) payload.firstName = data.firstName;
      if (data.lastName !== undefined) payload.lastName = data.lastName;
      if (data.phone !== undefined) payload.phone = data.phone;
      if (data.avatar !== undefined) payload.avatar = data.avatar;
      if (data.address !== undefined) payload.address = data.address;
      if (data.status !== undefined) payload.isActive = data.status !== 'inactive';

      if (Object.keys(payload).length === 0) {
        return { success: true };
      }

      await updateUserApi({ id: employeeId, data: payload }).unwrap();
      await refetch();
      notify.success('Đã cập nhật thông tin nhân viên');
      return { success: true };
    } catch {
      notify.error('Không thể cập nhật nhân viên');
      return { success: false };
    }
  }, [updateUserApi, refetch]);

  const deleteEmployee = useCallback(async (employeeId: string) => {
    try {
      await deleteUserApi(employeeId).unwrap();
      await refetch();
      notify.success('Đã xóa nhân viên');
      return { success: true };
    } catch {
      notify.error('Không thể xóa nhân viên');
      return { success: false };
    }
  }, [deleteUserApi, refetch]);

  const changeEmployeeStatus = useCallback(async (employeeId: string, status: Employee['status']) => {
    return updateEmployee(employeeId, { status });
  }, [updateEmployee]);

  const getEmployeeById = useCallback((employeeId: string) => {
    return allEmployeesData.find((employee) => employee.id === employeeId) || null;
  }, [allEmployeesData]);

  const statistics = useMemo(() => ({
    total: allEmployeesData.length,
    active: allEmployeesData.filter((employee) => employee.status === 'active').length,
    onLeave: allEmployeesData.filter((employee) => employee.status === 'on_leave').length,
    inactive: allEmployeesData.filter((employee) => employee.status === 'inactive').length,
    totalSalary: allEmployeesData
      .filter((employee) => employee.status === 'active')
      .reduce((sum, employee) => sum + (employee.salary || 0), 0),
    byDepartment: allEmployeesData.reduce((acc, employee) => {
      acc[employee.department] = (acc[employee.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  }), [allEmployeesData]);

  const allDepartments = useMemo(() => {
    const departments = new Set<string>();
    allEmployeesData.forEach((employee) => departments.add(employee.department));
    return Array.from(departments).sort();
  }, [allEmployeesData]);

  const allPositions = useMemo(() => {
    const positions = new Set<string>();
    allEmployeesData.forEach((employee) => positions.add(employee.position));
    return Array.from(positions).sort();
  }, [allEmployeesData]);

  return {
    employees: paginatedEmployees,
    allEmployees: filteredEmployees,
    loading: isLoading || isFetching,
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
