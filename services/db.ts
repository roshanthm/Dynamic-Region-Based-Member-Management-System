
import { Region, Member, User, ActivityLog, UserRole, JoinMemberRegion } from '../types';
import { INITIAL_REGIONS, INITIAL_MEMBERS, INITIAL_USERS, DISTRICT_CODES, KERALA_DISTRICTS } from '../constants';

class RelationalDBMS {
  private regions: Region[] = INITIAL_REGIONS;
  private members: Member[] = INITIAL_MEMBERS;
  private users: User[] = INITIAL_USERS;
  private logs: ActivityLog[] = [];
  private syncKey: string | null = localStorage.getItem('db_sync_key');

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const r = localStorage.getItem('db_regions');
    const m = localStorage.getItem('db_members');
    const u = localStorage.getItem('db_users');
    const l = localStorage.getItem('db_logs');
    if (r) this.regions = JSON.parse(r);
    if (m) this.members = JSON.parse(m);
    if (u) this.users = JSON.parse(u);
    if (l) this.logs = JSON.parse(l);
  }

  private async persist() {
    localStorage.setItem('db_regions', JSON.stringify(this.regions));
    localStorage.setItem('db_members', JSON.stringify(this.members));
    localStorage.setItem('db_users', JSON.stringify(this.users));
    localStorage.setItem('db_logs', JSON.stringify(this.logs));
    
    if (this.syncKey) {
      await this.pushToCloud();
    }
  }

  setSyncKey(key: string | null) {
    this.syncKey = key?.trim() || null;
    if (this.syncKey) localStorage.setItem('db_sync_key', this.syncKey);
    else localStorage.removeItem('db_sync_key');
  }

  getSyncKey() { return this.syncKey; }

  async pushToCloud() {
    if (!this.syncKey) return;
    try {
      const payload = {
        regions: this.regions,
        members: this.members,
        users: this.users,
        logs: this.logs,
        lastSync: new Date().toISOString()
      };
      // kvdb.io is a public anonymous KV store. Perfect for this free no-api-key-required sync.
      await fetch(`https://kvdb.io/A6Qz3z8q5S2v2W9W8J9n2v/${this.syncKey}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn("Cloud Sync Push Failed (Offline Mode):", e);
    }
  }

  async pullFromCloud(): Promise<boolean> {
    if (!this.syncKey) return false;
    try {
      const res = await fetch(`https://kvdb.io/A6Qz3z8q5S2v2W9W8J9n2v/${this.syncKey}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.members) {
          this.regions = data.regions || this.regions;
          this.members = data.members || this.members;
          this.users = data.users || this.users;
          this.logs = data.logs || this.logs;
          // Silently update local storage to match cloud
          localStorage.setItem('db_regions', JSON.stringify(this.regions));
          localStorage.setItem('db_members', JSON.stringify(this.members));
          localStorage.setItem('db_users', JSON.stringify(this.users));
          localStorage.setItem('db_logs', JSON.stringify(this.logs));
          return true;
        }
      }
    } catch (e) {
      console.warn("Cloud Sync Pull Failed:", e);
    }
    return false;
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
  }

  private generateMemberId(district: string, ward: number): string {
    const code = DISTRICT_CODES[district] || district.substring(0, 3).toUpperCase();
    const wardStr = ward.toString().padStart(2, '0');
    const count = this.members.filter(m => m.district === district && m.ward_number === ward).length + 1;
    const seq = count.toString().padStart(4, '0');
    return `KER-${code}-W${wardStr}-${seq}`;
  }

  private async ensureRegionHierarchy(data: { district: string, block_panchayat: string, grama_panchayat: string, ward_number: number }): Promise<string> {
    const dName = data.district.trim();
    const bName = data.block_panchayat.trim();
    const gName = data.grama_panchayat.trim();

    let distRegion = this.regions.find(r => r.region_name === dName && r.region_level === 'DISTRICT');
    if (!distRegion) {
       distRegion = { region_id: `dist-${dName.toLowerCase().replace(/\s/g, '-')}`, region_name: dName, region_level: 'DISTRICT', parent_region_id: 'reg-kerala' };
       this.regions.push(distRegion);
    }

    let block = this.regions.find(r => r.region_name.toLowerCase() === bName.toLowerCase() && r.parent_region_id === distRegion!.region_id);
    if (!block) {
      block = { region_id: `block-${Date.now()}`, region_name: bName, region_level: 'BLOCK', parent_region_id: distRegion!.region_id };
      this.regions.push(block);
    }

    let grama = this.regions.find(r => r.region_name.toLowerCase() === gName.toLowerCase() && r.parent_region_id === block!.region_id);
    if (!grama) {
      grama = { region_id: `grama-${Date.now()}`, region_name: gName, region_level: 'GRAMA', parent_region_id: block!.region_id };
      this.regions.push(grama);
    }

    let ward = this.regions.find(r => r.region_name === `Ward ${data.ward_number}` && r.parent_region_id === grama!.region_id);
    if (!ward) {
      ward = { region_id: `ward-${Date.now()}`, region_name: `Ward ${data.ward_number}`, region_level: 'WARD', parent_region_id: grama!.region_id };
      this.regions.push(ward);
    }

    return ward.region_id;
  }

  getRegions(): Region[] { return [...this.regions]; }

  getMembersJoined(role?: UserRole, assignedDistrictId?: string | null): JoinMemberRegion[] {
    return this.members.map(m => {
      const r = this.regions.find(reg => reg.region_id === m.region_id);
      return { ...m, region_name: r?.region_name || 'N/A', region_level: r?.region_level || 'WARD' } as JoinMemberRegion;
    });
  }

  async registerMember(data: Omit<Member, 'member_id' | 'created_at' | 'region_id'>, userId: string): Promise<Member> {
    const wardRegionId = await this.ensureRegionHierarchy(data);
    const member: Member = {
      ...data,
      member_id: this.generateMemberId(data.district, data.ward_number),
      region_id: wardRegionId,
      created_at: new Date().toISOString()
    };
    this.members.push(member);
    this.addLog(userId, 'INSERT', 'MEMBER', `Registered: ${member.full_name}`);
    await this.persist();
    return member;
  }

  async updateMember(id: string, data: Partial<Member>, userId: string): Promise<void> {
    const idx = this.members.findIndex(m => m.member_id === id);
    if (idx !== -1) {
      const current = this.members[idx];
      const updatedData: Member = { ...current, ...data };
      if (data.district || data.block_panchayat || data.grama_panchayat || data.ward_number) {
        updatedData.region_id = await this.ensureRegionHierarchy({
          district: updatedData.district,
          block_panchayat: updatedData.block_panchayat,
          grama_panchayat: updatedData.grama_panchayat,
          ward_number: updatedData.ward_number
        });
      }
      this.members[idx] = updatedData;
      this.addLog(userId, 'UPDATE', 'MEMBER', `Modified: ${id}`);
      await this.persist();
    }
  }

  async deleteMember(id: string, userId: string) {
    this.members = this.members.filter(m => m.member_id !== id);
    this.addLog(userId, 'DELETE', 'MEMBER', `Deleted: ${id}`);
    await this.persist();
  }

  getDashboardStats(districtName?: string) {
    const targetMembers = districtName ? this.members.filter(m => m.district === districtName) : this.members;
    return {
      totalMembers: targetMembers.length,
      totalRegions: this.regions.length,
      avgAge: targetMembers.length ? targetMembers.reduce((a, b) => a + b.age, 0) / targetMembers.length : 0,
      panchayatCount: new Set(targetMembers.map(m => m.grama_panchayat)).size
    };
  }

  getRegionStats() {
    return KERALA_DISTRICTS.map(d => ({
      name: d,
      value: this.members.filter(m => m.district === d).length
    })).sort((a,b) => b.value - a.value);
  }

  getLogs() { return [...this.logs]; }
  getUsers() { return [...this.users]; }

  exportData() {
    return JSON.stringify({
      regions: this.regions,
      members: this.members,
      users: this.users,
      logs: this.logs
    }, null, 2);
  }

  async importData(json: string) {
    try {
      const data = JSON.parse(json);
      this.regions = data.regions;
      this.members = data.members;
      this.users = data.users;
      this.logs = data.logs;
      await this.persist();
      return true;
    } catch (e) {
      return false;
    }
  }
}

export const dbEngine = new RelationalDBMS();
