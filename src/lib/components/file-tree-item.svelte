<script lang="ts">
  import { Checkbox } from '$lib/components/ui/checkbox';
  import { Label } from '$lib/components/ui/label';
  import * as Collapsible from '$lib/components/ui/collapsible';
  import Self from '$lib/components/file-tree-item.svelte';

  import { FileIcon, FolderIcon, ChevronRight } from '@lucide/svelte/icons';
  import { formatFileSize, setSelected } from '$lib/utils';

  let { node, isRoot = false } = $props();
  $effect(() => {
    console.log('node', node);
  });

  let isOpen = $state(isRoot && node.type === 'Directory');

  const onToggle = (checked: boolean) => {
    setSelected(node, checked);
  };

  let checkboxState = $derived.by(() => {
    if (node.type !== 'Directory' || !node.children?.length) {
      return { isChecked: node.selected, isIndeterminate: false };
    }

    const allChildrenChecked = node.children.every((child) => child.selected);
    const noChildrenChecked = node.children.every((child) => !child.selected);

    return {
      isChecked: allChildrenChecked,
      isIndeterminate: !allChildrenChecked && !noChildrenChecked
    };
  });
</script>

{#if node.type === 'File'}
  <li class="flex items-center gap-2 pt-1">
    <Checkbox bind:checked={node.selected} onCheckedChange={onToggle} />
    <div
      class={{
        'flex items-center gap-2': true,
        'text-primary ': node.selected,
        'text-primary/20': !node.selected
      }}
    >
      <FileIcon class="size-5" />
      <span>{node.name}</span>
      <span>{formatFileSize(node.size)}</span>
    </div>
  </li>
{:else}
  <Collapsible.Root class="flex flex-col" bind:open={isOpen}>
    <Collapsible.Trigger>
      <li class="flex flex-row items-center gap-2">
        <ChevronRight
          class={{
            'size-4 transition-transform duration-200': true,
            'rotate-90': isOpen
          }}
        />
        <Checkbox
          checked={checkboxState.isChecked}
          onCheckedChange={onToggle}
          indeterminate={checkboxState.isIndeterminate}
          onclick={(e) => e.stopPropagation()}
        />
        <div
          class={{
            'flex items-center gap-2': true,
            'text-primary ': node.selected,
            'text-primary/20': !node.selected
          }}
        >
          <FolderIcon class="size-6" />
          <Label class="flex-1 cursor-pointer select-none">
            {node.name}
          </Label>
          <span class="ml-2 text-xs opacity-70">
            ({node.filesCount ?? 0} files • {formatFileSize(node.totalSize ?? 0)})
          </span>
        </div>
      </li>
    </Collapsible.Trigger>
    <Collapsible.Content>
      {#if isOpen && node.children?.length}
        <ul class="border-border relative ml-1 space-y-1 border-l pl-8">
          {#each node.children as child (child.path)}
            <Self node={child} />
          {/each}
        </ul>
      {/if}
    </Collapsible.Content>
  </Collapsible.Root>
{/if}
