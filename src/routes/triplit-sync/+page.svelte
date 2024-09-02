<script lang="ts">
	import { useQuery } from '@triplit/svelte';
	import { triplit } from '@/triplit/client';

	const exercises = $derived(
		useQuery(triplit, triplit.query('exercises').include('sets').order('date', 'DESC'))
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

	$inspect(exercisesArray);
</script>

<h1>Testing sync</h1>
