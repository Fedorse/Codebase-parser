import { getSavedFiles } from '@/lib/tauri';

export const load = async () => {
  try {
    const files = await getSavedFiles();
    return { recentFiles: files };
  } catch (error) {
    console.error('Failed to load recent files:', error);
    return { recentFiles: [] };
  }
};
