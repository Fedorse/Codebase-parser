<script lang="ts">
  import { SvelteFlowProvider } from '@xyflow/svelte';
  import Diagram from '@/lib/components/diagram.svelte';

  let { data } = $props();

</script>

<SvelteFlowProvider>
  <Diagram tree={data.tree} fileId={data.metadata.id} />
</SvelteFlowProvider>
