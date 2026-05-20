import axiosInstance from './axiosInstance';
import { ApiResponse, LoginDto, RegisterDto, User } from '../types';

interface AuthData {
  token: string;
  user: User;
}

export const registerApi = async (
  data: RegisterDto
): Promise<ApiResponse<AuthData>> => {
  const response = await axiosInstance.post<ApiResponse<AuthData>>(
    '/auth/register',
    data
  );
  return response.data;
};

export const loginApi = async (
  data: LoginDto
): Promise<ApiResponse<AuthData>> => {
  const response = await axiosInstance.post<ApiResponse<AuthData>>(
    '/auth/login',
    data
  );
  return response.data;
};

export const getMeApi = async (): Promise<ApiResponse<User>> => {
  const response = await axiosInstance.get<ApiResponse<User>>('/auth/me');
  return response.data;
};
