<script lang="ts">
  import '../app.css';
  import { page } from '$app/state';
  import { ModeWatcher } from 'mode-watcher';
  import NavBar from '$lib/components/app-navbar.svelte';
  import FileDialogEdit from '$lib/components/file-dialog-edit.svelte';
  import ParseQueueSideBar from '@/lib/components/parse-queue-side-bar.svelte';
  import * as Tooltip from '$lib/components/ui/tooltip/index.js';
  import { Toaster } from '$lib/components/ui/sonner/index.js';

  let { children } = $props();
  const editFile = $derived(page.state.editFile);

  const handleCloseEditor = () => {
    history.back();
  };
</script>

<Tooltip.Provider delayDuration={1000}>
  <Toaster richColors={true} position="bottom-right" />
  <div class="flex h-screen flex-col">
    <NavBar />
    <main class="flex flex-1 p-4">
      <ModeWatcher />
      {@render children?.()}
      <ParseQueueSideBar />
    </main>
    {#if editFile}
      <FileDialogEdit
        fileId={editFile.id}
        searchPath={editFile.searchPath}
        onClose={() => handleCloseEditor()}
      />
    {/if}
  </div>
</Tooltip.Provider>
