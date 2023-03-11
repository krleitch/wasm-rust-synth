<script lang="ts">
	import { audioContext, synthNode } from '$stores/audio';
	import Key from '$components/Key.svelte';

	export let octaves = 2;
	export let midiMiddleC = 60;
	export let labels = 'awsedftgyhuj';
	export let keysPressed: Array<number> = [];

	let keys: Array<[number, string]>;
	$: keys = [...Array(octaves * 12 + 1).keys()].map((i) => [
		i + (midiMiddleC - Math.floor(octaves / 2) * 12),
		i < labels.length ? labels[i] : ''
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

			$synthNode.port.postMessage({
				type: 'get-instruments'
			});
			console.log($synthNode.instruments);
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

<div class="flex px-4 h-56 overflow-auto">
	{#each keys as [note, label]}
		<Key
			{note}
			{label}
			on:noteon={handleNoteOn}
			on:noteoff={handleNoteOff}
			pressed={keysPressed.includes(note)}
		/>
	{/each}
</div>
