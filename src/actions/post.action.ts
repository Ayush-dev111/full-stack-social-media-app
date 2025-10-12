"use server";

import { prisma } from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export async function createPost(content: string, image: string) {
  const trimmedContent = content.trim();
  if (!trimmedContent && !image) {
    return { success: false, error: "Post must have content or an image" };
  }
  if (trimmedContent.length > 500) {
    return { success: false, error: "Content exceeds maximum length" };
  }

  if (image && !image.startsWith("http")) {
    return { success: false, error: "Invalid image URL" };
  }
  try {
    const userId = await getDbUserId();
    const post = await prisma.post.create({
      data: {
        content : trimmedContent,
        image,
        authorId: userId,
      },
    });
    revalidatePath("/");
    return { success: true, post };
  } catch (error) {
    console.error("Failed to create post:", error);
    return { success: false, error: "Failed to create post" };
  }
}
