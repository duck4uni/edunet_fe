// Support Ticket Management Hook — connected to real API
import { useState, useCallback, useMemo } from 'react';

import type { AdminSupportTicket, TicketResponse, TableParams } from '../types/admin';
import {
  useGetTicketsQuery,
  useGetTicketStatsQuery,
  useUpdateTicketMutation,
  useRespondToTicketMutation,
  useResolveTicketMutation,
  useCloseTicketMutation,
} from '../services/supportApi';
import { useGetProfileQuery } from '../services/authApi';
import type { QueryParams } from '../services/supportApi';

import { notify } from '../utils/notify';
interface TicketFilters {
  status?: string;
  category?: string;
  priority?: string;
  assignedTo?: string;
  search?: string;
}

export const useSupportManagement = () => {
  const [selectedTicket, setSelectedTicket] = useState<AdminSupportTicket | null>(null);
  const [filters, setFilters] = useState<TicketFilters>({});
  const [tableParams, setTableParams] = useState<TableParams>({
    page: 1,
    pageSize: 10,
  });

  const { data: profileData } = useGetProfileQuery();

  // Build query params
  const queryParams: QueryParams = useMemo(() => {
    const filterParts: string[] = [];
    if (filters.status) filterParts.push(`status:eq:${filters.status}`);
    if (filters.category) filterParts.push(`category:eq:${filters.category}`);
    if (filters.priority) filterParts.push(`priority:eq:${filters.priority}`);
    if (filters.search) filterParts.push(`subject:like:${filters.search}`);
    return {
      page: tableParams.page,
      size: tableParams.pageSize,
      include: 'user|assignedTo',
      ...(filterParts.length > 0 && { filter: filterParts.join('&&') }),
      sort: 'createdAt:desc',
    };
  }, [filters, tableParams]);

  const {
    data: ticketsData,
    isLoading: loading,
    refetch: fetchTickets,
  } = useGetTicketsQuery(queryParams);

  const { data: statsData } = useGetTicketStatsQuery();

  const [updateTicketApi] = useUpdateTicketMutation();
  const [respondToTicketApi] = useRespondToTicketMutation();
  const [resolveTicketApi] = useResolveTicketMutation();
  const [closeTicketApi] = useCloseTicketMutation();

  const apiRows = ticketsData?.data?.rows || [];
  const total = ticketsData?.data?.count || 0;

  // Map API rows → AdminSupportTicket shape
  const tickets: AdminSupportTicket[] = useMemo(() =>
    apiRows.map(t => ({
      id: t.id,
      ticketId: t.id.slice(0, 8).toUpperCase(),
      userId: t.userId,
      userName: t.user ? `${t.user.firstName} ${t.user.lastName}` : '',
      userEmail: t.user?.email || '',
      userAvatar: t.user?.avatar,
      subject: t.subject,
      description: t.message,
      category: t.category,
      priority: t.priority,
      status: t.status === 'in_progress' ? 'in_progress' as const : t.status,
      assignedTo: t.assignedToId,
      assignedName: t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}` : undefined,
      responses: [] as TicketResponse[],
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    })),
    [apiRows],
  );

  // Assign ticket
  const assignTicket = useCallback(async (ticketId: string, assignedTo: string, _assignedName: string) => {
    try {
      await updateTicketApi({
        id: ticketId,
        data: { assignedToId: assignedTo, status: 'in_progress' } as any,
      }).unwrap();
      notify.success('Đã phân công ticket');
      return { success: true };
    } catch {
      notify.error('Không thể phân công ticket');
      return { success: false };
    }
  }, [updateTicketApi]);

  // Update ticket status
  const updateTicketStatus = useCallback(async (ticketId: string, status: AdminSupportTicket['status']) => {
    try {
      if (status === 'resolved') {
        await resolveTicketApi(ticketId).unwrap();
      } else if (status === 'closed') {
        await closeTicketApi(ticketId).unwrap();
      } else {
        await updateTicketApi({ id: ticketId, data: { status } as any }).unwrap();
      }
      notify.success('Đã cập nhật trạng thái ticket');
      return { success: true };
    } catch {
      notify.error('Không thể cập nhật trạng thái');
      return { success: false };
    }
  }, [updateTicketApi, resolveTicketApi, closeTicketApi]);

  // Update ticket priority
  const updateTicketPriority = useCallback(async (ticketId: string, priority: AdminSupportTicket['priority']) => {
    try {
      await updateTicketApi({ id: ticketId, data: { priority } as any }).unwrap();
      notify.success('Đã cập nhật độ ưu tiên');
      return { success: true };
    } catch {
      notify.error('Không thể cập nhật độ ưu tiên');
      return { success: false };
    }
  }, [updateTicketApi]);

  // Add response to ticket
  const addResponse = useCallback(async (ticketId: string, messageText: string, _attachments?: string[]) => {
    try {
      const currentUser = profileData?.data;
      await respondToTicketApi({ id: ticketId, response: messageText }).unwrap();

      // Optimistically update selectedTicket with new response
      if (selectedTicket?.id === ticketId && currentUser) {
        const newResponse: TicketResponse = {
          id: `resp-${Date.now()}`,
          message: messageText,
          authorId: currentUser.id,
          authorName: `${currentUser.firstName} ${currentUser.lastName}`,
          authorAvatar: currentUser.avatar,
          isStaff: true,
          createdAt: new Date().toISOString(),
        };
        setSelectedTicket(prev =>
          prev
            ? { ...prev, responses: [...prev.responses, newResponse], updatedAt: new Date().toISOString() }
            : null,
        );
      }

      notify.success('Đã gửi phản hồi');
      return { success: true };
    } catch {
      notify.error('Không thể gửi phản hồi');
      return { success: false };
    }
  }, [respondToTicketApi, profileData, selectedTicket]);

  // Close ticket
  const closeTicket = useCallback(async (ticketId: string) => {
    return updateTicketStatus(ticketId, 'closed');
  }, [updateTicketStatus]);

  // Resolve ticket
  const resolveTicket = useCallback(async (ticketId: string) => {
    return updateTicketStatus(ticketId, 'resolved');
  }, [updateTicketStatus]);

  // Reopen ticket
  const reopenTicket = useCallback(async (ticketId: string) => {
    return updateTicketStatus(ticketId, 'open');
  }, [updateTicketStatus]);

  // Get ticket by ID
  const getTicketById = useCallback((ticketId: string) => {
    return tickets.find(t => t.id === ticketId) || null;
  }, [tickets]);

  // Statistics from real API
  const statistics = useMemo(() => {
    const stats = statsData?.data;
    return {
      total: total,
      open: stats?.open ?? 0,
      inProgress: stats?.inProgress ?? 0,
      waiting: 0,
      resolved: stats?.resolved ?? 0,
      closed: stats?.closed ?? 0,
      urgent: tickets.filter(t => t.priority === 'urgent' && t.status !== 'closed' && t.status !== 'resolved').length,
      high: tickets.filter(t => t.priority === 'high' && t.status !== 'closed' && t.status !== 'resolved').length,
      byCategory: tickets.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      avgResponseTime: '-',
    };
  }, [statsData, tickets, total]);

  return {
    tickets,
    allTickets: tickets,
    loading,
    selectedTicket,
    setSelectedTicket,
    filters,
    setFilters,
    tableParams,
    setTableParams,
    statistics,
    total,
    fetchTickets,
    assignTicket,
    updateTicketStatus,
    updateTicketPriority,
    addResponse,
    closeTicket,
    resolveTicket,
    reopenTicket,
    getTicketById,
  };
};
