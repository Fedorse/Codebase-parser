<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { parseQueue } from '$lib/state-utils/store-parse-queue.svelte';
  import { Loader, FileCheck, ArrowLeft, MonitorCog } from '@lucide/svelte/icons';
  import ToggleThemeButton from '$lib/components/theme-switch-button.svelte';
  import Button from './ui/button/button.svelte';

  const isHome = $derived(page.url.pathname === '/');

  const getParentPath = (currentPath: string): string | null => {
    if (currentPath === '/') return null;
    if (currentPath.includes('/files/') && currentPath.endsWith('/edit')) return '/files';
    if (currentPath.startsWith('/graph/')) return '/files';
    if (currentPath === '/files') return '/';
    return '/';
  };

  const parentPath = $derived(getParentPath(page.url.pathname));

  const goBack = () => {
    if (parentPath) goto(parentPath);
  };

  const toggleSidebar = () => {
    parseQueue.setOpen(!parseQueue.isSideBarOpen);
  };
</script>

<nav class="flex h-20 w-full items-center justify-between px-6 py-10">
  <div>
    {#if !isHome}
      <button
        type="button"
        class="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition"
        onclick={goBack}
      >
        <ArrowLeft class="size-5" />
        <span class="text-sm">Back</span>
      </button>
    {/if}
  </div>

  <div class="flex items-center gap-3">
    {#if parseQueue.size > 0}
      {@render queueStatusBar()}
    {:else}
      <Button onclick={toggleSidebar} variant="nav" class="cursor-pointer p-5" size="icon">
        <MonitorCog class="size-4 " />
      </Button>
    {/if}

    <ToggleThemeButton />
  </div>
</nav>

{#snippet queueStatusBar()}
  <button
    onclick={toggleSidebar}
    class={{
      'group hover:bg-accent/50 bg-card/20 flex h-10 cursor-pointer items-center gap-3 rounded-md border pr-4 shadow-sm transition-all active:scale-95': true,
      'bg-success/10': !parseQueue.hasActiveParsing
    }}
  >
    <div
      class={{
        'flex h-full items-center justify-center rounded border-r-1 px-3  ': true
      }}
    >
      {#if parseQueue.hasActiveParsing}
        <Loader class="size-4 animate-spin stroke-1" />
      {:else}
        <FileCheck class="text-success/70 size-4 stroke-1" />
      {/if}
    </div>

    <div class="flex flex-col items-start justify-center gap-0 leading-none">
      <div class="flex items-center gap-2">
        <span class="text-foreground text-xs">
          {parseQueue.hasActiveParsing ? 'Processing files' : 'Queue Ready'}
        </span>

        {#if parseQueue.hasActiveParsing}
          <div class="relative flex size-1.5">
            <span
              class="bg-warn/50 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
            ></span>
            <span class="bg-warn relative inline-flex size-1.5 rounded-full"></span>
          </div>
        {/if}
      </div>

      <div class="text-muted-foreground flex items-center gap-1.5 text-[10px]">
        <span>
          {parseQueue.completedParses.length}
          <span class="opacity-50">/</span>
          {parseQueue.size}
          {parseQueue.size === 1 ? 'file' : 'files'}
        </span>
      </div>
    </div>
  </button>
{/snippet}
