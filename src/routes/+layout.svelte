<script lang="ts">
	import "../app.css";
	import NavBar from "$lib/components/app-navbar.svelte";
	let { children } = $props();
  </script>
  
  <div class="flex flex-col h-screen">
	<NavBar />
	<main class="flex-1 flex justify-center items-center p-4">
	  {@render children?.()}
	</main>
  </div>
  