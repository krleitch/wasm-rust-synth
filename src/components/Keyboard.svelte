<script lang="ts">
	import { t } from '$i18n';
	import { audioContext, primaryGainNode, synthNode } from '$stores/audio';
	import Key from '$components/Key.svelte';

	export let octaves = 1;
	export let midiMiddleC = 60;
	export let alphabet = 'zsxdcvgbhnjm,';
	export let keysPressed: Array<number> = [];

	let keys: Array<[number, string]>;
	$: keys = [...Array(octaves * 12 + 1).keys()].map((i) => [
		i + (midiMiddleC - Math.floor(octaves / 2) * 12),
		alphabet[i]
	]);

	async function handleNoteOn(event: CustomEvent<number>) {
		if ($synthNode) {
			if ($audioContext && $audioContext.state !== 'running') {
				await $audioContext.resume();
			}
			$synthNode.port.postMessage({
				type: 'note-on',
				note: { id: event.detail, instrumentName: 'sin_synth' }
			});
		}
	}

	async function handleNoteOff(event: CustomEvent<number>) {
		if ($synthNode) {
			$synthNode.port.postMessage({
				type: 'note-off',
				note: { id: event.detail, instrumentName: 'sin_synth' }
			});
		}
	}
</script>

<div class="p-2 w-full bg-rose-900">
	<h2 class="text-lg font-thin">{$t('keyboard.title')}</h2>
</div>
<div class="flex justify-center bg-slate-900">
	<div class="flex px-4 h-56 overflow-auto">
		{#each keys as [note, key]}
			<Key
				noteNum={note}
				{key}
				on:noteon={handleNoteOn}
				on:noteoff={handleNoteOff}
				pressed={keysPressed.includes(note)}
			/>
		{/each}
	</div>
</div>
