import { invoke } from '@tauri-apps/api/core';

export type FileTreeNode = {
  name: string;
  path: string;
  type: 'File' | 'Directory';
  selected?: boolean;
  children?: FileTreeNode[];
};
export type SavedFiles = { name: string; path: string; preview: string; size: number };

// TODO fix ts, delete try catch here, move in page client

export const ensureChildrenArrays = (nodes: FileTreeNode[]): FileTreeNode[] => {
  for (const n of nodes) {
    if (!n.children) n.children = [];
    else ensureChildrenArrays(n.children);
  }
  return nodes;
};

export const setSelectedRecursive = (nodes: FileTreeNode[], value = true): FileTreeNode[] => {
  for (const n of nodes) {
    n.selected = value;
    if (n.type === 'Directory' && n.children?.length) setSelectedRecursive(n.children, value);
  }
  return nodes;
};

export const collectSelectedPath = (nodes: FileTreeNode[]): string[] => {
  const paths: string[] = [];
  for (const n of nodes) {
    if (n.type === 'File') {
      if (n.selected) paths.push(n.path);
    } else if (n.children) {
      paths.push(...collectSelectedPath(n.children));
    }
  }
  return paths;
};

export const getPreviewTree = async (paths: string[]) => {
  try {
    const tree = await invoke<FileTreeNode[]>('get_preview_tree', { paths });
    return tree ?? [];
  } catch (err) {
    console.error('Failed to prosses dropped files:', err);
  }
};

export const getSavedFiles = async (): Promise<SavedFiles[]> => {
  try {
    const files = await invoke<SavedFiles[]>('get_files');
    return files ?? [];
  } catch (err) {
    console.error('Failed to load files:', err);
    return [];
  }
};

export const getPreviewTreeUI = async (paths: string[]): Promise<FileTreeNode[]> => {
  try {
    const tree = await getPreviewTree(paths);
    ensureChildrenArrays(tree);
    setSelectedRecursive(tree, true);
    return tree;
  } catch (err) {
    console.error('Failed to prosses opened files:', err);
  }
};

export const parsePaths = async (paths: string[]): Promise<void> => {
  try {
    await invoke('parse', { paths });
  } catch (err) {
    console.error('Parse failed:', err);
  }
};
