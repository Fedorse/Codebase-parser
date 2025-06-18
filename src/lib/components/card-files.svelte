<script lang=ts>
    import * as Card from "$lib/components/ui/card/index.js";
    import {Button} from '$lib/components/ui/button/index'
    import Input from "./ui/input/input.svelte"; 
    import Badge from "./ui/badge/badge.svelte";
    import {Trash2, Code, FolderOpenDot} from '@lucide/svelte/icons';
    import {formatFileSize} from '$lib/utils'
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
    import {invoke} from '@tauri-apps/api/core';
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";

    const THIRTY_MB_SIZE = 30 * 1024 * 1024;

    type SavedFiles = {
        name: string;
        path: string;
        preview: string;
        size: number;
    };
    
    let {
      file,
      handleDelete,
      openDialogCode
    } = $props()

    let newName = $state<string>('')
    let rename = $state<string | null>(null)
    let isDeleteDialogOpen = $state(false)

    const startRename = () => {
      rename = file.path
      newName = file.name
    }

    const handleEdit = () => {
      if (file.size > THIRTY_MB_SIZE) {
        openDefaultEditor(file.path)
      } else {
        openDialogCode(file)
      }
    }


    const savedNameEvent = (e: KeyboardEvent) => {
      if(e.key === 'Enter') handleRename(file)
      else if(e.key === 'Escape') rename = null;
    }


    const handleRename = async (file: SavedFiles) => {
        if(!newName || newName === file.name) return
        try {
            await invoke('rename_file', { filePath: file.path, newName: newName })
            file.name = newName
            file.path = file.path.replace(/[^\\/]+$/, newName);
            rename = null
            newName = ''
        } catch (err) {
            console.error('Failed to rename file:', err);
        }
    }

    const openDefaultEditor = async (path: string) => {
        try {
            await invoke('open_in_default_editor', { filePath: path });
        } catch (err) {
            console.error('Failed to open file in editor:', err);
        }
    }

     const handleOpenDir = async (file: SavedFiles) => {
        try {
            await invoke('open_in_folder', { filePath: file.path });
        } catch (err) {
            console.error('Failed to open file:', err);
        }
    }


</script>

<Card.Root class='max-w-sm w-full bg-muted/30'>
    <Card.Header>
        <Tooltip.Root>
          <Tooltip.Trigger>
            <Card.Title class='flex items-center gap-4 justify-between' >
                {#if rename === file.path}
                <Input class='flex-1' 
                autofocus  
                bind:value={newName}  
                onkeydown={(e) => {
                    savedNameEvent(e)
                }}
                onblur={()=>{
                    handleRename(file)
                    rename = null
                    }}
                />
                <Button type='button' variant='default' size='sm' onclick={()=>{handleRename(file)}}>Saved</Button>
                {:else}
              <span  class="flex-1 max-w-64 truncate text-left" onclick={startRename}>{file.name} </span>
                {/if}
            </Card.Title>
          </Tooltip.Trigger>
          <Tooltip.Content>
              <p>Rename file</p>
          </Tooltip.Content>
        </Tooltip.Root>
      <Card.Description >
          <Badge variant='outline' class='text-muted-foreground'>
              {formatFileSize(file.size)}
          </Badge>
          </Card.Description>
    </Card.Header>
    <Card.Content class='min-h-80 overflow-hidden'>
      <p class="line-clamp-[13] text-balance">{file.preview}</p>
    </Card.Content>
    <Card.Footer class='flex justify-between w-full border-t border-text-muted-foreground/20  '>
      <div class="flex gap-2">

            <Tooltip.Root>
              <Tooltip.Trigger >
                <Button variant='outline' size='sm' onclick={handleEdit}>
                    <Code class="h-4 w-4 mr-2" />
                    Edit
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>
                <p>{file.size > THIRTY_MB_SIZE ? "Edit in default editor" : "Edit file"}</p>
              </Tooltip.Content>
            </Tooltip.Root>


            <Tooltip.Root>
              <Tooltip.Trigger>
                <Button variant='ghost' size='sm' onclick={()=> handleOpenDir(file)}>
                    <FolderOpenDot class="h-4 w-4 " />
                    Open
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>
                  <p>Open file in your file manager</p>
              </Tooltip.Content>
            </Tooltip.Root>

      </div>
      
      <div class="flex"> 
        <Button variant='destructive' size='sm' onclick={() => isDeleteDialogOpen = !isDeleteDialogOpen}>
          <Trash2 class="h-4 w-4" />
        </Button>
      </div>
    </Card.Footer>
  </Card.Root>

  <AlertDialog.Root bind:open={isDeleteDialogOpen}>
    <AlertDialog.Content>
      <AlertDialog.Header>
        <AlertDialog.Title>Delete file?</AlertDialog.Title>
        <AlertDialog.Description>
          Are you sure you want to delete <strong>{file.name}</strong>? This action cannot be undone.
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer>
        <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
        <Button variant='destructive' onclick={()=> handleDelete(file)}>Delete</Button>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>