<script lang="ts">
	//UI
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import * as Select from '$lib/components/ui/select';
	import { Switch } from '$lib/components/ui/switch';
	import { Checkbox } from '$lib/components/ui/checkbox';

	import { type DateValue } from '@internationalized/date';

	//InstantDB
	import { init, tx, id } from '@instantdb/core';
	import { PUBLIC_INSTANTDB_DEV_APP_ID, PUBLIC_INSTANTDB_PROD_APP_ID } from '$env/static/public';
	import { dev } from '$app/environment';

	const APP_ID = dev ? PUBLIC_INSTANTDB_DEV_APP_ID : PUBLIC_INSTANTDB_PROD_APP_ID;

	interface habitGoal {
		id: string;
		type: 'habit';
		category: string;
		targetNumber: number | undefined;
		frequency: string;
		timeFrame: DateValue | undefined;
		receiveTips: boolean | undefined;
		receiveReminders: boolean | undefined;
		receiveProgressUpdates: boolean | undefined;
		notificationTiming: string;
		notifyEmail: boolean | undefined;
		notifyWeb: boolean | undefined;
	}

	interface performanceGoal {
		id: string;
		type: 'performance';
		category: string;
		frequency: string;
		receiveTips: boolean | undefined;
		receiveReminders: boolean | undefined;
		receiveProgressUpdates: boolean | undefined;
		notificationTiming: string;
		notifyEmail: boolean | undefined;
		notifyWeb: boolean | undefined;
	}

	type Schema = {
		habitGoals: habitGoal;
		performanceGoals: performanceGoal;
	};

	const db = init<Schema>({ appId: APP_ID });

	let goalType: 'performance' | 'habit' | undefined = $state(undefined);

	let goalCategory: { value: string; label: string } | undefined = $state(undefined);

	let customGoalCategory: string | undefined = $state(undefined);

	let target: string | undefined = $state(undefined);

	let frequency: { value: string; label: string } | undefined = $state(undefined);

	let timeFrame: DateValue | undefined = $state(undefined);

	let habitFrequency: { value: string; label: string } | undefined = $state(undefined);

	let duration: { value: string; label: string } | undefined = $state(undefined);

	let receiveTips: boolean | undefined = $state(undefined);

	let receiveReminders: boolean | undefined = $state(undefined);

	let receiveProgressUpdates: boolean | undefined = $state(undefined);

	let notificationTiming: { value: string; label: string } | undefined = $state(undefined);

	let notifyEmail: boolean | undefined = $state(undefined);

	let notifyWeb: boolean | undefined = $state(undefined);

	async function saveGoal(e: SubmitEvent) {
		e.preventDefault();

		if (goalType === 'habit') {
			await db.transact(
				tx.habitGoals[id()].update({
					type: 'habit',
					category: goalCategory?.value,
					target,
					frequency: habitFrequency?.value,
					duration: duration?.value,
					receiveTips,
					receiveReminders,
					receiveProgressUpdates,
					notificationTiming: notificationTiming?.value,
					notifyEmail,
					notifyWeb
				})
			);
		} else if (goalType === 'performance') {
			await db.transact(
				tx.performanceGoals[id()].update({
					type: 'performance',
					category: goalCategory?.value,
					frequency: frequency?.value,
					receiveTips,
					receiveReminders,
					receiveProgressUpdates,
					notificationTiming: notificationTiming?.value,
					notifyEmail,
					notifyWeb
				})
			);
		}
	}
</script>

