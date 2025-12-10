<script lang="ts">
  import { FileIcon, FolderIcon, FolderOpen, ChevronRight, Loader } from '@lucide/svelte/icons';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import { expandNode } from '@/lib/tauri';
  import type { FileTree } from '@/lib/type';
  import { slide } from 'svelte/transition';
  import { formatFileSize } from '../utils/utils';

  const EXPAND_SIZE_LOADING = 150 * 1024 * 1024;

  let { nodes = $bindable() }: { nodes: FileTree[] } = $props();

  let loadingPaths = $state(new Set<string>());

  const calculateSelectedSize = (node: FileTree): number => {
    if (node.type === 'File') {
      return node.selected ? (node.size ?? 0) : 0;
    }
    if (!node.children || node.children.length === 0) {
      return node.selected ? (node.size ?? 0) : 0;
    }
    return node.children.reduce((acc, child) => acc + calculateSelectedSize(child), 0);
  };

  const handleSelect = (node: FileTree, checked: boolean) => {
    node.selected = checked;

    if (node.children) {
      updateChildrenDeep(node.children, checked);
    }
  };

  const updateChildrenDeep = (list: FileTree[], val: boolean) => {
    list.forEach((item) => {
      item.selected = val;
      if (item.children) updateChildrenDeep(item.children, val);
    });
  };

  const handleExpand = async (e: MouseEvent, node: FileTree) => {
    e.stopPropagation();
    if (node.type !== 'Directory') return;

    if (loadingPaths.has(node.path)) return;

    if (node.isExpanded) {
      node.isExpanded = false;
      return;
    }

    if (node.children && node.children.length > 0) {
      node.isExpanded = true;
      return;
    }
    if (node.size && node.size > EXPAND_SIZE_LOADING) {
      const nextLoading = new Set(loadingPaths);
      nextLoading.add(node.path);
      loadingPaths = nextLoading;
    }
    try {
      const loadedChildren = await expandNode(node.path);
      node.children = loadedChildren;
      node.isExpanded = true;
    } catch (err) {
      console.error(err);
    } finally {
      const finishedLoading = new Set(loadingPaths);
      finishedLoading.delete(node.path);
      loadingPaths = finishedLoading;
    }
  };
</script>

<ul class="w-full space-y-0.5">
  {#each nodes as node (node.path)}
    {@render treeNode(node)}
  {/each}
</ul>

{#snippet treeNode(node: FileTree)}
  {@const isLoading = loadingPaths.has(node.path)}
  {@const selectedSize = calculateSelectedSize(node)}

  <li class="flex flex-col text-sm select-none">
    <div
      class="hover:bg-muted/50 group flex items-center gap-2 rounded-sm px-1 py-1 transition-colors"
    >
      <div class="flex size-5 items-center justify-center">
        {#if node.type === 'Directory'}
          {#if isLoading}
            <Loader class="text-muted-foreground size-4 animate-spin" />
          {:else}
            <button
              onclick={(e) => handleExpand(e, node)}
              class="hover:bg-muted-foreground/20 cursor-pointer rounded p-0.5"
            >
              <ChevronRight
                class="size-4 transition-transform duration-200 {node.isExpanded
                  ? 'rotate-90'
                  : ''}"
              />
            </button>
          {/if}
        {:else}
          <span class="w-4"></span>
        {/if}
      </div>

      <Checkbox checked={node.selected} onCheckedChange={(v) => handleSelect(node, v)} />

      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="flex flex-1 cursor-pointer items-center gap-2 overflow-hidden"
        onclick={(e) =>
          node.type === 'Directory' ? handleExpand(e, node) : handleSelect(node, !node.selected)}
      >
        {#if node.type === 'Directory'}
          {#if node.isExpanded}
            <FolderOpen
              class="size-4 {node.selected ? 'text-primary/80' : 'text-muted-foreground/50'}"
            />
          {:else}
            <FolderIcon
              class="size-4 transition-colors {node.selected
                ? 'text-foreground'
                : 'text-muted-foreground/50'}"
            />
          {/if}
        {:else}
          <FileIcon
            class=" size-4 {node.selected ? 'text-foreground' : 'text-muted-foreground/50'}"
          />
        {/if}
        <div class="flex w-full items-center justify-between">
          <span
            class="truncate {node.selected
              ? 'text-foreground font-medium'
              : 'text-muted-foreground/50'}"
          >
            {node.name}
          </span>

          {#if selectedSize}
            <span class="text-muted-foreground ml-2 pr-4 text-xs opacity-70">
              {formatFileSize(selectedSize)}
            </span>
          {/if}
        </div>
      </div>
    </div>

    {#if node.isExpanded && node.children}
      <ul transition:slide|local={{ duration: 150 }} class="border-border/40 ml-2 border-l pl-4">
        {#each node.children as child (child.path)}
          {@render treeNode(child)}
        {/each}
      </ul>
    {/if}
  </li>
{/snippet}
