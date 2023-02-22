<script lang="ts">
	import { onMount } from 'svelte';
	import Key from '$components/Key.svelte';

	export let octaves = 2;
	// Todo: isNatural in key.svelte should be based on this number
	export let middleCMidiNum = 69;
	export let keysPressed: Array<number> = [];

	let keys: Array<number>;
	$: keys = [...Array(octaves * 12 + 1).keys()].map(
		(i) => i + (middleCMidiNum - Math.floor(octaves / 2) * 12)
	);

	function getFreqFromMidiNum(midiNum: number) {
		return 2 ** ((midiNum - middleCMidiNum) / 12) * 440;
	}

	let audioContext: AudioContext;
	let primaryGainControl: GainNode;
	let wasmBytes: ArrayBuffer;
	let uncompatibleBrowser = false; // If the browser doesnt support audio worklets

	onMount(async () => {
		// await init();

		audioContext = new AudioContext();

		primaryGainControl = audioContext.createGain();
		primaryGainControl.gain.setValueAtTime(0.05, 0);

		primaryGainControl.connect(audioContext.destination);

		// Fetch the WebAssembly module that performs pitch detection.
		const response = await window.fetch('src/wasm/wasm_synth_bg.wasm');
		wasmBytes = await response.arrayBuffer();

		// Will not work in firefox, worklets don't support es6 modules
		// https://bugzilla.mozilla.org/show_bug.cgi?id=1636121
		const processorUrl = 'src/audio/synth_processor.ts';
		try {
			await audioContext.audioWorklet.addModule(processorUrl);
		} catch (e: any) {
			uncompatibleBrowser = true;
			throw new Error(
				`Failed to load audio analyzer worklet at url: ${processorUrl}. Further info: ${e.message}`
			);
		}
	});

	const sleep = (ms: number) => new Promise((f) => setTimeout(f, ms));

	async function handleNoteOn(event: CustomEvent<number>) {
		const freq = getFreqFromMidiNum(event.detail);
		const SynthNode = (await import('$audio/synth_node')).default;
		const synth_node = new SynthNode(audioContext, 'SynthProcessor');
		synth_node.init(wasmBytes);

		// set freq
		const freq_param = synth_node.parameters.get('frequency');
		freq_param?.setValueAtTime(freq, audioContext.currentTime);

		synth_node.connect(primaryGainControl);
		audioContext.resume();

		await sleep(1000); // simulate network delay
		synth_node.disconnect();
	}

	function handleNoteOff(event: CustomEvent<number>) {
		// console.log(event.detail);
	}
</script>

<div class="p-2 w-full bg-rose-900">
	<h2 class="text-lg font-thin">Keyboard</h2>
</div>
<div class="flex justify-center bg-slate-900">
	<div class="flex px-4 h-56 overflow-auto">
		{#each keys as note}
			<Key
				noteNum={note}
				on:noteon={handleNoteOn}
				on:noteoff={handleNoteOff}
				pressed={keysPressed.includes(note)}
			/>
		{/each}
	</div>
</div>
