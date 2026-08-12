import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  School, Coach, Student, Schedule, StudentAttendance,
  CoachAttendance, ArcheryScoreRecord, SppPayment, SystemNotification,
  BankAccountConfig
} from '../types';
import {
  INITIAL_SCHOOLS, INITIAL_COACHES, INITIAL_STUDENTS, INITIAL_SCHEDULES,
  INITIAL_STUDENT_ATTENDANCE, INITIAL_COACH_ATTENDANCE, INITIAL_SCORES,
  INITIAL_PAYMENTS, INITIAL_NOTIFICATIONS
} from '../data/initialData';
import { INITIAL_BANK_CONFIG } from './storageService';

export const FirebaseService = {
  // Real-time subscriber for collections
  subscribeCollection: <T extends { id: string }>(
    collectionName: string,
    initialData: T[],
    onUpdate: (items: T[]) => void
  ) => {
    const colRef = collection(db, collectionName);
    const seedKey = `firestore_seeded_${collectionName}`;

    return onSnapshot(
      colRef,
      async (snapshot) => {
        if (snapshot.empty) {
          const isAlreadySeeded = localStorage.getItem(seedKey) === 'true';
          if (!isAlreadySeeded) {
            console.log(`Firestore collection '${collectionName}' is empty and unseeded. Seeding initial data...`);
            try {
              const batch = writeBatch(db);
              initialData.forEach((item) => {
                const docRef = doc(db, collectionName, item.id);
                batch.set(docRef, item);
              });
              await batch.commit();
              localStorage.setItem(seedKey, 'true');
            } catch (err) {
              console.error(`Error seeding initial data for ${collectionName}:`, err);
            }
          } else {
            // Collection was intentionally emptied by user
            onUpdate([]);
          }
        } else {
          localStorage.setItem(seedKey, 'true');
          const items: T[] = [];
          snapshot.forEach((docSnap) => {
            items.push(docSnap.data() as T);
          });
          onUpdate(items);
        }
      },
      (error) => {
        console.warn(`Firestore collection ${collectionName} connection note (${error.code || 'offline'}): using local storage cache fallback.`);
        try {
          const cached = localStorage.getItem(`panahan_${collectionName}_v1`);
          if (cached) {
            onUpdate(JSON.parse(cached));
          } else {
            onUpdate(initialData);
          }
        } catch (e) {
          onUpdate(initialData);
        }
      }
    );
  },

  // Single doc subscriber (for settings/bankConfig)
  subscribeDoc: <T>(
    collectionName: string,
    docId: string,
    initialData: T,
    onUpdate: (data: T) => void
  ) => {
    const docRef = doc(db, collectionName, docId);

    return onSnapshot(
      docRef,
      async (docSnap) => {
        if (!docSnap.exists()) {
          console.log(`Firestore doc '${collectionName}/${docId}' is empty. Seeding...`);
          try {
            await setDoc(docRef, initialData as any);
          } catch (err) {
            console.error(`Error seeding doc ${docId}:`, err);
          }
        } else {
          onUpdate(docSnap.data() as T);
        }
      },
      (error) => {
        console.warn(`Firestore doc ${collectionName}/${docId} connection note (${error.code || 'offline'}): using initial data fallback.`);
        onUpdate(initialData);
      }
    );
  },

  // Generic batch sync to write array to Firestore (and remove deleted items from Firestore)
  syncCollection: async <T extends { id: string }>(collectionName: string, items: T[]) => {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      const newItemIds = new Set(items.map((item) => item.id));
      const batch = writeBatch(db);

      // Delete documents no longer present in items array
      snapshot.forEach((docSnap) => {
        if (!newItemIds.has(docSnap.id)) {
          batch.delete(docSnap.ref);
        }
      });

      // Write/Merge current items
      items.forEach((item) => {
        const docRef = doc(db, collectionName, item.id);
        batch.set(docRef, item, { merge: true });
      });

      await batch.commit();
      localStorage.setItem(`firestore_seeded_${collectionName}`, 'true');
    } catch (err) {
      console.error(`Error syncing ${collectionName} to Firestore:`, err);
    }
  },

  // Save single item
  saveItem: async <T extends { id: string }>(collectionName: string, item: T) => {
    try {
      const docRef = doc(db, collectionName, item.id);
      await setDoc(docRef, item, { merge: true });
    } catch (err) {
      console.error(`Error saving item to ${collectionName}:`, err);
    }
  },

  // Delete single item
  deleteItem: async (collectionName: string, id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
      localStorage.setItem(`firestore_seeded_${collectionName}`, 'true');
    } catch (err) {
      console.error(`Error deleting item ${id} from ${collectionName}:`, err);
    }
  },

  // Save bank config
  saveBankConfig: async (config: BankAccountConfig) => {
    try {
      const docRef = doc(db, 'settings', 'bankConfig');
      await setDoc(docRef, config, { merge: true });
    } catch (err) {
      console.error('Error saving bank config:', err);
    }
  },

  // Save admin credentials
  saveAdminCredentials: async (creds: { username: string; password: string }) => {
    try {
      const docRef = doc(db, 'settings', 'adminCredentials');
      await setDoc(docRef, creds, { merge: true });
    } catch (err) {
      console.error('Error saving admin credentials:', err);
    }
  }
};
