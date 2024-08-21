<script lang="ts"> 
	import { dev } from '$app/environment';
	import { Replicache, type WriteTransaction } from 'replicache';
	import { flip } from 'svelte/animate';
	import { nanoid } from 'nanoid';

	type Exercise = {
		id: string;
		name: string;
		deleted: boolean;
		sets: Set[];
		createdAt: string;
		updatedAt: string;
		completed: boolean;
	};

	type Set = {
		id: string;
		number: number;
		reps: string;
		weight: string;
		completed: boolean;
	};

	let exercises: Exercise[] = $state([]);
	let form_state = $state({ name: '' });
	let name = dev ? 'dev:exercises:userId' : 'exercises:userId';

	let rep = new Replicache({
		name,
		licenseKey: import.meta.env.VITE_REP_LICENSE,
		mutators: {
			create_exercise: async (tx: WriteTransaction, args: Exercise) => {
				const key = `exercises//home/kogul/projects/workout-tracker/src/lib/triplit${args.id}`;
				await tx.set(key, args);
			},
			delete_exercise: async (tx: WriteTransaction, args: Exercise) => {
				const key = `exercises/${args.id}`;
				await tx.del(key);
			},
			toggle_exercise: async (tx: WriteTransaction, args: Exercise) => {
				const key = `exercises/${args.id}`;
				await tx.set(key, args);
			},
			update_exercise: async (tx: WriteTransaction, args: Exercise) => {
				const key = `exercises/${args.id}`;
				await tx.set(key, args);
			}
		}
	});

	$effect(() => {
		return rep.subscribe(
			async (tx) => {
				const exercises_items = await tx.scan({ prefix: 'exercises/' }).entries().toArray();
				return exercises_items
					.map(([_, values]) => values as Exercise)
					.filter((exercise) => !exercise.deleted);
			},
			(items: Exercise[]) => {
				exercises = items
					.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0))
					.sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));
			}
		);
	});

	function toggle(exercise: Exercise) {
		rep.mutate.toggle_exercise({
			...exercise,
			completed: !exercise.completed
		});
	}

	function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		rep.mutate.create_exercise({
			id: nanoid(),
			name: form_state.name,
			sets: [],
			deleted: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			completed: false
		});
		form_state.name = '';
	}

	function updateSetNumbers(sets: Set[]) {
		return sets.map((set, index) => ({ ...set, number: index + 1 }));
	}
</script>

<h1>Workout Tracker</h1>
<form method="POST" {onsubmit} id="exerciseForm">
	<label for="name">Exercise:</label>
	<input type="text" name="name" id="name" bind:value={form_state.name} />
	<button type="submit">+ Add</button>
</form>

<ul>
	{#each exercises as exercise (exercise.id)}
		<li animate:flip={{ duration: 200 }} class:completed={exercise.completed}>
			<span>
				<h3>{exercise.name}</h3>
				<form
					method="POST"
					onsubmit={(e) => {
						e.preventDefault();

						const form = e.target as HTMLFormElement;
						const formData = new FormData(form);

						const set = exercise.sets.length + 1;
						const weight = formData.get('weight') as string;
						const reps = formData.get('reps') as string;

						const updatedSets = [
							...exercise.sets,
							{
								id: nanoid(),
								number: set,
								reps: reps,
								weight: weight,
								completed: false
							}
						];

						rep.mutate.update_exercise({
							...exercise,
							sets: updateSetNumbers(updatedSets)
						});

						form.reset();
					}}
				>
					<label for="weight">weight</label>
					<input type="text" name="weight" id="weight-{exercise.id}" />
					<label for="reps">reps</label>
					<input type="text" name="reps" id="reps-{exercise.id}" />
					<button type="submit">+ Add</button>
				</form>

				{#each exercise.sets as set (set.id)}
					<div>Set number: {set.number}</div>
					<div>Set reps: {set.reps}</div>
					<div>Set weight: {set.weight}</div>
					<button
						class="delete"
						onclick={() => {
							const updatedSets = exercise.sets.filter((s) => s.id !== set.id);

							rep.mutate.update_exercise({
								...exercise,
								sets: updateSetNumbers(updatedSets)
							});
						}}
					>
						x set
					</button>
				{/each}
				<button class="delete" onclick={() => rep.mutate.delete_exercise(exercise)}>
					x exercise
				</button>
			</span>
			<button class="check" onclick={() => toggle(exercise)}>
				<svg xmlns="http://www.w3.org/2000/svg" width="40px" height="100%" viewBox="0 0 32 32"
					><title>c-check</title><g fill="var(--fg)" stroke-linejoin="miter" stroke-linecap="butt"
						><circle
							cx="16"
							cy="16"
							r="14"
							fill="none"
							stroke="var(--fg)"
							stroke-linecap="square"
							stroke-miterlimit="10"
							stroke-width="2"
						></circle><polyline
							points="9 17 13 21.5 23 10"
							fill="none"
							stroke="var(--fg)"
							stroke-linecap="square"
							stroke-miterlimit="10"
							stroke-width="2"
						></polyline></g
					></svg
				>
			</button>
		</li>
	{/each}
</ul>
