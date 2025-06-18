<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import {Code, Copy} from '@lucide/svelte/icons';
    import {Button} from '$lib/components/ui/button/index'
    import Badge from "$lib/components/ui/badge/badge.svelte";


    let {
    fileContent,
    selectedFile,
    updateFileContent, 
    isCodeDialogOpen=$bindable(false)
} = $props()

    let isCopied = $state(false)

const handleCopy = async (content: string) => {
        try {
            await navigator.clipboard.writeText(content);
            isCopied = true
            setTimeout(()=> isCopied = false, 2000)
        } catch (err) {
            console.error('Failed to copy content:', err);
        }

    }

</script>

<Dialog.Root bind:open={isCodeDialogOpen}>
    <Dialog.Content class="w-[80vw] h-[90vh] flex flex-col">
        <Dialog.Header>
            <Dialog.Title class="flex items-center gap-2">
                <Code class="h-4 w-4" />
                {selectedFile?.name || 'File Content'}
            </Dialog.Title>
        </Dialog.Header>
        
        <div class="flex-1 flex flex-col min-h-0">
            <div class="flex justify-between items-center mb-3">
                <Badge variant="secondary">
                    {selectedFile?.path}
                </Badge>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onclick={()=>handleCopy(fileContent)}

                >{#if !isCopied}
                    <Copy class="h-4 w-4 mr-2" />
                    Copy
                {:else}
                <Copy class="h-4 w-4 mr-2 text-green-700" />
                <span class="text-green-700">
                    Copied
                </span>
                {/if}</Button>
            </div>
            
            <div class="flex-1 min-h-0 border rounded-md bg-muted/50 ">
                <textarea  bind:value={fileContent} class="p-4 text-sm overflow-auto h-full w-full whitespace-pre-wrap font-mono resize-none">
                {fileContent}
                </textarea>
            </div>
        </div>
        
        <div class="flex justify-end pt-4">
            <Button variant="outline" onclick={() => updateFileContent(fileContent)}>
                Save
            </Button>
        </div>
    </Dialog.Content>
</Dialog.Root>