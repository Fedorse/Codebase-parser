import { getSavedFiles } from '@/lib/tauri';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const files = getSavedFiles(3)
    .then((files) => files.filter((file) => !file.name.startsWith('.DS_Store')))
    .catch((error) => {
      console.error('Failed to load recent files:', error);
      return [];
    });

  return { recentFiles: files };
};
