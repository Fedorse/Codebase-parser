import { getSavedFiles } from '@/lib/tauri';

export const load = async () => {
  try {
    const recentFiles = await getSavedFiles();
    return { recentFiles };
  } catch (error) {
    console.error('Failed to load recent files:', error);
  }
};
