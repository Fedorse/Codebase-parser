<script lang="ts">
  import { open } from '@tauri-apps/plugin-dialog';
  import { z } from 'zod';
  import { getCurrentWebview } from '@tauri-apps/api/webview';
  import { uniq } from 'es-toolkit';
  import { onDestroy, onMount } from 'svelte';
  import { invalidate } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  import FileDialogTree from '$lib/components/file-dialog-tree.svelte';
  import * as Card from '$lib/components/ui/card';
  import RecentFiles from '$lib/components/collaps-files.svelte';
  import { Button } from '$lib/components/ui/button/index';
  import { Folder, FolderOpen, Github, InfoIcon, Link2Icon } from '@lucide/svelte';
  import CubeLoader from '@/lib/components/cube-loader.svelte';
  import { parseQueue } from '@/lib/state-utils/store-parse-queue.svelte';
  import { getPreviewTreeNodes, parseNodes, parseGitRepo } from '@/lib/tauri';
  import { collectSelectedPathsRecursive } from '@/lib/utils/utils';
  import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
  import * as InputGroup from '$lib/components/ui/input-group/index.js';
  import * as Tooltip from '$lib/components/ui/tooltip/index.js';

  import type { FileTree, DragEventPayload } from '$lib/type';
  import Separator from '@/lib/components/ui/separator/separator.svelte';

  const gitRepoSchema = z
    .string()
    .trim()
    .min(1, 'URL cannot be empty')
    .url({ message: 'Invalid URL format' })
    .startsWith('https://', 'URL must start with https://')
    .refine((url) => {
      try {
        const { pathname } = new URL(url);
        const segments = pathname.split('/').filter(Boolean);
        return segments.length >= 2;
      } catch {
        return false;
      }
    }, 'Incomplete repository path. Example: https://github.com/user/repo')

    .refine(
      (url) => !/\/blob\/|\/tree\/|\/commit\//.test(url),
      'Please provide the root repository URL (remove /tree/, /blob/, etc.)'
    )

    .refine((url) => !/\.(zip|tar|gz|rar|7z)$/i.test(url), 'Cannot clone archive files directly');

  let { data } = $props();

  let filesTreeNodes = $state<FileTree[]>([]);

  let isDialogOpen = $state(false);
  let isDragging = $state(false);
  let isLoadingPreview = $state(false);
  let repoUrl = $state('');
  let isCloning = $state(false);

  let unlistenDrag: () => void;

  const handleDroppedFiles = async (paths: string[]) => {
    if (paths.length === 0) return;
    const uniquePaths = uniq(paths);
    try {
      isLoadingPreview = true;
      filesTreeNodes = await getPreviewTreeNodes(uniquePaths);
      isDialogOpen = true;
    } catch (err) {
      console.error(err);
      toast.error('Failed to open selected file');
    } finally {
      isLoadingPreview = false;
    }
  };

  const parseSelectedNodes = async () => {
    const paths = collectSelectedPathsRecursive(filesTreeNodes);
    if (paths.length === 0) {
      toast.error('No files selected');
      return;
    }

    isDialogOpen = false;
    filesTreeNodes = [];

    try {
      parseQueue.addPendingRequest();
      await parseNodes(paths);
      invalidate('app:recent-files');
    } catch (err) {
      console.error(err);
      toast.error('Parse failed');
    }
  };

  const handleOpenFiles = async () => {
    const selectedPaths = await open({ multiple: true, directory: true });

    if (!selectedPaths) return;

    try {
      isLoadingPreview = true;
      filesTreeNodes = await getPreviewTreeNodes(selectedPaths);
      isDialogOpen = true;
    } catch (err) {
      console.error(err);
      toast.error('Failed to open selected file');
    } finally {
      isLoadingPreview = false;
    }
  };

  const handleCloneRepo = async () => {
    const inputRaw = repoUrl.trim();
    if (!inputRaw) return;

    const result = gitRepoSchema.safeParse(inputRaw);

    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? 'Invalid URL');
      return;
    }
    const validUrl = result.data;

    isCloning = true;
    isLoadingPreview = true;
    try {
      const tempPath = await parseGitRepo(validUrl);

      const res = await getPreviewTreeNodes([tempPath]);
      isDialogOpen = true;
      filesTreeNodes = res;
      repoUrl = '';
    } catch (e) {
      console.error('Clone failed:', e);
      toast.error('Repository not found or invalid URL');
    } finally {
      isLoadingPreview = false;
      isCloning = false;
    }
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

  onMount(() => {
    initDragAndDrop();
  });

  onDestroy(() => {
    if (unlistenDrag) unlistenDrag();
  });
</script>

<main
  class="flex w-full flex-col items-center gap-4 overflow-y-auto pt-6 sm:pt-12 md:pt-16 lg:pt-24 xl:pt-32 2xl:pt-40
