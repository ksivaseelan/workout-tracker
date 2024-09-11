<script lang="ts">
	import { goto } from '$app/navigation';

	//UI
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { cn } from '$lib/utils';

	//InstantDB
	import { type User, init } from '@instantdb/core';

	//valibot
	import { object, string, email, pipe, length, nonEmpty } from 'valibot';

	import * as v from 'valibot';

	const APP_ID = 'efdf7751-de2d-41d2-954c-4b89523fb652';

	const db = init({ appId: APP_ID });

	let emailInput = $state('');

	let codeInput = $state('');

	let isMagicCodeSent = $state(false);

	let isLoggedin = $state(false);

	let error: string | null = $state(null);

	let user: User | null = $state(null);

	$effect(() => {
		db.subscribeAuth((auth) => {
			if (auth.user) {
				isLoggedin = true;
				user = auth.user;
				goto('/app/home');
			} else if (auth.error) {
				error = auth.error.message;
			}
		});
	});

	async function sendCode() {
		try {
			isMagicCodeSent = true;
			await db.auth.sendMagicCode({ email: emailInput });
		} catch (e: any) {
			error = e.body?.message;
			console.log('Error sending magic code:', e);
		}
	}

	async function signIn() {
		try {
			await db.auth.signInWithMagicCode({ email: emailInput, code: codeInput });
		} catch (e: any) {
			error = e.body?.message;
			console.log('Error signing in:', e);
		}
	}

	function validateEmail() {
		const emailSchema = pipe(string(), nonEmpty('Email is required'), email('Email is not valid'));
		return v.safeParse(emailSchema, emailInput);
	}

	function validateCode() {
		const codeSchema = pipe(
			string(),
			nonEmpty('Verification code is required'),
			length(6, 'Verification code must be 6 characters long')
		);
		return v.safeParse(codeSchema, codeInput);
	}
</script>

<div class="md:ml-16">
	<Card.Root class="w-full max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl">Login</Card.Title>
			<Card.Description>
				Enter your email to receive a verification code.
				<br />
				An account will be created if you don't have one.
			</Card.Description>
		</Card.Header>
		<Card.Content class="grid gap-4">
			<div class="grid gap-2">
				<Label for="email" class={cn({ 'text-destructive': !validateEmail().success })}>
					Email
				</Label>
				<Input
					id="email"
					class={cn({ 'border-destructive': !validateEmail().success })}
					bind:value={emailInput}
					type="email"
					placeholder="a@example.com"
					required
				/>
			</div>
			{#if isMagicCodeSent}
				<div class="grid gap-2">
					<Label for="magicCode" class={cn({ 'text-destructive': !validateCode().success })}>
						Verification Code
					</Label>
					<Input
						id="magicCode"
						class={cn({ 'border-destructive': !validateCode().success })}
						bind:value={codeInput}
					/>
				</div>
			{/if}
			{#if !validateEmail().success}
				<div class="text-sm font-medium text-destructive">
					{validateEmail().issues?.[0].message}
				</div>
			{/if}
			{#if !validateCode().success && isMagicCodeSent}
				<div class="text-sm font-medium text-destructive">
					{validateCode().issues?.[0].message}
				</div>
			{/if}
		</Card.Content>
		<Card.Footer>
			{#if isMagicCodeSent}
				<Button disabled={!validateCode().success} class="w-full" onclick={signIn}>Sign In</Button>
			{:else}
				<Button disabled={!validateEmail().success} class="w-full" onclick={sendCode}>
					Send Code
				</Button>
			{/if}
		</Card.Footer>
	</Card.Root>

	{#if isLoggedin}
		<div>Logged in as {user?.email}</div>
	{/if}

	<button
		onclick={() => {
			db.auth.signOut();
		}}
		id="sign-out-button">Sign out</button
	>
</div>
