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

  import type { FileTree } from '$lib/type';
  import ParseQueue from '$lib/components/card-queue.svelte';

  const addMockParseData = () => {
    // Активный парсинг (45%)
    parseQueue.set('2025-11-11_14-30-45', {
      parse_id: '2025-11-11_14-30-45',
      parse_progress: 45.7,
      files_amount: 125,
      result_file_path: null
    });

    parseQueue.set('2025-11-11_14-31-12', {
      parse_id: '2025-11-11_14-31-12',
      parse_progress: 78.3,
      files_amount: 89,
      result_file_path: null
    });

    parseQueue.set('2025-11-11_14-29-03', {
      parse_id: '2025-11-11_14-29-03',
      parse_progress: 100,
      files_amount: 234,
      result_file_path: '/home/user/.tauri-parse-files/parsed_files/2025-11-11_14-29-03/content.txt'
    });

    parseQueue = new Map(parseQueue);
  };

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

  const MIN_STEP_PROGRESS = 0.5;

  let { data } = $props();

  let filesTreeNodes = $state<FileTree[]>([]);
  let parseQueue = $state<Map<string, ParseProgress>>(new Map());

  let isDialogOpen = $state(false);
  let isDragging = $state(false);
  let isLoadingPreview = $state(false);
  let unlistenDrag: () => void;
  let unlistenProgress: () => void;

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
      isLoadingPreview = true;
      filesTreeNodes = await getPreviewTreeUI(paths);
      isDialogOpen = true;
    } catch (err) {
      console.error(err);
      toast.error('Failed to load preview tree');
    } finally {
      isLoadingPreview = false;
    }
  };

  const parseSelectedNodes = async () => {
    const paths = collectSelectedPath(filesTreeNodes);
    if (paths.length === 0) {
      toast.error('No files selected');
      return;
    }

    isDialogOpen = false;
    filesTreeNodes = [];

    try {
      await parsePaths(paths);
      toast.success('Parse successfully completed');
    } catch (err) {
      console.error(err);
      toast.error('Parse failed');
    }
  };

  const handleOpenFiles = async () => {
    const selected = await open({ multiple: true, directory: true });

    if (!selected) return;

    isLoadingPreview = true;
    try {
      filesTreeNodes = await getPreviewTreeUI(selected);
      isDialogOpen = true;
    } catch (err) {
      console.error(err);
      toast.error('Failed to open selected paths');
    } finally {
      isLoadingPreview = false;
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

        const prev = parseQueue.get(progress.parse_id);
        const isComplete = progress.parse_progress === 100;

        if (
          !isComplete &&
          prev &&
          Math.abs(progress.parse_progress - prev.parse_progress) < MIN_STEP_PROGRESS
        ) {
          return;
        }

        parseQueue.set(progress.parse_id, progress);
        parseQueue = new Map(parseQueue);

        if (progress.parse_progress === 100) {
          invalidateAll();

          // Auto-remove after 5 seconds
          // setTimeout(() => {
          //   removeFromQueue(progress.parse_id);
          // }, 5000);
        }
      });
    } catch (error) {
      console.error('Failed to initialize parse progress listener:', error);
    }
  };

  onMount(() => {
    initDragAndDrop();
    initParseProgressListener();
    addMockParseData();
  });

  onDestroy(() => {
    if (unlistenDrag) unlistenDrag();
    if (unlistenProgress) unlistenProgress();
  });
</script>

<main class="flex w-full flex-col items-center gap-4 pt-4 md:pt-8 xl:pt-28 2xl:pt-32">
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

    <ParseQueue {parseQueue} {removeFromQueue} />
    <div class="border-border border-t px-6 pt-4">
      <RecentFiles files={data.recentFiles} />
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
