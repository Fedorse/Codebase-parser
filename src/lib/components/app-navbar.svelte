<script>
import {page} from '$app/state'
let homePage = $derived(page.route.id === '/' )
</script>

<nav class="flex items-center justify-between h-20 w-full px-4">
    <div>
        {#if homePage}
        <a href="/files"> files</a>
        {:else}
        <a href="/"> back</a>
        {/if}
    </div>
    <div>
        github
    </div>
</nav>