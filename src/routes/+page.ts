import { goto } from '$app/navigation';

export function load({}) {
	goto('/auth');
}
export const ssr = false;
