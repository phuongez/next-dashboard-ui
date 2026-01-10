import { prisma } from "@/lib/prisma";

export async function getUnreadAnnouncementCount({
  role,
  classIds,
}: {
  role: string;
  classIds?: number[];
}) {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  return prisma.announcement.count({
    where: {
      date: {
        gte: threeDaysAgo,
      },
      OR: [
        { classId: null }, // toàn trường
        ...(classIds?.length ? [{ classId: { in: classIds } }] : []),
      ],
    },
  });
}
