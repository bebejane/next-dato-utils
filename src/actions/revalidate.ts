'use server';

import { revalidateTag as rt, revalidatePath as rp } from 'next/cache'

export async function revalidateTag(tag: string) {
  return rt(tag)
}

export async function revalidatePath(path: string) {
  return rp(path)
}