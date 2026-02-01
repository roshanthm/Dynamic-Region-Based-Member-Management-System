
import { Region, Member, User, UserRole, ActivityLog } from './types';

export const INITIAL_REGIONS: Region[] = [
  { region_id: 'reg-1', region_name: 'California', region_type: 'State', parent_region_id: null },
  { region_id: 'reg-2', region_name: 'Los Angeles', region_type: 'District', parent_region_id: 'reg-1' },
  { region_id: 'reg-3', region_name: 'San Francisco', region_type: 'District', parent_region_id: 'reg-1' },
  { region_id: 'reg-4', region_name: 'Downtown Ward', region_type: 'Ward', parent_region_id: 'reg-2' },
  { region_id: 'reg-5', region_name: 'Mission District', region_type: 'Ward', parent_region_id: 'reg-3' },
  { region_id: 'reg-6', region_name: 'Hope Panchayat', region_type: 'Panchayat', parent_region_id: 'reg-4' },
];

export const INITIAL_MEMBERS: Member[] = [
  { member_id: 'mem-1', full_name: 'John Doe', age: 34, phone: '555-0101', address: 'Sunset Blvd', house_number: 'H-101', region_id: 'reg-6', created_at: '2023-10-01T10:00:00Z' },
  { member_id: 'mem-2', full_name: 'Jane Smith', age: 28, phone: '555-0202', address: 'Golden Gate', house_number: 'A-202', region_id: 'reg-5', created_at: '2023-11-15T14:30:00Z' },
];

export const INITIAL_USERS: User[] = [
  { user_id: 'u-1', username: 'admin', role: UserRole.ADMIN, assigned_region_id: null },
  { user_id: 'u-2', username: 'staff_la', role: UserRole.STAFF, assigned_region_id: 'reg-2' },
  { user_id: 'u-3', username: 'supervisor_sf', role: UserRole.SUPERVISOR, assigned_region_id: 'reg-3' },
];

export const INITIAL_LOGS: ActivityLog[] = [
  { log_id: 'log-1', timestamp: new Date().toISOString(), action_performed: 'LOGIN', entity: 'AUTH', details: 'Admin logged in', user_id: 'u-1' },
  { log_id: 'log-2', timestamp: new Date().toISOString(), action_performed: 'INSERT', entity: 'MEMBER', details: 'Member John Doe created', user_id: 'u-2' },
];
