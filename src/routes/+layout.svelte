<script lang="ts">
	import '../app.css';
	import { Dumbbell, PanelLeft, Home } from 'lucide-svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';
</script>

<div class="min-h-screen w-full flex flex-col bg-muted/20 p-4">
	<aside class="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
		<!-- Sidebar component for desktop -->
		<nav class="flex flex-col items-center gap-4 px-2 sm:py-5">
			<a
				href="/"
				class="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
			>
				<Home class="h-4 w-4 transition-all group-hover:scale-110" />
				<span class="sr-only">Go Home</span>
			</a>
			<Tooltip.Root>
				<Tooltip.Trigger asChild let:builder>
					<a
						href="/app/instantdb-workout"
						class="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
					>
						<Dumbbell class="h-5 w-5" />
						<span class="sr-only">Track Workouts</span>
					</a>
				</Tooltip.Trigger>
				<Tooltip.Content side="right">Track Workouts</Tooltip.Content>
			</Tooltip.Root>
		</nav>
	</aside>
	<div class="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
		<header
			class="sm:border:0 sticky top-0 z-10 flex h-14 w-full items-center gap-4 border-b bg-background px-4 py-4 sm:static sm:h-auto sm:bg-transparent"
		>

			<!-- Mobile menu  -->
			<Sheet.Root>
				<Sheet.Trigger asChild let:builder>
					<Button builders={[builder]} size="icon" variant="outline" class="sm:hidden">
						<PanelLeft class="h-5 w-5" />
						<span class="sr-only">Toggle Menu</span>
					</Button>
				</Sheet.Trigger>
				<Sheet.Content side="left" class="sm:max-w-xs">
					<nav class="grid gap-6 text-lg font-medium">
						<a
							href="/"
							class="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
						>
							<Home class="h-5 w-5 transition-all group-hover:scale-110" />
							<span class="sr-only">Home</span>
						</a>
						<a
							href="/app/instantdb-workout"
							class="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
						>
							<Dumbbell class="h-5 w-5" />
							Track Workouts
						</a>
					</nav>
				</Sheet.Content>
			</Sheet.Root>

			<h1 class="text-2xl font-bold">Workout Tracker</h1>
		</header>
	</div>
	<main class="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
		<slot></slot>
	</main>
</div>
