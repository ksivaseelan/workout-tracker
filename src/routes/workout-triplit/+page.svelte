<script lang="ts">
	//UI
	import DatePicker from '$lib/components/ui/date-picker.svelte';
	import { type DateValue, CalendarDate, today, getLocalTimeZone } from '@internationalized/date';
	import { Button } from '$lib/components/ui/button';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { SquarePlus, Trash2 } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import { flip } from 'svelte/animate';

	//triplit stuff
	import { useQuery } from '@triplit/svelte';
	import { triplit } from '@/triplit/client';
	import { type Exercise, type Set } from '../../../triplit/schema';

	//selected date
	let value: DateValue = $state(today(getLocalTimeZone()));

	let newExerciseName = $state('');

	const exercises = $derived(
		useQuery(
			triplit,
			triplit
				.query('exercises')
				.include('sets')
				.order('date', 'DESC')
				.where('date', '=', value.toDate(getLocalTimeZone()))
		)
	);

	let exercisesArray = $derived(
		exercises.results
			? Array.from(exercises.results.values()).map((exercise) => ({
					...exercise,
					sets: Array.from(exercise.sets.values()).map((set, index) => ({
						...set,
						number: index + 1
					}))
				}))
			: []
	);

	// function toggle(exercise: Exercise) {
	// 	rep.mutate.toggle_exercise({
	// 		...exercise,
	// 		completed: !exercise.completed
	// 	});
	// }

	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		await triplit.insert('exercises', {
			name: newExerciseName,
			date: value.toDate(getLocalTimeZone())
		});
		newExerciseName = '';
	}

	let showAddExerciseForm = $state(false);
</script>

<!-- svelte-ignore state_referenced_locally -->
<!-- svelte-ignore state_referenced_locally -->
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
									bind:value={newExerciseName}
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
		{#if exercises.fetching}
			<p>Loading...</p>
		{/if}
		{#if exercises.results}
			<ul>
				{#each exercisesArray as exercise (exercise.id)}
					<li animate:flip={{ duration: 200 }}>
						<Card.Root class="relative">
							<div class="absolute right-6 top-4">
								<Button
									class="h-6 w-6 p-0"
									variant="destructive"
									onclick={async () => await triplit.delete('exercises', exercise.id)}
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
										{#each exercise.sets as set (set.id)}
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
														onclick={async () => {
															await triplit.delete('sets', set.id);
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
									onsubmit={async (e) => {
										e.preventDefault();

										const form = e.target as HTMLFormElement;
										const formData = new FormData(form);

										const weight = formData.get('weight') as string;
										const reps = formData.get('reps') as string;

										await triplit.insert('sets', {
											weight: weight,
											reps: reps,
											completed: false,
											exercise_id: exercise.id
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
		{/if}
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
