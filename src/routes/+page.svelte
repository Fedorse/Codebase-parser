<script lang="ts">
import {invoke} from '@tauri-apps/api/core';
import {open} from '@tauri-apps/plugin-dialog';
import {Button} from '$lib/components/ui/button/index'
import * as Resizable from "$lib/components/ui/resizable/index.js";
import FileInput from '@lucide/svelte/icons/file-input'
import FolderInput from '@lucide/svelte/icons/folder-input'
import * as Card from "$lib/components/ui/card/index.js";
import {Separator} from '$lib/components/ui/separator/index'

type FilePreview = {
	name: string;
	path: string;
	preview: string;
	size: number;
};


let savedFiles = $state<FilePreview[]>([])

const fetchFiles = async () => {
  try {
    const files = await invoke<FilePreview[]>('get_files')
    savedFiles = files
    console.log('files', savedFiles)
  } catch(err) {
    console.error('Failed to load files:', err)
  }
}


const parse = async (selectedPaths: string[] )=>{
  try {
    await invoke('parse',{
  paths: selectedPaths,
  ignorePatterns: []
    })
    await fetchFiles()
  } catch(err){
    console.error('Parse failed:', err)
  }
}

const handleOpenFile = async (directory: boolean) => {
  const selected = await open({
    multiple: true,
    directory
  })
  if (!selected) return
  try {
    await parse(selected)
  } catch(err) {
    console.error('Parse failed:', err)
  }
}

$effect(()=>{
  fetchFiles()
})

</script>

<main class='w-full h-full flex items-center  justify-center flex-col'>


    <Resizable.PaneGroup direction="horizontal">
      <Resizable.Pane>
        <div class="bg-card h-full p-4">
          <div class='border border-muted border-dashed h-1/2  bg-black  w-full flex flex-col items-center justify-center  rounded-sm'>
          <p>drag and drop files here</p>
        </div>
    <div class="pt-3 gap-2 flex justify-center items-center">
      <Button variant="outline" onclick={()=> handleOpenFile(false)} >
        <FileInput class="mr-2 size-4"/>
        Upload Files
      </Button>
      <Separator orientation='vertical' />
      <Button variant="outline">
        <FolderInput class="mr-2 size-4" onclick={()=> handleOpenFile(true)} />
        Upload Folder
      </Button>
        </div>
    </div></Resizable.Pane>
      <Resizable.Handle withHandle />
      <Resizable.Pane>
        <Card.Root>
          <Card.Header>
            <Card.Title>fsdaf</Card.Title>
            <Card.Description>Card Description</Card.Description>
          </Card.Header>
          <Card.Content>
            <p>Card Content</p>
          </Card.Content>
          <Card.Footer>
            <p>Card Footer</p>
          </Card.Footer>
        </Card.Root>
      </Resizable.Pane>
    </Resizable.PaneGroup>
</main>

