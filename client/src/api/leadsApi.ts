import axiosInstance from './axiosInstance';
import {
  ApiResponse,
  Lead,
  CreateLeadDto,
  UpdateLeadDto,
  LeadFilters,
} from '../types';

// Build query string from filters object — skip empty values
const buildQueryString = (filters: Partial<LeadFilters>): string => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  return params.toString();
};

export const getLeadsApi = async (
  filters: Partial<LeadFilters>
): Promise<ApiResponse<Lead[]>> => {
  const queryString = buildQueryString(filters);
  const response = await axiosInstance.get<ApiResponse<Lead[]>>(
    `/leads?${queryString}`
  );
  return response.data;
};

export const getLeadByIdApi = async (
  id: string
): Promise<ApiResponse<Lead>> => {
  const response = await axiosInstance.get<ApiResponse<Lead>>(`/leads/${id}`);
  return response.data;
};

export const createLeadApi = async (
  data: CreateLeadDto
): Promise<ApiResponse<Lead>> => {
  const response = await axiosInstance.post<ApiResponse<Lead>>('/leads', data);
  return response.data;
};

export const updateLeadApi = async (
  id: string,
  data: UpdateLeadDto
): Promise<ApiResponse<Lead>> => {
  const response = await axiosInstance.put<ApiResponse<Lead>>(
    `/leads/${id}`,
    data
  );
  return response.data;
};

export const deleteLeadApi = async (
  id: string
): Promise<ApiResponse<{ message: string }>> => {
  const response = await axiosInstance.delete<ApiResponse<{ message: string }>>(
    `/leads/${id}`
  );
  return response.data;
};

export const exportLeadsApi = async (
  filters: Partial<Omit<LeadFilters, 'page'>>
): Promise<void> => {
  const queryString = buildQueryString(filters as Partial<LeadFilters>);
  const response = await axiosInstance.get(`/leads/export?${queryString}`, {
    responseType: 'blob',
  });
  const url = URL.createObjectURL(new Blob([response.data]));
  const a = document.createElement('a');
  const timestamp = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `leads-export-${timestamp}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
