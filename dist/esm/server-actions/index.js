'use server';
import { draftMode } from 'next/headers.js';
import { redirect } from 'next/navigation.js';
import { revalidateTag as rt, revalidatePath as rp } from 'next/cache.js';
export async function disableDraftMode(pathname) {
    console.log('disableDraftMode', pathname);
    draftMode().disable();
    redirect(pathname ?? `/`);
}
export async function revalidateTag(tag) {
    return rt(tag);
}
export async function revalidatePath(path) {
    return rp(path);
}
//# sourceMappingURL=index.js.map