<script lang="ts">
	import { triplit } from '@/triplit/client';
	import { type Todo } from '../../../triplit/schema-todo';

	interface Props {
		todo: Todo;
	}
	let { todo }: Props = $props();
</script>

<div>
	<input
		type="checkbox"
		checked={todo.completed}
		onchange={async () => {
			await triplit.update('todos', todo.id, async (entitiy) => {
				entitiy.completed = !todo.completed;
			});
		}}
	/>
	{todo.text}

	<button
		onclick={async () => {
			await triplit.delete('todos', todo.id);
		}}
	>
		X
	</button>
</div>
