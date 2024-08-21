<script lang="ts">
	import { useQuery } from '@triplit/svelte';
	import { triplit } from '@/triplit/client';
	import Todo from './todo.svelte';

	let text = $state('');
	const todos = useQuery(triplit, triplit.query('todos').order('created_at', 'DESC'));

	let todosArray = $derived(todos.results ? Array.from(todos.results) : []);
</script>

<h1>Todos</h1>
<form
	onsubmit={async (e) => {
		e.preventDefault();
		await triplit.insert('todos', { text });
		text = '';
	}}
>
	<input type="text" bind:value={text} />
	<button type="submit" disabled={!text}>Add</button>
</form>
{#if todos.fetching}
	<p>Loading...</p>
{/if}
{#if todos.results}
	{#each todosArray as [_key, todo]}
		<Todo {todo} />
	{/each}
{/if}