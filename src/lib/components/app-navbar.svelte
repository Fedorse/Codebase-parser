<script>
import {page} from '$app/state'
import FileIcon from '@lucide/svelte/icons/file'

let homePage = $derived(page.route.id === '/' )
</script>

<nav class="flex items-center justify-between h-20 w-full px-4">
    <div>
        {#if homePage}
        <a href="/files"><FileIcon class='text-card-foreground/40'/></a>
        {:else}
        <a href="/"> back</a>
        {/if}
    </div>
    <div>
        github
    </div>
</nav>