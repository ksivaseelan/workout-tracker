import { init } from '@instantdb/core';
import { PUBLIC_INSTANTDB_DEV_APP_ID, PUBLIC_INSTANTDB_PROD_APP_ID } from '$env/static/public';
import { dev } from '$app/environment';

const APP_ID = dev ? PUBLIC_INSTANTDB_DEV_APP_ID : PUBLIC_INSTANTDB_PROD_APP_ID;

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

export const db = init({ appId: APP_ID });
