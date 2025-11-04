<script lang="ts">
  import { open } from '@tauri-apps/plugin-dialog';
  import { getCurrentWebview } from '@tauri-apps/api/webview';
  import { listen } from '@tauri-apps/api/event';
  import { onDestroy, onMount } from 'svelte';
  import { invalidateAll } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  import { collectSelectedPath, parsePaths, getPreviewTreeUI } from '$lib/tauri';
  import { Button } from '$lib/components/ui/button/index';
  import * as Card from '$lib/components/ui/card';
  import FileDialogTree from '$lib/components/file-dialog-tree.svelte';
  import RecentFiles from '$lib/components/collaps-files.svelte';
  import { Progress } from '$lib/components/ui/progress/index.js';
  import type { FileTree } from '$lib/type';

  type DragEventPayload = {
    type: 'over' | 'drop' | 'leave' | 'enter';
    position: { x: number; y: number };
    paths: string[];
  };

  interface ParseProgress {
    parse_id: string;
    parse_progress: number;
    files_amount: number;
    result_file_path: string | null;
  }

  let { data } = $props();

  let filesTreeNodes = $state<FileTree[]>([]);
  let parseQueue = $state<Map<string, ParseProgress>>(new Map());

  let isDialogOpen = $state(false);
  let isDragging = $state(false);
  let isLoadingPreview = $state(false); // ✅ Renamed and more specific
  let unlistenDrag: () => void;
  let unlistenProgress: () => void;

  // Computed state
  let activeParses = $derived(
    Array.from(parseQueue.values()).filter((p) => p.parse_progress < 100)
  );
  let completedParses = $derived(
    Array.from(parseQueue.values()).filter((p) => p.parse_progress === 100)
  );
  let hasActiveParsing = $derived(activeParses.length > 0);

  const handleDroppedFiles = async (paths: string[]) => {
    if (paths.length === 0) return;
    try {
      isLoadingPreview = true; // ✅ Only for preview
      filesTreeNodes = await getPreviewTreeUI(paths);
      isDialogOpen = true;
    } catch (err) {
      console.error(err);
      toast.error('Failed to load preview tree');
    } finally {
      isLoadingPreview = false; // ✅ Always reset
    }
  };

  const parseSelectedNodes = async () => {
    const paths = collectSelectedPath(filesTreeNodes);
    if (paths.length === 0) {
      toast.error('No files selected');
      return;
    }

    // Close dialog and clear tree immediately
    isDialogOpen = false;
    filesTreeNodes = [];

    try {
      await parsePaths(paths);
      toast.success('Parse started');
    } catch (err) {
      console.error(err);
      toast.error('Parse failed');
    }
    // ✅ No isLoading here - button stays enabled!
  };

  const handleOpenFiles = async () => {
    const selected = await open({ multiple: true, directory: true });

    if (!selected) return;

    isLoadingPreview = true; // ✅ Only for preview
    try {
      filesTreeNodes = await getPreviewTreeUI(selected);
      isDialogOpen = true;
    } catch (err) {
      console.error(err);
      toast.error('Failed to open selected paths');
    } finally {
      isLoadingPreview = false; // ✅ Always reset
    }
  };

  const clearCompleted = () => {
    for (const [id, parse] of parseQueue.entries()) {
      if (parse.parse_progress === 100) {
        parseQueue.delete(id);
      }
    }
    parseQueue = new Map(parseQueue);
  };

  const removeFromQueue = (parseId: string) => {
    parseQueue.delete(parseId);
    parseQueue = new Map(parseQueue);
  };

  const initDragAndDrop = async () => {
    try {
      const webview = await getCurrentWebview();
      unlistenDrag = await webview.onDragDropEvent((event) => {
        const { type, paths } = event.payload as DragEventPayload;
        switch (type) {
          case 'enter':
            isDragging = true;
            break;
          case 'leave':
            isDragging = false;
            break;
          case 'drop':
            isDragging = false;
            handleDroppedFiles(paths);
            break;
          default:
            console.warn(`Unknown drag event type: ${type}`);
        }
      });
    } catch (error) {
      console.error('Failed to initialize drag and drop:', error);
    }
  };

  const initParseProgressListener = async () => {
    try {
      unlistenProgress = await listen<ParseProgress>('parse-progress', (event) => {
        const progress = event.payload;

        // Update or add to queue
        parseQueue.set(progress.parse_id, progress);
        parseQueue = new Map(parseQueue);

        // When parsing completes
        if (progress.parse_progress === 100) {
          invalidateAll();
          toast.success(`Parse completed: ${progress.parse_id}`);

          // Auto-remove after 5 seconds
          setTimeout(() => {
            removeFromQueue(progress.parse_id);
          }, 5000);
        }
      });
    } catch (error) {
      console.error('Failed to initialize parse progress listener:', error);
    }
  };

  onMount(() => {
    initDragAndDrop();
    initParseProgressListener();
  });

  onDestroy(() => {
    if (unlistenDrag) unlistenDrag();
    if (unlistenProgress) unlistenProgress();
  });
