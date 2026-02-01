
import { Region, Member, User, ActivityLog, UserRole, JoinMemberRegion } from '../types';
import { INITIAL_REGIONS, INITIAL_MEMBERS, INITIAL_USERS } from '../constants';

class RelationalDBMS {
  private regions: Region[] = INITIAL_REGIONS;
  private members: Member[] = INITIAL_MEMBERS;
  private users: User[] = INITIAL_USERS;
  private logs: ActivityLog[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const r = localStorage.getItem('sql_regions');
    const m = localStorage.getItem('sql_members');
    const u = localStorage.getItem('sql_users');
    const l = localStorage.getItem('sql_logs');
    if (r) this.regions = JSON.parse(r);
    if (m) this.members = JSON.parse(m);
    if (u) this.users = JSON.parse(u);
    if (l) this.logs = JSON.parse(l);
  }

  private persist() {
    localStorage.setItem('sql_regions', JSON.stringify(this.regions));
    localStorage.setItem('sql_members', JSON.stringify(this.members));
    localStorage.setItem('sql_users', JSON.stringify(this.users));
    localStorage.setItem('sql_logs', JSON.stringify(this.logs));
  }

  private addLog(userId: string, action: ActivityLog['action_performed'], entity: ActivityLog['entity'], details: string) {
    const log: ActivityLog = {
      log_id: `log-${Date.now()}`,
      user_id: userId,
      action_performed: action,
      entity,
      details,
      timestamp: new Date().toISOString()
    };
    this.logs.unshift(log);
    this.persist();
  }

  // Recursive helper to get all child region IDs
  private getAllDescendantIds(regionId: string): string[] {
    const children = this.regions.filter(r => r.parent_region_id === regionId);
    let ids = [regionId];
    for (const child of children) {
      ids = [...ids, ...this.getAllDescendantIds(child.region_id)];
    }
    return ids;
  }

  // --- SQL-LIKE QUERIES ---

  getRegions(): Region[] { return [...this.regions]; }

  // SELECT * FROM members JOIN regions ON members.region_id = regions.region_id
  getMembersJoined(role?: UserRole, assignedRegionId?: string | null): JoinMemberRegion[] {
    const list = this.members.map(m => {
      const r = this.regions.find(reg => reg.region_id === m.region_id);
      return {
        ...m,
        region_name: r?.region_name || 'Unknown',
        region_type: r?.region_type || 'Custom'
      } as JoinMemberRegion;
    });

    // RBAC: Staff sees their region and ALL sub-regions recursively
    if (role === UserRole.STAFF && assignedRegionId) {
      const authorizedRegionIds = this.getAllDescendantIds(assignedRegionId);
      return list.filter(m => authorizedRegionIds.includes(m.region_id));
    }
    
    return list;
  }

  addRegion(data: Omit<Region, 'region_id'>, userId: string) {
    const newReg = { ...data, region_id: `reg-${Date.now()}` };
    this.regions.push(newReg);
    this.addLog(userId, 'INSERT', 'REGION', `Created region ${newReg.region_name}`);
    this.persist();
    return newReg;
  }

  deleteRegion(regionId: string, userId: string): boolean {
    const hasMembers = this.members.some(m => m.region_id === regionId);
    if (hasMembers) return false;
    this.regions = this.regions.filter(r => r.region_id !== regionId);
    this.addLog(userId, 'DELETE', 'REGION', `Deleted region ${regionId}`);
    this.persist();
    return true;
  }

  addMember(data: Omit<Member, 'member_id' | 'created_at'>, userId: string) {
    const newMember = { 
      ...data, 
      member_id: `mem-${Date.now()}`, 
      created_at: new Date().toISOString() 
    };
    this.members.push(newMember);
    this.addLog(userId, 'INSERT', 'MEMBER', `Created member ${newMember.full_name}`);
    this.persist();
    return newMember;
  }

  updateMember(id: string, data: Partial<Member>, userId: string) {
    const index = this.members.findIndex(m => m.member_id === id);
    if (index > -1) {
      this.members[index] = { ...this.members[index], ...data };
      this.addLog(userId, 'UPDATE', 'MEMBER', `Updated member ${id}`);
      this.persist();
    }
  }

  deleteMember(id: string, userId: string) {
    this.members = this.members.filter(m => m.member_id !== id);
    this.addLog(userId, 'DELETE', 'MEMBER', `Deleted member ${id}`);
    this.persist();
  }

  getRegionStats() {
    return this.regions.map(r => ({
      name: r.region_name,
      value: this.members.filter(m => m.region_id === r.region_id).length
    })).sort((a,b) => b.value - a.value);
  }

  getDashboardSummary() {
    return {
      totalMembers: this.members.length,
      totalRegions: this.regions.length,
      totalUsers: this.users.length,
      avgAge: this.members.length > 0 ? this.members.reduce((acc, m) => acc + m.age, 0) / this.members.length : 0
    };
  }

  getLogs() { return this.logs; }
  getUsers() { return this.users; }

  addUser(u: Omit<User, 'user_id'>, userId: string) {
    const newUser = { ...u, user_id: `u-${Date.now()}` };
    this.users.push(newUser);
    this.addLog(userId, 'INSERT', 'USER', `Created user ${newUser.username}`);
    this.persist();
  }
}

export const dbEngine = new RelationalDBMS();
