<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let noteNum: number;
	export let keyWidth = 56;
	export let pressed = false;

	const dispatch = createEventDispatcher();
	let isNatural = ![0, 3, 5, 7, 10].includes(noteNum % 12);
	let bias = 0;

	// Accidental keys are not perfectly centered
	if (!isNatural) {
		if ([3, 10].includes(noteNum % 12)) {
			bias = -keyWidth / 12;
		} else if ([0, 7].includes(noteNum % 12)) {
			bias = keyWidth / 12;
		}
	}

	function keyPressed() {
		if (pressed) return;
		dispatch('noteon', noteNum);
		pressed = true;
	}

	function keyReleased() {
		if (!pressed) return;
		dispatch('noteoff', noteNum);
		pressed = false;
	}
</script>

<div
	class:accidental={!isNatural}
	class:natural={isNatural}
	class:pressed
	style="--width: {keyWidth -
		keyWidth * 0.47 * (isNatural ? 0 : 1)}px; transform: translate({bias}px);"
	draggable="false"
	on:mousedown|preventDefault={keyPressed}
	on:mouseup|preventDefault={keyReleased}
	on:mouseenter={(e) => {
		if (e.buttons) keyPressed();
	}}
	on:mouseleave={(e) => {
		if (e.buttons) keyReleased();
	}}
	on:touchstart|preventDefault={keyPressed}
	on:touchend|preventDefault={keyReleased}
/>

<style>
	div {
		flex-shrink: 0;
		width: var(--width);
		min-width: min-content;
		border-radius: 0px 0px calc(var(--width) / 8) calc(var(--width) / 8);
		-webkit-user-drag: none;
	}
	.accidental {
		margin: 0px calc(var(--width) / -2) 0px calc(var(--width) / -2);
		z-index: 2;
		height: 60%;
		background: black;
		box-shadow: inset white 0px 0px 2px 0px;
	}
	.natural {
		height: 100%;
		background: white;
		box-shadow: inset black 0px 0px 2px 0px;
	}
	.accidental.pressed {
		background: hsl(0 0% 30%);
	}
	.natural.pressed {
		background: hsl(0 0% 90%);
	}
</style>
