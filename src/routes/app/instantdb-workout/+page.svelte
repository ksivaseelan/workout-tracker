<script lang="ts">
	//instantdb
	import { init, tx, id } from '@instantdb/core';

	//UI
	import DatePicker from '$lib/components/ui/date-picker.svelte';
	import { type DateValue, today, getLocalTimeZone } from '@internationalized/date';
	import { Button } from '$lib/components/ui/button';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { SquarePlus, Trash2, EllipsisVertical, Pencil, Check } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import { flip } from 'svelte/animate';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	const APP_ID = 'efdf7751-de2d-41d2-954c-4b89523fb652';

	interface Exercise {
		id: string;
		name: string;
		sets: Set[];
		date: number;
		createdAt: number;
		editing: boolean;
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

	//selected date for the datepicker defaults tp today
	let value: DateValue = $state(today(getLocalTimeZone()));

	let newExerciseName = $state('');

	let editExerciseName = $state('');

	async function onsubmit(e: SubmitEvent) {
		e.preventDefault();
		await db.transact(
			tx.exercises[id()].update({
				name: newExerciseName,
				createdAt: Date.now(),
				date: value.toDate(getLocalTimeZone()).toDateString()
			})
		);
		newExerciseName = '';
		showAddExerciseForm = false;
	}

	async function deleteExercise(exerciseId: string) {
		await db.subscribeQuery({ sets: { $: { where: { 'exercises.id': exerciseId } } } }, (resp) => {
			resp.data?.sets.map((set) => {
				db.transact(tx.sets[set.id].delete());
			});
		});
		//delay to delete sets before exercise
		await new Promise((r) => setTimeout(r, 100));
		await db.transact(tx.exercises[exerciseId].delete());
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
				<Card.Root class="relative mx-auto w-full max-w-[90w] overflow-hidden">
					<Card.Header>
						<Card.Title>
							{#if exercise.editing}
								<div class="flex">
									<Input
										class="mr-2 w-1/2"
										placeholder={exercise.name}
										bind:value={editExerciseName}
										onblur={async () => {
											await db.transact(
												tx.exercises[exercise.id].update({ name: editExerciseName })
											);
											await db.transact(tx.exercises[exercise.id].update({ editing: false }));
										}}
									/>
								</div>
							{:else}
								{exercise.name}
							{/if}
							<div class="absolute right-10 top-4">
								<DropdownMenu.Root>
									<DropdownMenu.Trigger>
										<EllipsisVertical size={20}></EllipsisVertical>
									</DropdownMenu.Trigger>
									<DropdownMenu.Content class="w-32">
										<DropdownMenu.Group>
											<DropdownMenu.Item class="bg-destructive" onclick={() => deleteExercise(exercise.id)}>
												<Trash2 class="mr-2 h-4 w-4" />
												<span>Delete</span>
											</DropdownMenu.Item>
											<DropdownMenu.Item
												onclick={() =>
													db.transact(tx.exercises[exercise.id].update({ editing: true }))}
											>
												<Pencil class="mr-2 h-4 w-4" />
												<span>Edit</span>
											</DropdownMenu.Item>
										</DropdownMenu.Group>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
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
									<Table.Row>
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
