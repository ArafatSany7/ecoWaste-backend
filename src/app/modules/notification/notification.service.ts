import type { Prisma } from "@prisma/client";
import AppError from "../../errors/AppError";
import prisma from "../../lib/prisma";

type Db = Prisma.TransactionClient | typeof prisma;

export interface NotificationInput {
	title: string;
	body: string;
	link?: string;
}

const notify = async (
	db: Db,
	userIds: (string | null | undefined)[],
	input: NotificationInput,
) => {
	const ids = [...new Set(userIds.filter((id): id is string => !!id))];
	if (ids.length === 0) return;
	await db.notification.createMany({
		data: ids.map((userId) => ({
			userId,
			title: input.title,
			body: input.body,
			link: input.link ?? null,
		})),
	});
};

const notifyAdmins = async (db: Db, input: NotificationInput) => {
	const admins = await db.user.findMany({
		where: { role: "ADMIN", isDeleted: false, status: "ACTIVE" },
		select: { id: true },
	});
	await notify(
		db,
		admins.map((a) => a.id),
		input,
	);
};

const getMyNotifications = async (userId: string, limit = 20) => {
	const take = Math.min(Math.max(1, limit), 50);
	const [items, unreadCount] = await Promise.all([
		prisma.notification.findMany({
			where: { userId },
			orderBy: { createdAt: "desc" },
			take,
		}),
		prisma.notification.count({ where: { userId, readAt: null } }),
	]);
	return { items, unreadCount };
};

const markRead = async (userId: string, id: string) => {
	const result = await prisma.notification.updateMany({
		where: { id, userId, readAt: null },
		data: { readAt: new Date() },
	});
	if (result.count === 0) {
		const exists = await prisma.notification.findFirst({
			where: { id, userId },
			select: { id: true },
		});
		if (!exists) throw new AppError(404, "Notification not found");
	}
	return { id };
};

const markAllRead = async (userId: string) => {
	const result = await prisma.notification.updateMany({
		where: { userId, readAt: null },
		data: { readAt: new Date() },
	});
	return { updated: result.count };
};

export const NotificationService = {
	notify,
	notifyAdmins,
	getMyNotifications,
	markRead,
	markAllRead,
};
