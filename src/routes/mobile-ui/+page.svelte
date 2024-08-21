<script lang="ts">
	//UI
	import DatePicker from '$lib/components/ui/date-picker.svelte';
	import type { DateValue } from '@internationalized/date';
	import { Button } from '$lib/components/ui/button';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { SquarePlus, Trash2 } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';

	//replicache stuff
	import { dev } from '$app/environment';
	import { Replicache, type WriteTransaction } from 'replicache';
	import { flip } from 'svelte/animate';
	import { nanoid } from 'nanoid';

	//selected date
	let value: DateValue | undefined = $state(undefined);

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
				const key = `exercises/${args.id}`;
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

	let showAddExerciseForm = $state(false);
</script>

<div class="min-h-screen p-4">
	<h1 class="mb-8 text-center text-2xl font-bold">Workout Tracker</h1>
	<div class="sticky top-4 z-10 mb-4 text-center">
		<DatePicker bind:value />
		<div class:hidden={!showAddExerciseForm}>
			<Card.Root class="mt-4 w-[350px]">
				<Card.Header>
					<Card.Title>Add exercise</Card.Title>
				</Card.Header>
				<form method="POST" {onsubmit} id="exerciseForm">
					<Card.Content>
						<div class="grid w-full items-center gap-4">
							<div class="flex flex-col space-y-1.5">
								<Input
									type="text"
									name="name"
									id="name"
									bind:value={form_state.name}
									placeholder="Enter new exercise"
								/>
							</div>
						</div>
					</Card.Content>
					<Card.Footer class="flex justify-between">
						<Button variant="outline" onclick={() => (showAddExerciseForm = false)}>Cancel</Button>
						<Button type="submit">Add</Button>
					</Card.Footer>
				</form>
			</Card.Root>
		</div>
	</div>

	<!-- scrollable container -->
	<ScrollArea>
		<ul>
			{#each exercises as exercise (exercise.id)}
				<li animate:flip={{ duration: 200 }} class:completed={exercise.completed}>
					<Card.Root class="relative">
						<div class="absolute right-6 top-4">
							<Button
								class="h-6 w-6 p-0"
								variant="destructive"
								onclick={() => rep.mutate.delete_exercise(exercise)}
							>
								<Trash2 size={16}></Trash2>
							</Button>
						</div>
						<Card.Header>
							<Card.Title>{exercise.name}</Card.Title>
						</Card.Header>
						<Card.Content>
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head>Set</Table.Head>
										<Table.Head>Previous</Table.Head>
										<Table.Head>Weight</Table.Head>
										<Table.Head>Reps</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each exercise.sets as set}
										<Table.Row>
											<Table.Cell class="text-center font-medium">{set.number}</Table.Cell>
											<Table.Cell class="text-center">-</Table.Cell>
											<Table.Cell class="text-center">
												<Table.EditableCell value={set.weight} editable={true} />
											</Table.Cell>
											<Table.Cell class="text-center">
												<Table.EditableCell value={set.reps} editable={true} />
											</Table.Cell>
											<Table.Cell class="text-center">
												<Button
													class="h-6 w-6 p-0"
													variant="destructive"
													onclick={() => {
														const updatedSets = exercise.sets.filter((s) => s.id !== set.id);

														rep.mutate.update_exercise({
															...exercise,
															sets: updateSetNumbers(updatedSets)
														});
													}}
												>
													<Trash2 size={16}></Trash2>
												</Button>
											</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
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
								<Label for="weight" class="mb-2">Weight</Label>
								<Input type="text" name="weight" id="weight-{exercise.id}" />
								<Label for="reps" class="mb-2">Reps</Label>
								<Input type="text" name="reps" id="reps-{exercise.id}" />
								<Button type="submit">+ Add</Button>
							</form>
						</Card.Content>
					</Card.Root>
				</li>
			{/each}
		</ul>
	</ScrollArea>

	<div class="fixed bottom-4 right-4">
		<Button
			variant="default"
			onclick={() => {
				showAddExerciseForm = !showAddExerciseForm;
			}}><SquarePlus></SquarePlus> <span class="text-lg">Exercise</span></Button
		>
	</div>
</div>
