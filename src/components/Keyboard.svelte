<script lang="ts">
	import { onMount } from 'svelte';
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

	let audioContext: AudioContext;
	let primaryGainControl: GainNode;
	let wasmBytes: ArrayBuffer;
	// we cant load synth node on the server
	let synthNode: AudioWorkletNode & { init: (w: ArrayBuffer) => void };
	let uncompatible_browser = false; // If the browser doesnt support audio worklets

	async function setup_audio() {
		audioContext = new AudioContext();

		// Fetch the WebAssembly module that performs pitch detection.
		const response = await window.fetch('src/wasm/wasm_synth_bg.wasm');
		wasmBytes = await response.arrayBuffer();

		// Will not work in firefox, worklets don't support es6 modules
		// https://bugzilla.mozilla.org/show_bug.cgi?id=1636121
		const processorUrl = 'src/audio/synth_processor.ts';
		try {
			await audioContext.audioWorklet.addModule(processorUrl);
		} catch (e: any) {
			uncompatible_browser = true;
			throw new Error(
				`Failed to load audio analyzer worklet at url: ${processorUrl}. Further info: ${e.message}`
			);
		}

		primaryGainControl = audioContext.createGain();
		primaryGainControl.gain.setValueAtTime(0.05, 0);

		primaryGainControl.connect(audioContext.destination);

		const SynthNode = (await import('$audio/synth_node')).default;
		synthNode = new SynthNode(audioContext, 'SynthProcessor', { outputChannelCount: [1] });
		synthNode.init(wasmBytes);
		synthNode.connect(primaryGainControl);

		if (audioContext.state !== 'running' && audioContext) {
			await audioContext.resume();
		}
	}

	onMount(async () => {
		await setup_audio();
	});

	async function handleNoteOn(event: CustomEvent<number>) {
		synthNode.port.postMessage({
			type: 'note-on',
			note: { id: event.detail, on: audioContext.currentTime, off: 0.0, active: true, channel: 0 }
		});
	}

	async function handleNoteOff(event: CustomEvent<number>) {
		synthNode.port.postMessage({
			type: 'note-off',
			note: { id: event.detail, on: 0.0, off: audioContext.currentTime, active: true, channel: 0 }
		});
	}
</script>

<div class="p-2 w-full bg-rose-900">
	<h2 class="text-lg font-thin">Keyboard</h2>
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
