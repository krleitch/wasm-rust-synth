import { writable } from 'svelte/store';
import { browser } from '$app/environment';

import type { Writable } from 'svelte/store';

type SynthAudioWorkletNode = AudioWorkletNode & { init: (wasmBytes: ArrayBuffer) => void };

// Create the context
// let context: AudioContext | undefined;
// let gainNode: GainNode | undefined;
// let synthProcessor: SynthAudioWorkletNode | undefined;
// let error = false; // if we run into an error set this flag to show the browser has issues

// exports
export const uncompatibleBrowser = writable(false);
export const audioContext: Writable<AudioContext | undefined> = writable(undefined);
export const primaryGainNode: Writable<GainNode | undefined> = writable(undefined);
export const synthNode: Writable<SynthAudioWorkletNode | undefined> = writable(undefined);

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

		// Connect to a primary gain node
		const gainNode = context.createGain();
		gainNode.gain.setValueAtTime(0.05, 0);
		gainNode.connect(context.destination);

		// Fetch the WebAssembly module that performs pitch detection.
		const response = await window.fetch('src/wasm/wasm_synth_bg.wasm');
		const wasmBytes = await response.arrayBuffer();

		// Create the synth node
		const SynthNode = (await import('$audio/synth_node')).default;
		const synthProcessor = new SynthNode(context, 'SynthProcessor', { outputChannelCount: [1] });
		synthProcessor.init(wasmBytes);
		synthProcessor.connect(gainNode);

		audioContext.set(context);
		primaryGainNode.set(gainNode);
		synthNode.set(synthProcessor);
	}
}
