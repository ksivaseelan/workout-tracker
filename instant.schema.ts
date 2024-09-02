import { i } from '@instantdb/core';

const INSTANT_APP_ID = 'efdf7751-de2d-41d2-954c-4b89523fb652';

const graph = i.graph(
	INSTANT_APP_ID,
	{
		exercises: i.entity({
			name: i.string(),
			createdAt: i.number(),
			date: i.string()
		}),
		sets: i.entity({
			weight: i.string(),
			reps: i.string(),
			completed: i.boolean(),
			createdAt: i.string()
		})
	},
	{
		exerciseSets: {
			forward: {
				on: 'exercises',
				has: 'many',
				label: 'sets'
			},
			reverse: {
				on: 'sets',
				has: 'one',
				label: 'exercises'
			}
		}
	}
);

export default graph;
