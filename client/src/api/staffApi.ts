import axiosInstance from './axiosInstance';
import { FilterOptions, StaffFilters, StaffFormData, StaffListResponse, StaffMember } from '../types';

const buildQueryString = (filters: Partial<StaffFilters>): string => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  });
  return params.toString();
};

export const getStaffApi = async (filters: Partial<StaffFilters>): Promise<StaffListResponse> => {
  const query = buildQueryString(filters);
  const response = await axiosInstance.get<StaffListResponse>(`/api/staff${query ? `?${query}` : ''}`);
  return response.data;
};

export const getStaffByIdApi = async (id: string): Promise<StaffMember> => {
  const response = await axiosInstance.get<{ data: StaffMember }>(`/api/staff/${id}`);
  return response.data.data;
};

export const createStaffApi = async (data: StaffFormData): Promise<StaffMember> => {
  const response = await axiosInstance.post<{ data: StaffMember }>('/api/staff', data);
  return response.data.data;
};

export const updateStaffApi = async (id: string, data: StaffFormData): Promise<StaffMember> => {
  const response = await axiosInstance.put<{ data: StaffMember }>(`/api/staff/${id}`, data);
  return response.data.data;
};

export const deleteStaffApi = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/staff/${id}`);
};

export const getFilterOptionsApi = async (): Promise<FilterOptions> => {
  const response = await axiosInstance.get<{ data: FilterOptions }>('/api/filters');
  return response.data.data;
};

export const getStatsApi = async (): Promise<Record<string, unknown>> => {
  const response = await axiosInstance.get<{ data: Record<string, unknown> }>('/api/stats');
  return response.data.data;
};