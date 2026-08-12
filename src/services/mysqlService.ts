import { School, Coach, Student, Schedule, StudentAttendance, CoachAttendance, ArcheryScoreRecord, SppPayment, SystemNotification, BankAccountConfig } from '../types';

const MYSQL_API_URL_KEY = 'panahan_mysql_api_url_v1';
const STORAGE_ENGINE_KEY = 'panahan_storage_engine_v1'; // 'mysql' | 'firebase' | 'local'

export const MysqlService = {
  // Get current API URL (Default to current origin/api.php if on same server, or window.location.origin + '/api.php')
  getApiUrl: (): string => {
    try {
      const saved = localStorage.getItem(MYSQL_API_URL_KEY);
      if (saved && saved.trim().length > 0) return saved.trim();
    } catch (e) {
      console.error(e);
    }
    // Default fallback to current origin + /api.php
    return typeof window !== 'undefined' ? `${window.location.origin}/api.php` : '/api.php';
  },

  setApiUrl: (url: string) => {
    try {
      localStorage.setItem(MYSQL_API_URL_KEY, url.trim());
    } catch (e) {
      console.error(e);
    }
  },

  getStorageEngine: (): 'mysql' | 'firebase' | 'local' => {
    try {
      const engine = localStorage.getItem(STORAGE_ENGINE_KEY);
      if (engine === 'firebase' || engine === 'local' || engine === 'mysql') {
        return engine;
      }
    } catch (e) {
      console.error(e);
    }
    return 'mysql'; // Default to MySQL Shared Hosting
  },

  setStorageEngine: (engine: 'mysql' | 'firebase' | 'local') => {
    try {
      localStorage.setItem(STORAGE_ENGINE_KEY, engine);
    } catch (e) {
      console.error(e);
    }
  },

  // Test MySQL Connection
  testConnection: async (targetUrl?: string): Promise<{ success: boolean; message: string; database?: string }> => {
    const url = targetUrl || MysqlService.getApiUrl();
    try {
      const pingUrl = url.includes('?') ? `${url}&action=ping` : `${url}?action=ping`;
      const response = await fetch(pingUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        return {
          success: false,
          message: `HTTP Error ${response.status}: ${response.statusText}`,
        };
      }

      const json = await response.json();
      if (json.status === 'success') {
        return {
          success: true,
          message: json.message || 'Database MySQL Shared Hosting Terhubung!',
          database: json.database || 'db_panahan',
        };
      } else {
        return {
          success: false,
          message: json.message || 'Respons API MySQL tidak valid',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Gagal terhubung ke endpoint API MySQL Shared Hosting. Pastikan URL dan CORS benar.',
      };
    }
  },

  // Get All Data
  getAllData: async (): Promise<any | null> => {
    const url = MysqlService.getApiUrl();
    try {
      const fullUrl = url.includes('?') ? `${url}&action=get_all` : `${url}?action=get_all`;
      const res = await fetch(fullUrl, { headers: { 'Accept': 'application/json' } });
      if (!res.ok) return null;
      const json = await res.json();
      if (json.status === 'success') {
        return json.data;
      }
      return null;
    } catch (err) {
      console.error('Error fetching all data from MySQL:', err);
      return null;
    }
  },

  // Sync single collection to MySQL
  syncCollection: async (collectionName: string, items: any[]): Promise<boolean> => {
    const url = MysqlService.getApiUrl();
    try {
      const syncUrl = url.includes('?') ? `${url}&action=sync_collection` : `${url}?action=sync_collection`;
      const res = await fetch(syncUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          collection: collectionName,
          items: items,
        }),
      });

      if (!res.ok) return false;
      const json = await res.json();
      return json.status === 'success';
    } catch (err) {
      console.error(`Error syncing collection ${collectionName} to MySQL:`, err);
      return false;
    }
  },

  // Save Setting Document (like bankConfig, adminCredentials)
  saveSetting: async (key: string, value: any): Promise<boolean> => {
    const url = MysqlService.getApiUrl();
    try {
      const settingUrl = url.includes('?') ? `${url}&action=save_setting` : `${url}?action=save_setting`;
      const res = await fetch(settingUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ key, value }),
      });

      if (!res.ok) return false;
      const json = await res.json();
      return json.status === 'success';
    } catch (err) {
      console.error(`Error saving setting ${key} to MySQL:`, err);
      return false;
    }
  },

  // Migrate ALL Local/Firestore data to MySQL shared hosting
  migrateAllToMysql: async (allData: {
    schools: School[];
    coaches: Coach[];
    students: Student[];
    schedules: Schedule[];
    studentAttendance: StudentAttendance[];
    coachAttendance: CoachAttendance[];
    scores: ArcheryScoreRecord[];
    payments: SppPayment[];
    notifications: SystemNotification[];
    users: any[];
    bankConfig?: BankAccountConfig;
    adminCredentials?: any;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const collectionsMap: Record<string, any[]> = {
        schools: allData.schools || [],
        coaches: allData.coaches || [],
        students: allData.students || [],
        schedules: allData.schedules || [],
        studentAttendance: allData.studentAttendance || [],
        coachAttendance: allData.coachAttendance || [],
        scores: allData.scores || [],
        payments: allData.payments || [],
        notifications: allData.notifications || [],
        users: allData.users || [],
      };

      for (const [colName, items] of Object.entries(collectionsMap)) {
        await MysqlService.syncCollection(colName, items);
      }

      if (allData.bankConfig) {
        await MysqlService.saveSetting('bankConfig', allData.bankConfig);
      }
      if (allData.adminCredentials) {
        await MysqlService.saveSetting('adminCredentials', allData.adminCredentials);
      }

      return {
        success: true,
        message: 'Semua data aplikasi berhasil dimigrasikan ke MySQL Shared Hosting!',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Gagal migrasi data ke MySQL Shared Hosting.',
      };
    }
  },
};
