import { writable } from 'svelte/store';
import { browser } from '$app/environment';

import type { Writable } from 'svelte/store';

type SynthAudioWorkletNode = AudioWorkletNode & { init: (wasmBytes: ArrayBuffer) => void };

// exports
export const uncompatibleBrowser = writable(false);
export const audioContext: Writable<AudioContext | undefined> = writable(undefined);
export const primaryGainNode: Writable<GainNode | undefined> = writable(undefined);
export const synthNode: Writable<SynthAudioWorkletNode | undefined> = writable(undefined);
export const oscilloscope: Writable<AnalyserNode | undefined> = writable(undefined);

export async function setupAudio() {
	// Only run in browser
	if (browser) {
		const context = new AudioContext();
		// Add worklet processors
		// Will not work in firefox, worklets don't support es6 modules
		// https://bugzilla.mozilla.org/show_bug.cgi?id=1636121
		const processorUrl = 'src/audio/synth_processor.ts';
		try {
			await context.audioWorklet.addModule(processorUrl);
		} catch (e: unknown) {
			uncompatibleBrowser.set(true);
		}

		// create an oscilloscope
		const WavyJones = (await import('$audio/wavy_jones')).default;
		const wavyJones = new WavyJones(context, 'oscilloscope');
		wavyJones.analyser.lineColor = '#EE0000';
		wavyJones.analyser.lineThickness = 3;
		wavyJones.analyser.connect(context.destination);

		// Connect to a primary gain node
		const gainNode = context.createGain();
		gainNode.gain.setValueAtTime(0.05, 0);
		gainNode.connect(wavyJones.analyser);

		// Fetch the WebAssembly module that performs pitch detection.
		const response = await window.fetch('src/wasm/wasm_synth_bg.wasm');
		const wasmBytes = await response.arrayBuffer();

		// Create the synth node
		const SynthNode = (await import('$audio/synth_node')).default;
		const synthProcessor = new SynthNode(context, 'SynthProcessor', { outputChannelCount: [1] });
		synthProcessor.init(wasmBytes);
		synthProcessor.connect(gainNode);

		// Update the stores
		audioContext.set(context);
		primaryGainNode.set(gainNode);
		synthNode.set(synthProcessor);
		oscilloscope.set(wavyJones.analyser);
	}
}
