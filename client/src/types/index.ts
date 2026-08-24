export type StaffRole = 'General Manager' | 'Front Desk' | 'Housekeeping' | 'Chef' | 'Waiter' | 'Security' | 'Maintenance';
export type StaffShift = 'Morning' | 'Evening' | 'Night';
export type StaffStatus = 'Active' | 'On Leave' | 'Inactive';

export interface StaffMember {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  role: StaffRole;
  department: string;
  shift: StaffShift;
  status: StaffStatus;
  joiningDate: string;
}

export interface StaffFilters {
  page: number;
  q?: string;
  role?: StaffRole | '';
  department?: string;
  shift?: StaffShift | '';
  status?: StaffStatus | '';
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StaffListResponse {
  success: boolean;
  data: StaffMember[];
  meta?: Record<string, unknown>;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface StaffFormData {
  fullName: string;
  email: string;
  phone: string;
  role: StaffRole;
  shift: StaffShift;
  status: StaffStatus;
  joiningDate: string;
}

export interface FilterOptions {
  roles: StaffRole[];
  departments: string[];
  shifts: StaffShift[];
  statuses: StaffStatus[];
}
