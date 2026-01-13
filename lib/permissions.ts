import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface PublicPermissions {
  find: boolean;
  findOne: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

const DEFAULT_PERMISSIONS: PublicPermissions = {
  find: false,
  findOne: false,
  create: false,
  update: false,
  delete: false,
};

export async function getPublicPermissions(collectionSlug: string): Promise<PublicPermissions> {
  try {
    const permissionsRef = doc(db, '_permissions', collectionSlug);
    const permissionsSnap = await getDoc(permissionsRef);

    if (permissionsSnap.exists()) {
      return { ...DEFAULT_PERMISSIONS, ...permissionsSnap.data() };
    }

    return DEFAULT_PERMISSIONS;
  } catch (error) {
    console.error(`Error fetching permissions for ${collectionSlug}:`, error);
    return DEFAULT_PERMISSIONS;
  }
}

export async function updatePublicPermissions(collectionSlug: string, permissions: PublicPermissions): Promise<void> {
  try {
    const permissionsRef = doc(db, '_permissions', collectionSlug);
    await setDoc(permissionsRef, permissions, { merge: true });
  } catch (error) {
    console.error(`Error updating permissions for ${collectionSlug}:`, error);
    throw error;
  }
}

export async function checkPublicPermission(collectionSlug: string, action: keyof PublicPermissions): Promise<boolean> {
  const permissions = await getPublicPermissions(collectionSlug);
  return permissions[action];
}
