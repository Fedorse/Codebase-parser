import { getSavedFiles } from '$lib/tauri';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends }) => {
  depends('app:files');

  const parsedFiles = await getSavedFiles();

  return {
    files: parsedFiles
  };
};