"
>
  <Card.Root class="bg-card/20 w-full max-w-5xl justify-between pt-6 pb-4">
    <Card.Header class="flex justify-between">
      <div class="flex flex-col gap-2">
        <Card.Title>
          <p>Quick Start</p>
        </Card.Title>

        <Card.Description>
          <p>Drag & drop or choose a source. All files are pre-selected by default.</p>
        </Card.Description>
      </div>

      <div class="flex flex-wrap gap-2">
        <Button
          variant="default"
          onclick={handleOpenFiles}
          disabled={isLoadingPreview}
          class="cursor-pointer"
        >
          Upload files
        </Button>
      </div>
    </Card.Header>
    <Card.Content class="pt-4 pb-0">
      <div
        class={{
          'h-48 w-full rounded-2xl border  border-dashed text-center transition-all ': true,
          'border-border border-[1.5px]': !isDragging,
          'bg-card/40 border-highlight ring-primary/40 ring-2': isDragging
        }}
      >
        <div
          class="animate-in fade-in zoom-in-95 flex h-full w-full flex-col items-center justify-center gap-8 py-6 duration-300"
        >
          {#if isLoadingPreview}
            {@render loadingTree()}
          {:else}
            <div class="group flex flex-col items-center transition-all">
              <button
                onclick={handleOpenFiles}
                class="bg-muted/30 group-hover:bg-muted rounded-full p-4 transition-all duration-300 group-hover:scale-110"
              >
                {#if isDragging}
                  <FolderOpen class="text-primary size-16 stroke-1" />
                {:else}
                  <Folder
                    class="text-muted-foreground/80 group-hover:text-foreground size-12 transition-colors"
                  />
                {/if}
              </button>
            </div>
          {/if}
        </div>
      </div>
      {@render gitHub()}
    </Card.Content>

    <div class="border-border border-t px-6 pt-4">
      <RecentFiles files={data.recentFiles} />
    </div>
  </Card.Root>

  {#if filesTreeNodes.length > 0}
    <FileDialogTree
      bind:filesTree={filesTreeNodes}
      bind:open={isDialogOpen}
      onParse={parseSelectedNodes}
    />
  {/if}
</main>

{#snippet gitHub()}
  <div class="flex items-center gap-4 py-6">
    <Separator class="flex-1 opacity-50" />
    <span class="text-muted-foreground text-[10px] tracking-widest opacity-70">
      OR Import from Git
    </span>
    <Separator class="flex-1 opacity-50" />
  </div>
  <ButtonGroup.Root class="w-full">
    <InputGroup.Root
      class=" bg-transparent!
                    transition-colors
                    focus-within:border-blue-900
                    focus-within:ring-0!
                    focus-within:ring-offset-0!
                    hover:border-blue-900!"
    >
      <InputGroup.Addon>
        <Tooltip.Root delayDuration={300}>
          <Tooltip.Trigger>
            {#snippet child({ props })}
              <InputGroup.Button {...props} class="rounded-full" size="icon-xs">
                <InfoIcon />
              </InputGroup.Button>
            {/snippet}
          </Tooltip.Trigger>
          <Tooltip.Content>
            Supports GitHub, GitLab, and standard .git repositories.
          </Tooltip.Content>
        </Tooltip.Root>
      </InputGroup.Addon>
      <InputGroup.Input
        id="repo-url"
        bind:value={repoUrl}
        placeholder="https://github.com/user/repo"
        class=" placeholder:text-muted-foreground/50 shadow-none! focus-visible:ring-0! focus-visible:outline-none"
      />
    </InputGroup.Root>

    <Button
      variant="outline"
      aria-label="Clone"
      onclick={handleCloneRepo}
      disabled={!repoUrl || isLoadingPreview}
    >
      Clone
      <Link2Icon class="size-3.5 stroke-1" />
    </Button>
  </ButtonGroup.Root>
  <!-- <Label.Root for="repo-url" class="text-muted-foreground text-xs font-medium">
        Supports GitHub, GitLab, and standard .git repositories.
      </Label.Root> -->
{/snippet}

{#snippet loadingTree()}
  <div
    class="animate-in fade-in zoom-in-95 flex h-full w-full flex-col items-center justify-center py-6 duration-300"
  >
    <CubeLoader class="h-full w-full" size="32px" variant="default" />

    <div class="flex flex-col items-center gap-1 pt-6 text-center">
      <h3 class="text-foreground text-sm font-semibold tracking-tight">
        {isCloning ? 'Cloning Repository...' : 'Scanning Directory Structure...'}
      </h3>
      <p class="text-muted-foreground max-w-[260px] text-xs">
        {isCloning ? 'Fetching data from remote source.' : 'Large directories may take a moment.'}
      </p>
    </div>
  </div>
{/snippet}
