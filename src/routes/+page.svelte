<script lang="ts">
  import {open} from '@tauri-apps/plugin-dialog';
  import {Button} from '$lib/components/ui/button/index'
  
  import FolderInput from '@lucide/svelte/icons/folder-input'
  import * as Card from "$lib/components/ui/card/index.js";
  import {Separator} from '$lib/components/ui/separator/index'
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import FileTreeItem from "$lib/components/FileTreeItem.svelte";
  import {invoke} from '@tauri-apps/api/core';
  import {getCurrentWebview} from '@tauri-apps/api/webview';

	import { onMount } from 'svelte';



  type DragEventPayload = {
	type: 'over' | 'drop' | 'leave' | 'enter';
	position: { x: number; y: number };
	paths: string[];
};

  type FileTreeNode = {
  name: string;
  path:string;
  type: 'File' | 'Directory',
  selected?: true,
  children?: FileTreeNode[]
}

type FilePreview = {
  name: string
  path: string;
  preview: string;
  size: number;
};




let filePrewiews = $state<FilePreview[]>([])
let filesTreeNodes = $state<FileTreeNode[]>([])

let isDialogOpen = $state(true)
let isDragging = $state(false)



let unlistenDrag : () => void


onMount(async () => {
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

    return () => {
      if (unlistenDrag) {
        unlistenDrag();
      }
    };
  });


const handleDroppedFiles = async (paths: string[]) => {
  try {
    if(paths.length === 0) return 
    const tree = await invoke<FileTreeNode[]>('get_preview_tree', {paths}) 
    selectAllNodes(tree)
    filesTreeNodes = tree
    isDialogOpen = true
  }catch(err) {
    console.error('Failed to prosses dropped files:', err)
  }
}


const laodFiles = async () => {
  try {
    const files = await invoke<FilePreview[]>('get_files')
    filePrewiews = files
  } catch(err) {
    console.error('Failed to load files:', err)
  }
}

const selectAllNodes = (nodes: FileTreeNode[]) => {
  for (const node of nodes) {
    if (node.type === 'File') {
      node.selected = true;
    } else {
      node.selected = true;     
      if (node.children) {
        selectAllNodes(node.children);
      } 
    }
  }
};


const parseSelectedNodes = async () => {
  const paths = collectSelectedPath(filesTreeNodes);

  if(paths.length === 0) return;

  await invoke('parse', { paths });
  isDialogOpen = false;
  filesTreeNodes = [];
  await laodFiles();
};

const collectSelectedPath = (nodes: FileTreeNode[]): string[] => {
  const paths: string[] = [];
  for (const node of nodes) {
    if (node.type === 'File') {
      if (node.selected) paths.push(node.path);
    } else if (node.children) {
      paths.push(...collectSelectedPath(node.children));
    }
  }
  return paths;
}


const handleOpenFiles = async (selectDir: boolean) => {
  const selected = await open({multiple: true, directory: selectDir})
  if (!selected) return
  try {
    const tree = await invoke<FileTreeNode[]>('get_preview_tree', {
      paths: selected
    })
    selectAllNodes(tree)
    filesTreeNodes = tree
    isDialogOpen = true
  } catch(err) {
    console.error('Parse failed:', err)
  }
}

const handleOpenDir = async (file: FilePreview) => {
  try {
    await invoke('open_in_folder', { filePath: file.path });
  } catch (err) {
    console.error('Failed to open file:', err);
  }
};

const handleDelete = async (file: FilePreview) => {
  try {
    await invoke('delete_file', { path: file.path });
    await laodFiles();
  } catch (err) {
    console.error('Failed to delete file:', err);
  }
};



$effect(()=>{
  laodFiles()
})

</script>

<main class=''>
        <div 
          class = {{
            "bg-card h-full p-4 transition-colors duration-200  " : true,
            "bg-blue-50 border-blue-300": isDragging
          }}
        >
          <div 
          class={{
            "border border-muted border-dashed flex flex-col items-center justify-center rounded-sm space-y-20 p-20": true,
            "border-sidebar border-2 bg-slate-100": isDragging,
            "bg-muted": !isDragging
          }}>
            {#if isDragging}
              <div class="text-center">
                <div class="text-4xl mb-2">📂</div>
                <p class="text-lg font-medium text-card">Drop files here to parse</p>
                <p class="text-sm text-card">Release to select files</p>
              </div>
            {:else}
              <div class="text-center">
                <div class="text-4xl mb-2">📁</div>
                <p class="">Drag and drop files here</p>
                <p class="text-sm text-muted-foreground mt-1">or use the button below</p>
              </div>
              
            {/if}
            <div class="">
              <Button variant="outline" onclick={()=> handleOpenFiles(true)}>
                <FolderInput class="mr-2 size-4" />
                Upload Files
              </Button>
            </div>
          </div>
          
    </div>
        <div class='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-10'>
          {#each filePrewiews as file (file.path)}
          <Card.Root class='max-w-sm'>
            <Card.Header>
              <Card.Title>{file.name}</Card.Title>
            </Card.Header>
            <Card.Content>
              <p class="line-clamp-6">{file.preview}</p>
            </Card.Content>
            <Card.Footer>
              <div class="flex justify-between w-full"> 
                <Button variant="outline" onclick={()=> handleOpenDir(file)}>Open in folder</Button>
                <Button  onclick={()=> handleDelete(file)}>Delete</Button>
              </div>
            </Card.Footer>
          </Card.Root>
        {/each}
        </div>
    {#if filesTreeNodes.length > 0}
    <Dialog.Root open={isDialogOpen} onOpenChange={(v) => (isDialogOpen = v)}>
      <Dialog.Content class='w-full flex flex-col  h-[70%]' >
        <Dialog.Header>
          <Dialog.Title>Select to parse files</Dialog.Title>
          <Dialog.Description>
            Choose which files you want to parse. All files are select by default.
          </Dialog.Description>        
        </Dialog.Header>
          <ul class="mt-4 flex-1 pr-2 space-y-1 text-sm w-full overflow-y-auto h-full ">
            {#each filesTreeNodes as node (node.path)}
              <FileTreeItem {node}/>
            {/each}
          </ul>
          <Separator orientation='horizontal' />
          <div class="flex justify-between ">
            <Button onclick={()=> selectAllNodes(filesTreeNodes)}>Select All</Button>
          <Button onclick={parseSelectedNodes}>Parse </Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
    {/if}
</main>

