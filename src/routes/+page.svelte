<script lang="ts">
	import Keyboard from '$components/Keyboard.svelte';
	import { onMount } from 'svelte';
	// import init, { greet, make_noise } from 'wasm-synth';

	let audioContext: AudioContext;
	let primaryGainControl: GainNode;
	let wasmBytes: ArrayBuffer;

	onMount(async () => {
		// await init();

		audioContext = new AudioContext();

		primaryGainControl = audioContext.createGain();
		primaryGainControl.gain.setValueAtTime(0.05, 0);

		primaryGainControl.connect(audioContext.destination);

		// Fetch the WebAssembly module that performs pitch detection.
		const response = await window.fetch('../wasm-synth/wasm_synth_bg.wasm');
		wasmBytes = await response.arrayBuffer();
		console.log(wasmBytes.byteLength);

		const processorUrl = 'src/audio/synth_processor.ts';
		try {
			await audioContext.audioWorklet.addModule(processorUrl);
		} catch (e: any) {
			throw new Error(
				`Failed to load audio analyzer worklet at url: ${processorUrl}. Further info: ${e.message}`
			);
		}
	});

	const sleep = (ms: number) => new Promise((f) => setTimeout(f, ms));

	async function keyPressed() {
		// import SynthNode from '$audio/synth_node';
		const SynthNode = (await import('$audio/synth_node')).default;
		// greet();
		// const buffer = audioContext.createBuffer(
		// 	1,
		// 	audioContext.sampleRate * 1,
		// 	audioContext.sampleRate
		// );
		// const channelData = buffer.getChannelData(0);
		//
		// for (let i = 0; i < buffer.length; i++) {
		// 	channelData[i] = make_noise(i / audioContext.sampleRate);
		// }
		//
		// const whiteNoiseSource = audioContext.createBufferSource();
		// whiteNoiseSource.buffer = buffer;
		// whiteNoiseSource.connect(primaryGainControl);
		//
		// whiteNoiseSource.start();
		const synth_node = new SynthNode(audioContext, 'SynthProcessor');
		synth_node.init(wasmBytes);
		synth_node.connect(primaryGainControl);
		audioContext.resume();

		await sleep(1000); // simulate network delay
		synth_node.disconnect();
	}
</script>

<main class="m-6">
	<h1 class="text-sky-400">Wasm-Rust-Synth</h1>

	<!-- Piano -->
	<button on:click={keyPressed}> Click me </button>
</main>

<Keyboard />
