<script lang="ts">
	import { init, tx, id } from '@instantdb/core';

	// ID for app: Instant Tutorial Todo App
	const APP_ID = '2ad70e4e-e9b5-4bfd-a662-32f57fb613bf';

	interface Todo {
		id: string;
		text: string;
		done: boolean;
		createdAt: number;
	}

	interface Todo {
		id: string;
		text: string;
		done: boolean;
		createdAt: number;
	}

	type Schema = {
		todos: Todo;
	};

	const db = init<Schema>({ appId: APP_ID });

	let todos: Todo[] = $state([]);
	let error: string | null = $state(null);
	
	// query instantDB data
	$effect(() => {
		db.subscribeQuery({ todos: {} }, (resp) => {
			if (resp.error) {
				error = resp.error.message;
				return;
			}
			if (resp.data) {
				todos = resp.data.todos;
			}
		});
	});

	
	function addTodo(text: string) {
		db.transact(
			tx.todos[id()].update({
				text,
				done: false,
				createdAt: Date.now()
			})
		);
	}

	function deleteTodoItem(todo: Todo) {
		db.transact(tx.todos[todo.id].delete());
	}

	function toggleDone(todo: Todo) {
		db.transact(tx.todos[todo.id].update({ done: !todo.done }));
	}

	function deleteCompleted() {
		const completed = todos.filter((todo) => todo.done);
		const txs = completed.map((todo) => tx.todos[todo.id].delete());
		db.transact(txs);
	}

	function toggleAllTodos() {
		const newVal = !todos.every((todo) => todo.done);
		db.transact(todos.map((todo) => tx.todos[todo.id].update({ done: newVal })));
	}

	let newTodoText = $state('');

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (newTodoText.trim()) {
			addTodo(newTodoText);
			newTodoText = '';
		}
	}

	const remainingTodos = $derived(todos.filter((todo) => !todo.done).length);
</script>

<main class="ml-16">
	<h1>todos</h1>

	{#if $error}
		<div class="error">{$error}</div>
	{:else}
		<div class="todo-container">
			<div class="todo-form">
				<button class="toggle-all" onclick={toggleAllTodos}>⌄</button>
				<form onsubmit={(e) => handleSubmit(e)}>
					<!-- svelte-ignore a11y_autofocus -->
					<input
						bind:value={newTodoText}
						placeholder="What needs to be done?"
						type="text"
						autofocus
					/>
				</form>
			</div>

			<ul class="todo-list">
				{#each todos as todo (todo.id)}
					<li class="todo-item">
						<input type="checkbox" checked={todo.done} onchange={() => toggleDone(todo)} />
						<span class:completed={todo.done}>{todo.text}</span>
						<button class="delete" onclick={() => deleteTodoItem(todo)}>𝘟</button>
					</li>
				{/each}
			</ul>

			<div class="action-bar">
				<span>Remaining todos: {remainingTodos}</span>
				<button onclick={deleteCompleted}>Delete Completed</button>
			</div>
		</div>

		<footer>Open another tab to see todos update in realtime!</footer>
	{/if}
</main>
