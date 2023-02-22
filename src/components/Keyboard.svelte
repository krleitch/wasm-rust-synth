<script lang="ts">
	import Key from '$components/Key.svelte';

	export let octaves = 2;
	export let middleC = 60;
	export let keysPressed: Array<number> = [];

	let keys: Array<number>;
	$: keys = [...Array(octaves * 12 + 1).keys()].map(
		(i) => i + (middleC - Math.floor(octaves / 2) * 12)
	);

	function handleNoteOn(event: CustomEvent<number>) {
		console.log(event.detail);
	}

	function handleNoteOff(event: CustomEvent<number>) {
		console.log(event.detail);
	}
</script>

<div class="flex justify-center">
	<div class="flex p-4 h-56 overflow-auto">
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
