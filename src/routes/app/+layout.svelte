<script lang="ts">
	import { db } from '$lib/instantdb/db';
	import { goto } from '$app/navigation';


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
	<slot class="md:ml-16" />
{/if}