</script>

<main class="flex w-full flex-col items-center gap-4 pt-4 md:pt-8 xl:pt-28 2xl:pt-32">
  <!-- Parse Queue Visualization -->
  {#if parseQueue.size > 0}
    <Card.Root class="w-full max-w-5xl bg-blue-50 dark:bg-blue-950/20">
      <Card.Header>
        <div class="flex items-center justify-between">
          <div>
            <Card.Title class="text-lg">Parse Queue ({parseQueue.size})</Card.Title>
            <Card.Description>
              {activeParses.length} active, {completedParses.length} completed
            </Card.Description>
          </div>
          {#if completedParses.length > 0}
            <Button variant="outline" size="sm" onclick={clearCompleted}>Clear Completed</Button>
          {/if}
        </div>
      </Card.Header>
      <Card.Content class="space-y-3">
        {#each Array.from(parseQueue.values()) as parse (parse.parse_id)}
          <div
            class="rounded-lg border bg-white p-4 dark:bg-gray-900"
            class:border-green-500={parse.parse_progress === 100}
            class:border-blue-500={parse.parse_progress < 100}
          >
            <div class="mb-2 flex items-center justify-between">
              <div class="flex items-center gap-2">
                {#if parse.parse_progress === 100}
                  <span class="text-2xl">✅</span>
                {:else}
                  <span class="text-2xl">⏳</span>
                {/if}
                <div>
                  <p class="font-mono text-sm font-medium">{parse.parse_id}</p>
                  <p class="text-muted-foreground text-xs">{parse.files_amount} files</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold">
                  {parse.parse_progress.toFixed(1)}%
                </span>
                {#if parse.parse_progress === 100}
                  <Button variant="ghost" size="sm" onclick={() => removeFromQueue(parse.parse_id)}>
                    ✕
                  </Button>
                {/if}
              </div>
            </div>
            <Progress value={parse.parse_progress} class="h-2" />
            {#if parse.result_file_path}
              <p class="text-muted-foreground mt-2 truncate text-xs">
                {parse.result_file_path}
              </p>
            {/if}
          </div>
        {/each}
      </Card.Content>
    </Card.Root>
  {/if}

  <Card.Root class="bg-card/20 w-full max-w-5xl justify-between pt-6 pb-4">
    <Card.Header class="flex justify-between">
      <div class="flex flex-col gap-2">
        <Card.Title>Quick Start</Card.Title>
        <Card.Description>
          Drag & drop or choose a source. All files are pre-selected by default.
        </Card.Description>
      </div>

      <div class="flex flex-wrap gap-2">
        <Button variant="default" onclick={handleOpenFiles} disabled={isLoadingPreview}>
          {isLoadingPreview ? '…' : 'Upload files'}
        </Button>
      </div>
    </Card.Header>
    <Card.Content class="py-4">
      <div
        class={{
          'w-full rounded-2xl border border-dashed p-8 text-center transition-all sm:p-10': true,
          'border-border border-[1.5px]': !isDragging && !isLoadingPreview,
          'bg-input border-highlight ring-primary/40 ring-2': isDragging,
          'border-highlight animate-pulse select-none': isLoadingPreview
        }}
      >
        <div class="">
          {#if isDragging}
            <div class="flex flex-col items-center gap-2">
              <div class="mb-1 text-7xl leading-none">📂</div>
              <p>Drop files here to parse</p>
            </div>
          {:else if isLoadingPreview}
            <div class="flex h-20 flex-col items-center justify-center gap-2">
              <p>Loading preview...</p>
            </div>
          {:else}
            <div class="flex flex-col items-center gap-2">
              <div class="mb-1 text-7xl leading-none">📁</div>
              {#if hasActiveParsing}
                <p class="text-muted-foreground text-sm">
                  {activeParses.length} parse{activeParses.length > 1 ? 's' : ''} in progress...
                </p>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </Card.Content>
    <div class="border-border border-t px-6 pt-4">
      <RecentFiles limit={3} files={data.recentFiles} />
    </div>
  </Card.Root>

  {#if filesTreeNodes.length > 0}
    <FileDialogTree
      filesTree={filesTreeNodes}
      bind:open={isDialogOpen}
      onParse={parseSelectedNodes}
    />
  {/if}
</main>
