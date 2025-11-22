<script lang="ts">
  import { parseQueue } from '$lib/state-utils/store-parse-queue.svelte';
  import * as Sheet from '$lib/components/ui/sheet';
  import * as ScrollArea from '$lib/components/ui/scroll-area';
  import { Button } from '$lib/components/ui/button';
  import { Progress } from '$lib/components/ui/progress';
  import { Loader, Terminal, Trash2, FileCheck, Hash } from '@lucide/svelte/icons';

  import type { ParseProgress } from '$lib/state-utils/store-parse-queue.svelte';

  type PropsCardQueue = { item: ParseProgress; isDone: boolean };

  let hasCompleted = $derived(parseQueue.completedParses.length > 0);
</script>

<Sheet.Root bind:open={parseQueue.isSideBarOpen}>
  <Sheet.Content side="right" class=" flex w-[500px] flex-col sm:w-[450px] 2xl:w-[600px]">
    <Sheet.Header class="border-b pt-6 pr-2 pl-8">
      <Sheet.Title class="text-lg">System Activity</Sheet.Title>
      <Sheet.Description>Current parsing queue status.</Sheet.Description>
    </Sheet.Header>

    {#if parseQueue.size === 0}
      <div class="flex flex-1 flex-col items-center justify-center p-6 text-center opacity-50">
        <div class="bg-muted mb-4 rounded-full p-4">
          <Terminal class="size-8 stroke-1" />
        </div>
        <p class="text-sm font-medium">No active pars</p>
        <p class="text-muted-foreground mt-1 text-xs">Processed files log will appear here.</p>
      </div>
    {:else}
      <ScrollArea.Root class="flex-1">
        <div class="flex flex-col px-2">
          {#each Array.from(parseQueue.queue.values()).reverse() as item (item.parse_id)}
            {@const isDone = item.parse_progress === 100}

            {@render CardQueue({ item, isDone })}
          {/each}
        </div>
      </ScrollArea.Root>
    {/if}

    <Sheet.Footer class="border-t p-4">
      {#if hasCompleted}
        <Button
          variant="ghost"
          size="sm"
          class="text-muted-foreground hover:text-destructive h-8 gap-2 text-xs"
          onclick={() => parseQueue.clearCompleted()}
        >
          <Trash2 class="size-3.5" />
          Clear Done
        </Button>
      {/if}
    </Sheet.Footer>
  </Sheet.Content>
</Sheet.Root>

{#snippet CardQueue({ item, isDone }: PropsCardQueue)}
  <div
    class="hover:bg-muted/30 flex flex-col gap-2 border-b px-4 py-4 transition-colors last:border-0"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-3">
        <div
          class={{
            'flex size-8 shrink-0 items-center justify-center rounded border  shadow-sm': true,
            'text-success border-success/20  bg-success/5': isDone,
            'text-warn bg-warn/10 border-warn/40 ': !isDone
          }}
        >
          {#if isDone}
            <FileCheck class="size-4 stroke-1" />
          {:else}
            <Loader class="size-4 animate-spin stroke-1" />
          {/if}
        </div>

        <div class="flex flex-col gap-0.5">
          <div class="flex items-center gap-2">
            <span class="flex items-center gap-0.5 truncate text-sm">
              Task <span><Hash class="size-3 stroke-2" /></span>{item.parse_id.split('_')[1] ||
                'Unknown'}
            </span>
          </div>
          <p class="text-muted-foreground flex gap-1 truncate text-xs">
            {#if isDone}
              <span class="text-success/60 font-medium">Success</span>
            {:else}
              <span class="text-warn font-medium">Processing</span>
            {/if}
            <span class="text-muted-foreground/50">|</span>
            {item.files_amount} files
          </p>
        </div>
      </div>

      {#if isDone}
        <Button
          variant="ghost"
          size="icon"
          class="text-muted-foreground/50 hover:text-destructive size-4 shrink-0 self-center"
          onclick={() => parseQueue.remove(item.parse_id)}
        >
          <Trash2 class="size-4" />
        </Button>
      {/if}
    </div>

    <div class="flex items-center gap-2">
      <Progress value={item.parse_progress} class="bg-secondary h-1.5" />
      <span class="text-muted-foreground text-xs">
        {Math.round(item.parse_progress)}%
      </span>
    </div>
  </div>
{/snippet}
