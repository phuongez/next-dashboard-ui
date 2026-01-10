import { prisma } from "@/lib/prisma";

export async function getUnreadMessageCount(userId: string) {
  return prisma.message.count({
    where: {
      readAt: null,
      senderId: { not: userId },
      conversation: {
        OR: [{ teacherId: userId }, { parentId: userId }],
      },
    },
  });
}
