<script lang="ts">
	import Keyboard from '$components/Keyboard.svelte';
</script>

<main class="flex flex-col h-full w-full">
	<nav class="m-6">
		<h1 class="text-3xl text-rose-500">Wasm-Rust-Synth</h1>
	</nav>

	<div class="flex flex-col flex-1">
		<div class="flex-1 m-6">A simple demonstration of a synth using audio worklets.</div>
		<Keyboard />
	</div>
</main>
