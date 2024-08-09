<script lang="ts">
	import { dev } from '$app/environment';
	import { Replicache, type WriteTransaction } from 'replicache';
	import { flip } from 'svelte/animate';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	import { Trash2 } from 'lucide-svelte';

	type Exercise = {
		id: number;
		name: string;
		sets: Set[];
		deleted: boolean;
		createdAt: string;
		updatedAt: string;
	};

	type Set = {
		id: number;
		number: number;
		reps: string;
		weight: string;
	};

	let exercises: Exercise[] = $state([]);
	let exerciseFormState = $state({ name: '' });
	let newReps = $state('');
	let newWeight = $state('');
	let name = dev ? 'dev:exercises:userId' : 'exercises:userId';

	let rep = new Replicache({
		name,
		licenseKey: import.meta.env.VITE_REP_LICENSE,
		mutators: {
			create_exercise: async (tx: WriteTransaction, args: Exercise) => {
				const key = `exercises/${args.id}`;
				await tx.set(key, args);
			},
			delete_exercise: async (tx: WriteTransaction, args: Exercise) => {
				const key = `exercises/${args.id}`;
				await tx.del(key);
			},
			add_set: async (tx: WriteTransaction, args: { exerciseId: number; set: Set }) => {
				const key = `exercises/${args.exerciseId}`;
				const exercise = (await tx.get(key)) as Exercise;
				if (exercise) {
					exercise.sets.push(args.set);
					exercise.updatedAt = new Date().toISOString();
					await tx.set(key, exercise);
				}
			}
		}
	});

	$effect(() => {
		rep.subscribe(
			async (tx) => {
				const exercise_items = await tx.scan({ prefix: 'exercises/' }).entries().toArray();
				return exercise_items
					.map(([_, values]) => values as Exercise)
					.filter((exercise) => !exercise.deleted);
			},
			(items) => {
				console.log(items);
				exercises = items.sort((a, b) =>
					a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0
				);
			}
		);
	});

	async function createExercise() {
		if (exerciseFormState.name.trim()) {
			console.log(exerciseFormState.name);
			console.log(exercises);
			await rep.mutate.create_exercise({
				id: new Date().getTime(),
				name: exerciseFormState.name,
				sets: [],
				deleted: false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			});
			exerciseFormState.name = '';
		}
	}

	async function deleteExercise(exercise: Exercise) {
		await rep.mutate.delete_exercise({
			...exercise,
			deleted: true
		});
	}

	async function addSet(exercise: Exercise, reps: string, weight: string) {
		if (reps.trim() && weight.trim()) {
			const newSet: Set = {
				id: new Date().getTime(),
				number: exercise.sets.length + 1,
				reps,
				weight
			};
			await rep.mutate.add_set({ exerciseId: exercise.id, set: newSet });
		}
	}
</script>

<Card.Root class="mb-4 w-[350px]">
	<Card.Header>
		<Card.Title>Add Exercise</Card.Title>
	</Card.Header>
	<Card.Content>
		<form method="post">
			<div class="flex space-x-2">
				<Input type="text" placeholder="Exercise Name" bind:value={exerciseFormState.name} />
				<Button onclick={() => createExercise()}>Add Exercise</Button>
			</div>
		</form>
	</Card.Content>
</Card.Root>

<div class="space-y-4">
	{#each exercises as exercise (exercise.id)}
		<div animate:flip={{ duration: 200 }}>
			<Card.Root>
				<Card.Header class="flex items-center justify-between">
					<Card.Title>{exercise.name}</Card.Title>
					<Button variant="ghost" on:click={() => deleteExercise(exercise)}>
						<Trash2 />
					</Button>
				</Card.Header>
				<Card.Content>
					<form method="post" class="mb-4">
						<div class="flex space-x-2">
							<Input type="text" placeholder="Reps" bind:value={newReps} />
							<Input type="text" placeholder="Weight" bind:value={newWeight} />
							<Button
								on:click={() => {
									addSet(exercise, newReps, newWeight);
									newReps = '';
									newWeight = '';
								}}
							>
								Add Set
							</Button>
						</div>
					</form>

					{#if exercise.sets.length > 0}
						<table class="w-full">
							<thead>
								<tr>
									<th class="text-left">Set</th>
									<th class="text-left">Reps</th>
									<th class="text-left">Weight</th>
								</tr>
							</thead>
							<tbody>
								{#each exercise.sets as set (set.id)}
									<tr>
										<td>{set.number}</td>
										<td>{set.reps}</td>
										<td>{set.weight}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{:else}
						<p>No sets added yet.</p>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>
	{/each}
</div>
