<script lang="ts">
  import Files from '@lucide/svelte/icons/file-text';
  import Card from '@/lib/components/card-file.svelte';

  let { data } = $props();
</script>

<div class="flex h-full w-full flex-col py-8">
  {#if data.files?.length === 0}
    <div class="flex h-full w-full flex-col items-center justify-center">
      <Files class=" text-muted-foreground mb-4 size-12 stroke-1" />
      <h3 class="mb-2 text-lg font-medium">No files found</h3>
      <p class="text-muted-foreground text-sm">You saved files will appear when you parse them</p>
    </div>
  {:else}
    <div
      class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6"
    >
      {#each data.files as file}
        <Card {file} />
      {/each}
    </div>
  {/if}
</div>
