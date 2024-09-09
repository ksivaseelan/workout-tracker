<script lang="ts">
	//instantdb
	import { init, tx, id } from '@instantdb/core';

	//UI
	import DatePicker from '$lib/components/ui/date-picker.svelte';
	import { type DateValue, today, getLocalTimeZone } from '@internationalized/date';
	import { Button } from '$lib/components/ui/button';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { SquarePlus, Trash2 } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import { flip } from 'svelte/animate';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';

	const APP_ID = 'efdf7751-de2d-41d2-954c-4b89523fb652';

	interface Exercise {
		id: string;
		name: string;
		sets: Set[];
		date: number;
		createdAt: number;
	}

	interface Set {
		id: string;
		number: number;
		reps: string;
		weight: string;
		completed: boolean;
		createdAt: number;
		exercises: Exercise;
	}

	type Schema = {
		exercises: Exercise;
		sets: Set;
	};

	const db = init<Schema>({ appId: APP_ID });

	let exercises: Exercise[] = $state([]);
	let error: string | null = $state(null);

	$effect(() => {
		db.subscribeQuery(
			{
				exercises: {
					$: {
						where: {
							date: value.toDate(getLocalTimeZone()).toDateString()
						}
					},
					sets: {}
				}
			},
			(resp) => {
				if (resp.error) {
					error = resp.error.message;
					return;
				}
				if (resp.data) {
					exercises = resp.data.exercises;
				}
			}
		);
	});

	let showAddExerciseForm = $state(false);

	//selected date for the datepicker
	let value: DateValue = $state(today(getLocalTimeZone()));

	let newExerciseName = $state('');

	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		db.transact(
			tx.exercises[id()].update({
				name: newExerciseName,
				createdAt: Date.now(),
				date: value.toDate(getLocalTimeZone()).toDateString()
			})
		);
		newExerciseName = '';
	}
</script>

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
	<ul>
		{#each exercises as exercise (exercise.id)}
			<li class="mb-4" animate:flip={{ duration: 200 }}>
				<AlertDialog.Root>
					<AlertDialog.Content>
						<AlertDialog.Header>
							<AlertDialog.Title>Are you sure?</AlertDialog.Title>
							<AlertDialog.Description>
								This action cannot be undone.
								<br />
								This will permanently delete the exercise:
								<strong>{exercise.name}</strong> and its sets.
							</AlertDialog.Description>
						</AlertDialog.Header>
						<AlertDialog.Footer>
							<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
							<AlertDialog.Action
								class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
								onclick={() => db.transact(tx.exercises[exercise.id].delete())}
							>
								Continue
							</AlertDialog.Action>
						</AlertDialog.Footer>
					</AlertDialog.Content>

					<Card.Root class="relative mx-auto w-full max-w-[90w] overflow-hidden">
						<Card.Header>
							<Card.Title>
								{exercise.name}
								<div class="absolute right-10 top-4">
									<AlertDialog.Trigger asChild let:builder>
										<Button builders={[builder]} class="h-6 w-6 p-0" variant="destructive">
											<Trash2 size={16}></Trash2>
										</Button>
									</AlertDialog.Trigger>
								</div>
							</Card.Title>
						</Card.Header>
						<Card.Content class="">
							<Table.Root class="w-full">
								<Table.Header>
									<Table.Row>
										<Table.Head class="w-1/8">Set</Table.Head>
										<Table.Head class="w-1/8">Previous</Table.Head>
										<Table.Head class="w-1/8">Weight</Table.Head>
										<Table.Head class="w-1/8">Reps</Table.Head>
										<Table.Head class="w-1/8"></Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each exercise.sets as set, i (set.id)}
										<Table.Row >
											<Table.Cell class=" text-sm font-bold">{i + 1}</Table.Cell>
											<Table.Cell class=" text-sm">-</Table.Cell>
											<Table.Cell class="text-sm">
												{set.weight}
											</Table.Cell>
											<Table.Cell class="text-sm ">
												{set.reps}
											</Table.Cell>
											<Table.Cell class="text-center">
												<Button
													class="h-5 w-5 p-0"
													variant="destructive"
													onclick={() => {
														db.transact(tx.sets[set.id].delete());
													}}
												>
													<Trash2 size={15}></Trash2>
												</Button>
											</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
							<form
								class="mt-4"
								method="POST"
								onsubmit={async (e) => {
									e.preventDefault();

									const form = e.target as HTMLFormElement;
									const formData = new FormData(form);

									const weight = formData.get('weight') as string;
									const reps = formData.get('reps') as string;

									db.transact(
										tx.sets[id()]
											.update({
												weight: weight,
												reps: reps,
												createdAt: Date.now()
											})
											.link({ exercises: exercise.id })
									);

									form.reset();
								}}
							>
								<div class="grid grid-cols-2 gap-4">
									<div>
										<Label for="weight" class="mb-2">Weight</Label>
										<Input type="text" name="weight" id="weight-{exercise.id}" />
									</div>
									<div>
										<Label for="reps" class="mb-2">Reps</Label>
										<Input type="text" name="reps" id="reps-{exercise.id}" />
									</div>
								</div>
								<Button class="mt-4 w-full" type="submit">+ Add</Button>
							</form>
						</Card.Content>
					</Card.Root>
				</AlertDialog.Root>
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
