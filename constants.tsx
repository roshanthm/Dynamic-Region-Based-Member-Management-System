
import { Region, Member, User, UserRole, ActivityLog } from './types';

export const KERALA_DISTRICTS = [
  'Kasaragod', 'Kannur', 'Wayanad', 'Kozhikode', 'Malappuram', 
  'Palakkad', 'Thrissur', 'Ernakulam', 'Idukki', 'Kottayam', 
  'Alappuzha', 'Pathanamthitta', 'Kollam', 'Thiruvananthapuram'
];

export const DISTRICT_CODES: Record<string, string> = {
  'Kasaragod': 'KSD',
  'Kannur': 'KNR',
  'Wayanad': 'WYD',
  'Kozhikode': 'KKD',
  'Malappuram': 'MLP',
  'Palakkad': 'PKD',
  'Thrissur': 'TCR',
  'Ernakulam': 'EKM',
  'Idukki': 'IDK',
  'Kottayam': 'KTM',
  'Alappuzha': 'ALP',
  'Pathanamthitta': 'PTA',
  'Kollam': 'KLM',
  'Thiruvananthapuram': 'TVM'
};

export const INITIAL_REGIONS: Region[] = [
  { region_id: 'reg-kerala', region_name: 'Kerala', region_level: 'STATE', parent_region_id: null },
  ...KERALA_DISTRICTS.map(d => ({
    region_id: `dist-${d.toLowerCase().replace(/\s/g, '-')}`,
    region_name: d,
    region_level: 'DISTRICT' as const,
    parent_region_id: 'reg-kerala'
  })),
  { region_id: 'block-vaikom', region_name: 'Vaikom Block Panchayat', region_level: 'BLOCK', parent_region_id: 'dist-kottayam' },
  { region_id: 'grama-kumarakom', region_name: 'Kumarakom', region_level: 'GRAMA', parent_region_id: 'block-vaikom' },
  { region_id: 'ward-5-kum', region_name: 'Ward 5', region_level: 'WARD', parent_region_id: 'grama-kumarakom' }
];

export const INITIAL_USERS: User[] = [
  { user_id: 'u-admin', username: 'admin', role: UserRole.ADMIN, assigned_district_id: null },
  { user_id: 'u-staff-ktm', username: 'staff_ktm', role: UserRole.STAFF, assigned_district_id: 'dist-kottayam' },
  { user_id: 'u-sup', username: 'supervisor', role: UserRole.SUPERVISOR, assigned_district_id: null }
];

export const INITIAL_MEMBERS: Member[] = [
  { 
    member_id: 'KER-KTM-W05-001', 
    full_name: 'Ravi Kumar', 
    age: 42, 
    phone: '9847011223', 
    address: 'Vaikom House', 
    house_number: 'VK-10', 
    district: 'Kottayam', 
    block_panchayat: 'Vaikom Block Panchayat', 
    grama_panchayat: 'Kumarakom', 
    ward_number: 5, 
    region_id: 'ward-5-kum', 
    created_at: '2023-10-01T10:00:00Z' 
  }
];
