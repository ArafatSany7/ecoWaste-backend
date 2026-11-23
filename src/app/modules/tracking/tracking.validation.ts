import { z } from "zod";

export const latitudeSchema = z.number().min(-90).max(90);
export const longitudeSchema = z.number().min(-180).max(180);

const updateLocationSchema = z.object({
	body: z.object({
		latitude: latitudeSchema,
		longitude: longitudeSchema,
		heading: z.number().min(0).max(360).optional(),
		speed: z.number().min(0).max(100).optional(), // metres per second
		accuracy: z.number().min(0).optional(), // metres
		recordedAt: z.iso.datetime().optional(),
	}),
});

export const TrackingValidation = {
	updateLocationSchema,
};
