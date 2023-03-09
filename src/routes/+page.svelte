<script lang="ts">
	import { onMount } from 'svelte';
	import { setupAudio } from '$stores/audio';
	import { t } from '$i18n';

	import Keyboard from '$components/Keyboard.svelte';

	let audioLoaded = false;

	onMount(async () => {
		await setupAudio();
		audioLoaded = true;
	});
</script>

<main class="flex flex-col h-full w-full">
	<nav class="m-6">
		<h1 class="text-3xl text-rose-500">{$t('home.title')}</h1>
	</nav>

	<div class="flex flex-col flex-1">
		<div class="flex-1 m-6">{$t('home.description')}</div>
		{#if audioLoaded}
			<Keyboard />
		{:else}
			<div>{$t('home.loading')}</div>
		{/if}
	</div>
</main>
