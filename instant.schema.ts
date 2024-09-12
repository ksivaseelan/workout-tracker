import { i } from '@instantdb/core';


const INSTANT_APP_ID = '3cbf9472-9151-4760-b68b-81926ba0cbad';

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
