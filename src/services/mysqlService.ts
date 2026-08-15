import { School, Coach, Student, Schedule, StudentAttendance, CoachAttendance, ArcheryScoreRecord, SppPayment, SystemNotification, BankAccountConfig } from '../types';

const MYSQL_API_URL_KEY = 'panahan_mysql_api_url_v1';
const STORAGE_ENGINE_KEY = 'panahan_storage_engine_v1'; // 'mysql' | 'firebase' | 'local'

export const MysqlService = {
  // Get current API URL (Default to current origin/api.php if on same server, or window.location.origin + '/api.php')
  getApiUrl: (): string => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlApiParam = urlParams.get('api_url');
        if (urlApiParam && urlApiParam.trim().length > 0) {
          const clean = urlApiParam.trim();
          localStorage.setItem(MYSQL_API_URL_KEY, clean);
          localStorage.setItem(STORAGE_ENGINE_KEY, 'mysql');
          return clean;
        }
      }
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
      const savedUrl = localStorage.getItem(MYSQL_API_URL_KEY);
      if (savedUrl && savedUrl.trim().length > 0 && savedUrl.startsWith('http') && !savedUrl.includes('localhost')) {
        return 'mysql';
      }
    } catch (e) {
      console.error(e);
    }
    return 'firebase'; // Default to Firebase in local dev preview when no custom MySQL URL is set
  },

  setStorageEngine: (engine: 'mysql' | 'firebase' | 'local') => {
    try {
      localStorage.setItem(STORAGE_ENGINE_KEY, engine);
    } catch (e) {
      console.error(e);
    }
  },

  // Helper to safely parse JSON response and handle raw PHP file outputs
  parseJsonResponse: async (res: Response): Promise<{ ok: boolean; data?: any; error?: string }> => {
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}: ${res.statusText}` };
    }
    const text = await res.text();
    const trimmed = text.trim();
    if (trimmed.startsWith('<?php') || trimmed.startsWith('<?')) {
      return {
        ok: false,
        error: 'Server lokal Node/Vite tidak mengeksekusi PHP. Silakan unggah file api.php ke cPanel Shared Hosting Anda dan masukkan URL domain hosting Anda (misal: https://domainku.com/api.php).',
      };
    }
    try {
      const json = JSON.parse(text);
      return { ok: true, data: json };
    } catch (e: any) {
      return {
        ok: false,
        error: `Respons dari server bukan JSON yang valid: ${trimmed.slice(0, 80)}...`,
      };
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

      const result = await MysqlService.parseJsonResponse(response);
      if (!result.ok) {
        return {
          success: false,
          message: result.error || 'Gagal terhubung ke MySQL API.',
        };
      }

      const json = result.data;
      if (json && json.status === 'success') {
        return {
          success: true,
          message: json.message || 'Database MySQL Shared Hosting Terhubung!',
          database: json.database || 'db_panahan',
        };
      } else {
        return {
          success: false,
          message: json?.message || 'Respons API MySQL tidak valid.',
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
      const result = await MysqlService.parseJsonResponse(res);
      if (!result.ok) {
        if (result.error?.includes('tidak mengeksekusi PHP')) {
          console.warn('MySQL API notice:', result.error);
        } else {
          console.error('MySQL API error:', result.error);
        }
        return null;
      }

      const json = result.data;
      if (json && json.status === 'success') {
        return json.data;
      }
      return null;
    } catch (err) {
      console.warn('Could not fetch data from MySQL endpoint:', err);
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

      const result = await MysqlService.parseJsonResponse(res);
      if (!result.ok) return false;
      return result.data?.status === 'success';
    } catch (err) {
      console.warn(`Could not sync collection ${collectionName} to MySQL:`, err);
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

      const result = await MysqlService.parseJsonResponse(res);
      if (!result.ok) return false;
      return result.data?.status === 'success';
    } catch (err) {
      console.warn(`Could not save setting ${key} to MySQL:`, err);
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
