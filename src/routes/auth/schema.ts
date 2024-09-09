import { object, string, email, pipe, length, nonEmpty } from 'valibot';

// Define outside the load function so the adapter can be cached
export const emailSchema = pipe(
	string(),
	nonEmpty('Please enter an email'),
	email('Your email is incorrectly formatted')
);

export const magicCodeSchema = object({
	email: pipe(
		string(),
		nonEmpty('Please enter an email'),
		email('Your email is incorrectly formatted')
	),
	magicCode: pipe(
		string(),
		nonEmpty('Please enter a magic code'),
		length(6, 'The magic code must be 6 characters long')
	)
});
