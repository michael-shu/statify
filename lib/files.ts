// lib/files.ts
import { dbPromise } from './db';

export async function saveRawFile(key: string, file: File) {
  const db = await dbPromise;
  // File is a Blob, so this works directly
  await db.put('files', file, key);
}

export async function getRawFile(key: string): Promise<Blob | undefined> {
  const db = await dbPromise;
  return db.get('files', key);
}
