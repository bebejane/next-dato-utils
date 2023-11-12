'use server';
import { revalidateTag as rt, revalidatePath as rp } from 'next/cache';
export async function revalidateTag(tag) {
    return rt(tag);
}
export async function revalidatePath(path) {
    return rp(path);
}
//# sourceMappingURL=revalidate.js.map