'use server';
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidateTag as rt, revalidatePath as rp } from 'next/cache';
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