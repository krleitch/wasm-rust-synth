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
	<!-- Nav -->
	<nav class="m-6">
		<h1 class="text-3xl text-rose-500">{$t('home.title')}</h1>
	</nav>

	<!-- Body -->
	<div class="flex flex-col flex-1">
		<!-- Top -->
		<div class="flex-1 m-6 space-y-5">
			<div>
				{$t('home.description')}
			</div>
			<div class="inline-block bg-slate-900 px-4">
				<div id="oscilloscope" />
			</div>
		</div>

		<!-- Bottom -->
		<div>
			<div class="p-2 w-full bg-rose-900">
				<h2 class="text-lg font-thin">{$t('keyboard.title')}</h2>
			</div>
			<div class="flex justify-center bg-slate-900">
				<div class="flex px-4 h-56 overflow-auto">
					{#if audioLoaded}
						<Keyboard />
					{:else}
						<div class="p-6">{$t('home.loading')}</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</main>

<style>
	#oscilloscope {
		width: 400px;
		height: 200px;
	}
</style>
