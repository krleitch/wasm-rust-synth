<script lang="ts">
	import { onMount } from 'svelte';
	import init, { greet } from 'wasm-synth';

	onMount(async () => {
		init().then((raw) => {
			console.log('init wasm-pack', raw.memory);
			greet();
		});
	});
</script>

<h1 class="text-sky-400">Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
