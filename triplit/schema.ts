import { Schema as S, type ClientSchema, type Entity } from '@triplit/client';

export const schema = {
	exercises: {
		schema: S.Schema({
			id: S.Id(),
			name: S.String(),
			sets: S.Optional(S.RelationMany('sets', { where: [['exercise_id', '=', '$id']] })),
			date: S.Date(),
			updatedAt: S.Date({ default: S.Default.now() })
		})
	},
	sets: {
		schema: S.Schema({
			id: S.Id(),
			reps: S.String(),
			weight: S.String(),
			completed: S.Boolean(),
			exercise_id: S.String(),
			exercise: S.RelationById('exercises', '$exercise_id'),
			createdAt: S.Date({ default: S.Default.now() }),
		})
	}
} satisfies ClientSchema;

//Entity type for typescript
export type Exercise = Entity<typeof schema, 'exercises'>;
export type Set = Entity<typeof schema, 'sets'>;
