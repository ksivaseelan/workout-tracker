<script lang="ts">
	import type {} from 'svelte/elements';
	import { cn } from '$lib/utils.js';

	let { value, editable } = $props();

	let editing = $state(false);

	function toggleEditing() {
		editing = !editing;
	}
</script>

{#if editing}
	<input
		autofocus
		type="text"
		bind:value
		class={cn('w-8 rounded-lg bg-transparent p-2 outline outline-2 outline-white')}
		onblur={toggleEditing}
	/>
{:else}
	<button onclick={toggleEditing} class={cn('p-2', editable ? 'cursor-pointer' : '')}
		>{value}
	</button>
{/if}
