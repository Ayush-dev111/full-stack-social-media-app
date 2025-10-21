"use server";

import { auth } from "@clerk/nextjs/server";
import {prisma} from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getDbUserId } from "./user.action";

export async function getProfileByUsername(username: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username: username },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        image: true,
        location: true,
        website: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw new Error("Failed to fetch profile");
  }
}

export async function getUserPosts(userId: string) {
  return await prisma.post.findMany({
    where: { authorId: userId },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
          clerkId: true, 
        },
      },
      comments: {
        include: {
          author: {
            select: {
              id: true,
              username: true,
              name: true,
              image: true,
              clerkId: true, 
            },
          },
        },
      },
      likes: true,
      _count: true,
    },
    orderBy: { createdAt: "desc" },
  });
}


export async function getUserLikedPosts(userId: string) {
  return await prisma.post.findMany({
    where: { likes: { some: { userId } } },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
          clerkId: true, 
        },
      },
      comments: {
        include: {
          author: {
            select: {
              id: true,
              username: true,
              name: true,
              image: true,
              clerkId: true, 
            },
          },
        },
      },
      likes: true,
      _count: true,
    },
    orderBy: { createdAt: "desc" },
  });
}


export async function updateProfile(formData: FormData) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const location = formData.get("location") as string;
    const website = formData.get("website") as string;

    const user = await prisma.user.update({
      where: { clerkId },
      data: {
        name,
        bio,
        location,
        website,
      },
    });

    revalidatePath(`/profile/${user.username}`);
    return { success: true, user };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function isFollowing(userId: string) {
  try {
    const currentUserId = await getDbUserId();
    if (!currentUserId) return false;

    const follow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userId,
        },
      },
    });

    return !!follow;
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
}