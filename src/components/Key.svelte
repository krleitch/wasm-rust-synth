<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let note: number;
	export let keyWidth = 56;
	export let pressed = false;
	export let label = '';

	const dispatch = createEventDispatcher();
	let isNatural = ![1, 3, 6, 8, 10].includes(note % 12);
	let bias = 0;

	// Accidental keys are not perfectly centered
	if (!isNatural) {
		if ([1, 6].includes(note % 12)) {
			bias = -keyWidth / 12;
		} else if ([3, 10].includes(note % 12)) {
			bias = keyWidth / 12;
		}
	}

	function keyPressed() {
		if (pressed) return;
		dispatch('noteon', note);
		pressed = true;
	}

	function keyReleased() {
		if (!pressed) return;
		dispatch('noteoff', note);
		pressed = false;
	}

	function onKeyDown(event: KeyboardEvent) {
		event.preventDefault();
		switch (event.key) {
			case label:
				keyPressed();
				break;
		}
	}
	function onKeyUp(event: KeyboardEvent) {
		event.preventDefault();
		switch (event.key) {
			case label:
				keyReleased();
				break;
		}
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
	on:touchstart={keyPressed}
	on:touchend={keyReleased}
>
	{label}
</div>

<svelte:window on:keydown={onKeyDown} on:keyup={onKeyUp} />

<style>
	div {
		display: flex;
		justify-content: center;
		align-items: flex-end;
		padding-bottom: 5px;
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
		color: white;
	}
	.natural {
		height: 100%;
		background: white;
		box-shadow: inset black 0px 0px 2px 0px;
		color: black;
	}
	.accidental.pressed {
		background: hsl(0 0% 30%);
	}
	.natural.pressed {
		background: hsl(0 0% 90%);
	}
</style>
