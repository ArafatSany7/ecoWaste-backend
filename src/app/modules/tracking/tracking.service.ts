import type { RequestStatus } from "@prisma/client";
import AppError from "../../errors/AppError";
import prisma from "../../lib/prisma";
import { estimateEta, STALE_AFTER_MS } from "./tracking.utils";

/** Statuses during which the collector is on a trip and may share / expose their position. */
export const LIVE_STATUSES: RequestStatus[] = ["EN_ROUTE", "COLLECTOR_ARRIVED"];

/** Suggested polling interval for clients, in seconds. */
const POLL_LIVE_S = 5;
const POLL_IDLE_S = 30;

export interface LocationPayload {
	latitude: number;
	longitude: number;
	heading?: number;
	speed?: number;
	accuracy?: number;
	recordedAt?: string;
}

/**
 * Store the collector's latest GPS fix. Only accepted while they have an active trip, so a
 * collector's location is never recorded outside of a job.
 */
const updateCollectorLocation = async (
	collectorUserId: string,
	payload: LocationPayload,
) => {
	const activeTrip = await prisma.wasteRequest.findFirst({
		where: {
			assignedCollectorId: collectorUserId,
			status: { in: LIVE_STATUSES },
			isDeleted: false,
		},
		select: { id: true },
	});

	if (!activeTrip) {
		throw new AppError(
			409,
			"Location sharing is only allowed during an active trip",
		);
	}

	const recordedAt = payload.recordedAt
		? new Date(payload.recordedAt)
		: new Date();
	// Never trust a client clock that is ahead of the server.
	const lastLocationAt =
		recordedAt.getTime() > Date.now() ? new Date() : recordedAt;

	await prisma.collectorProfile.update({
		where: { userId: collectorUserId },
		data: {
			lastLatitude: payload.latitude,
			lastLongitude: payload.longitude,
			lastHeading: payload.heading ?? null,
			lastSpeed: payload.speed ?? null,
			lastAccuracy: payload.accuracy ?? null,
			lastLocationAt,
		},
	});

	return { requestId: activeTrip.id, recordedAt: lastLocationAt };
};

/**
 * Live tracking view of one request. Readable by the requesting citizen, the assigned
 * collector and admins. The collector's position is only included while the trip is live.
 */
const getRequestTracking = async (
	requestId: string,
	user: { userId: string; role: string },
) => {
	const request = await prisma.wasteRequest.findUnique({
		where: { id: requestId },
		include: {
			assignedCollector: true,
			collectionSchedule: true,
		},
	});

	if (!request || request.isDeleted) {
		throw new AppError(404, "Waste Request not found");
	}

	const isOwner = user.role === "CITIZEN" && request.citizenId === user.userId;
	const isAssignedCollector =
		user.role === "COLLECTOR" && request.assignedCollectorId === user.userId;
	if (user.role !== "ADMIN" && !isOwner && !isAssignedCollector) {
		throw new AppError(403, "You do not have permission to track this request");
	}

	const isLive = LIVE_STATUSES.includes(request.status);
	const destination =
		request.latitude != null && request.longitude != null
			? { latitude: request.latitude, longitude: request.longitude }
			: null;

	const c = request.assignedCollector;
	const hasFix =
		isLive &&
		c?.lastLatitude != null &&
		c?.lastLongitude != null &&
		c?.lastLocationAt != null;
	const location = hasFix
		? {
				latitude: c.lastLatitude as number,
				longitude: c.lastLongitude as number,
				heading: c.lastHeading,
				speed: c.lastSpeed,
				accuracy: c.lastAccuracy,
				updatedAt: c.lastLocationAt as Date,
				stale:
					Date.now() - (c.lastLocationAt as Date).getTime() > STALE_AFTER_MS,
			}
		: null;

	const eta =
		location && destination && request.status === "EN_ROUTE"
			? estimateEta(
					location.latitude,
					location.longitude,
					destination.latitude,
					destination.longitude,
				)
			: null;

	return {
		requestId: request.id,
		status: request.status,
		address: request.address,
		rejectionReason: request.rejectionReason,
		destination,
		tripStartedAt: request.tripStartedAt,
		schedule: request.collectionSchedule
			? {
					scheduledDate: request.collectionSchedule.scheduledDate,
					timeWindow: request.collectionSchedule.timeWindow,
				}
			: null,
		isLive,
		// Only the first name is shared with citizens.
		collector: c ? { firstName: c.firstName, location } : null,
		eta,
		pollAfterSeconds: isLive ? POLL_LIVE_S : POLL_IDLE_S,
	};
};

export const TrackingService = {
	updateCollectorLocation,
	getRequestTracking,
};