<form class="mx-auto max-w-md space-y-6 rounded-lg p-6 shadow-md" onsubmit={saveGoal}>
	<h2 class="mb-4 text-2xl font-bold">Set your goal</h2>
	<div class="space-y-2">
		<Label>Choose Goal Type</Label>
		<RadioGroup.Root bind:value={goalType}>
			<div class="flex items-center space-x-2">
				<RadioGroup.Item value="performance" id="performance" />
				<Label for="performance">Performace Based</Label>
			</div>
			<div class="flex items-center space-x-2">
				<RadioGroup.Item value="habit" id="habit" />
				<Label for="habit">Habit Based</Label>
			</div>
		</RadioGroup.Root>
		{#if goalType}
			<div class="space-y-2">
				<Label>Choose Goal Category</Label>
				<Select.Root bind:selected={goalCategory}>
					<Select.Trigger>
						<Select.Value placeholder="Select Category" />
					</Select.Trigger>
					<Select.Content>
						<Select.Label>Categories</Select.Label>
						<Select.Item value="Strength">Strength</Select.Item>
						<Select.Item value="Endurance">Endurance</Select.Item>
						<Select.Item value="Flexibility">Flexibility</Select.Item>
						<Select.Item value="Custom">Custom</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			{#if goalCategory?.value === 'Custom'}
				<Input type="text" placeholder="Enter custom category" bind:value={customGoalCategory} />
			{/if}
		{/if}
		{#if goalType === 'performance'}
			<div class="space-y-4">
				<div>
					<Label for="targetNumber">Target Number</Label>
					<Input
						id="targetNumber"
						type="text"
						placeholder="e.g., run 5 miles, 200 lbs squat"
						bind:value={target}
					/>
				</div>
				<div>
					<Label for="frequency">Frequency</Label>
					<Select.Root bind:selected={frequency}>
						<Select.Trigger>
							<Select.Value placeholder="Select frequency" />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="once">Once</Select.Item>
							<Select.Item value="daily">Daily</Select.Item>
							<Select.Item value="weekly">Weekly</Select.Item>
							<Select.Item value="monthly">Monthly</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				<div>
					<Label for="timeFrame">Time Frame</Label>
					<Input id="timeFrame" type="date" bind:value={timeFrame} />
				</div>
			</div>
		{/if}
		{#if goalType === 'habit'}
			<div class="space-y-4">
				<div>
					<Label for="habitFrequency">Frequency</Label>
					<Select.Root bind:selected={habitFrequency}>
						<Select.Trigger>
							<Select.Value placeholder="Select frequency" />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="daily">Daily</Select.Item>
							<Select.Item value="2-3 times per week">2-3 times per week</Select.Item>
							<Select.Item value="4-5 times per week">4-5 times per week</Select.Item>
							<Select.Item value="weekly">Weekly</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
			</div>
			<div>
				<Label for="habitDuration">Duration</Label>
				<Select.Root bind:selected={duration}>
					<Select.Trigger>
						<Select.Value placeholder="Select duration" />
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="1 month">1 month</Select.Item>
						<Select.Item value="3 months">3 months</Select.Item>
						<Select.Item value="6 months">6 months</Select.Item>
						<Select.Item value="1 year">1 year</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
		{/if}
	</div>
	<div class="space-y-4">
		<h3 class="text-lg font-semibold">Personalized Preferences</h3>
		<div class="flex items-center space-x-2">
			<Switch id="receiveTips" bind:checked={receiveTips} />
			<Label for="receiveTips">Receive tips</Label>
		</div>
		<div class="flex items-center space-x-2">
			<Switch id="receiveReminders" bind:checked={receiveReminders} />
			<Label for="receiveReminders">Receive reminders</Label>
		</div>
		<div class="flex items-center space-x-2">
			<Switch id="receiveProgressUpdates" bind:checked={receiveProgressUpdates} />
			<Label for="receiveProgressUpdates">Receive progress updates</Label>
		</div>

		<div class="space-y-2">
			<Label>Notification Channels</Label>
			<div class="space-y-2">
				<div class="flex items-center space-x-2">
					<Checkbox id="channelEmail" bind:checked={notifyEmail} />
					<Label for="channelEmail">Email</Label>
				</div>
				<div class="flex items-center space-x-2">
					<Checkbox id="channelWeb" bind:checked={notifyWeb} />
					<Label for="channelWeb">Web Notifications</Label>
				</div>
			</div>
		</div>

		<div>
			<Label for="notificationTiming">Notification Timing</Label>
			<Select.Root bind:selected={notificationTiming}>
				<Select.Trigger>
					<Select.Value placeholder="Select timing" />
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="morning">Morning</Select.Item>
					<Select.Item value="afternoon">Afternoon</Select.Item>
					<Select.Item value="evening">Evening</Select.Item>
					<Select.Item value="custom">Custom</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
	</div>

	<Button type="submit" class="w-full">Set Goal</Button>
</form>
