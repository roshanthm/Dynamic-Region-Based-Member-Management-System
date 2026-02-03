
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  SUPERVISOR = 'SUPERVISOR'
}

export type RegionLevel = 'STATE' | 'DISTRICT' | 'BLOCK' | 'GRAMA' | 'WARD';

export interface Region {
  region_id: string;
  region_name: string;
  region_level: RegionLevel;
  parent_region_id: string | null;
}

export interface Member {
  member_id: string; // Format: KER-DIST-WARD-SEQ
  full_name: string;
  age: number;
  phone: string;
  address: string;
  house_number: string;
  district: string; 
  block_panchayat: string;
  grama_panchayat: string;
  ward_number: number;
  region_id: string; // Links to the WARD level region
  created_at: string;
}

export interface User {
  user_id: string;
  username: string;
  role: UserRole;
  assigned_district_id: string | null; // For Staff restriction
}

export interface ActivityLog {
  log_id: string;
  user_id: string;
  action_performed: 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'TRANSFER';
  entity: 'MEMBER' | 'REGION' | 'USER' | 'AUTH';
  details: string;
  timestamp: string;
}

export interface JoinMemberRegion extends Member {
  region_name: string;
  region_level: RegionLevel;
}
