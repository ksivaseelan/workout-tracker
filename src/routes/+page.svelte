<script lang="ts">
	import { dev } from '$app/environment';
	import { Replicache, type WriteTransaction } from 'replicache';
	import { flip } from 'svelte/animate';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';

	import { Trash2 } from 'lucide-svelte';

	//TODO: get add set form inside each exercise card working

	//define Exercise type
	// type Exercise = {
	// 	id: number;
	// 	name: string;
	// 	sets: string;
	//     reps: string;
	//     weight: string;
	// 	deleted: boolean;
	// 	createdAt: string;
	// 	updatedAt: string;
	// };

	type Exercise = {
		id: number;
		name: string;
		sets: Set[];
		deleted: boolean;
		completed: boolean;
		createdAt: string;
		updatedAt: string;
	};

	type Set = {
		id: number;
		number: number;
		reps: string;
		weight: string;
		warmup: boolean;
	};

	//define state
	let exercises: Exercise[] = $state([]);
	let sets: Set[] = $state([]);
	let form_state = $state({ name: '' });
	let set_form_state = $state({ reps: '', weight: '' });
	let name = dev ? 'dev:exercises:userId' : 'exercises:userId';

	//replicache constructor
	let rep = new Replicache({
		name,
		licenseKey: import.meta.env.VITE_REP_LICENSE,
		//functions that run when changing replicache state
		// Runs locally first and if there is a server it syncs later
		mutators: {
			create_exercise: async (tx: WriteTransaction, args: Exercise) => {
				const key = `exercises/${args.id}`;
				await tx.set(key, args);
			},
			delete_exercise: async (tx: WriteTransaction, args: Exercise) => {
				const key = `exercises/${args.id}`;
				await tx.del(key);
			},
			add_set: async (tx: WriteTransaction, args: Exercise) => {
				const key = `exercises/${args.id}`;
				await tx.set(key, args);
				console.log(args);
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

	//on form submit function
	async function createExercise() {
		await rep.mutate.create_exercise({
			id: new Date().getTime(),
			name: form_state.name,
			sets: [],
			deleted: false,
			completed: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		});
		form_state.name = '';
	}

	//delete function
	async function remove(exercise: Exercise) {
		rep.mutate.delete_exercise({
			...exercise,
			deleted: !exercise.deleted
		});
	}

	//add set function
	async function addSet(exercise: Exercise) {
		await rep.mutate.add_set({
			...exercise,
			sets: [
				...exercise.sets,
				{
					id: new Date().getTime(),
					number: exercise.sets.length + 1,
					warmup: false,
					reps: set_form_state.reps,
					weight: set_form_state.weight
				}
			]
		});
	}
</script>

<Card.Root class="w-[350px]">
	<Card.Header>
		<Card.Title>Add Exercise</Card.Title>
		<Card.Description>Track your exercise</Card.Description>
	</Card.Header>
	<Card.Content>
		<form method="post">
			<div class="grid w-full items-center gap-4">
				<div class="flex flex-col space-y-1.5">
					<Label for="name">Exercise Name</Label>
					<Input type="text" name="name" id="name" bind:value={form_state.name} />
				</div>
			</div>
		</form>
	</Card.Content>
	<Card.Footer>
		<div class="grid w-full">
			<div class="flex justify-end">
				<Button onclick={() => createExercise()}>+ Add Exercise</Button>
			</div>
		</div>
	</Card.Footer>
</Card.Root>

<ul>
	{#each exercises as exercise (exercise.id)}
		<li animate:flip={{ duration: 200 }}>
			<Card.Root class="w-[500px]">
				<Card.Header>
					<div class="grid w-full items-center">
						<div class="flex justify-between">
							<Card.Title>{exercise.name}</Card.Title>
							<Button variant="ghost" onclick={() => remove(exercise)}>
								<Trash2 />
							</Button>
						</div>
					</div>
				</Card.Header>
				<Card.Content>
					<form method="post">
						<div class="grid w-full grid-cols-4 items-center gap-4">
							<div class="flex flex-col space-y-1.5">
								<Label for="reps">Reps</Label>
								<Input type="text" name="reps" id="reps" bind:value={set_form_state.reps} />
							</div>
							<div class="flex flex-col space-y-1.5">
								<Label for="weight">Weight</Label>
								<Input type="text" name="weight" id="weight" bind:value={set_form_state.weight} />
							</div>
							<div class="flex justify-center">
								<Checkbox class="h-6 w-6" />
							</div>
						</div>
					</form>
				</Card.Content>
				<Card.Footer>
					<div class="grid w-full">
						<div class="flex justify-center">
							<Button onclick={() => addSet(exercise)}>+ Add Set</Button>
						</div>
					</div>
				</Card.Footer>
			</Card.Root>
		</li>
	{/each}
</ul>
