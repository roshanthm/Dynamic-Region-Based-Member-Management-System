
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  SUPERVISOR = 'SUPERVISOR'
}

export type RegionType = 'State' | 'District' | 'Ward' | 'Village' | 'Panchayat' | 'Department' | 'Custom';

export interface Region {
  region_id: string;
  region_name: string;
  region_type: RegionType;
  parent_region_id: string | null;
}

export interface Member {
  member_id: string;
  full_name: string;
  age: number;
  phone: string;
  address: string;
  house_number: string;
  region_id: string;
  created_at: string;
}

export interface User {
  user_id: string;
  username: string;
  role: UserRole;
  assigned_region_id: string | null;
}

export interface ActivityLog {
  log_id: string;
  user_id: string;
  action_performed: 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  entity: 'MEMBER' | 'REGION' | 'USER' | 'AUTH';
  details: string;
  timestamp: string;
}

export interface JoinMemberRegion extends Member {
  region_name: string;
  region_type: RegionType;
}
