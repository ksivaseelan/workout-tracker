<script lang="ts">
	import { db } from '$lib/instantdb/db';
	import { goto } from '$app/navigation';

	let {children } = $props();

	let isLoggedin = $state(false);

	$effect(() => {
		db.subscribeAuth((auth) => {
			if (auth.user) {
				isLoggedin = true;
			} else {
				goto('/auth');
			}
		});
	});
</script>

{#if isLoggedin}
	{@render children()}
{/if}
