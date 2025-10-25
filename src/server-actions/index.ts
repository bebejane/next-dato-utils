'use server';

import { draftMode } from 'next/headers.js';
import { redirect } from 'next/navigation.js';
import { revalidateTag as rt, revalidatePath as rp } from 'next/cache.js';

export async function disableDraftMode(pathname?: string) {
	(await draftMode()).disable();
	redirect(pathname ?? `/`);
}

export async function revalidateTag(tag: string | string[]): Promise<void> {
	Array.isArray(tag) ? tag.forEach((t) => rt(t)) : rt(tag);
}

export async function revalidatePath(path: string | string[]): Promise<void> {
	Array.isArray(path) ? path.forEach((p) => rp(p)) : rp(path);
}
