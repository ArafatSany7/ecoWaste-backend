import crypto from "node:crypto";
import config from "../../config";
import AppError from "../../errors/AppError";

export const PROOF_FOLDER = "ecowaste/proofs";

const createProofUploadSignature = () => {
	const { cloud_name, api_key, api_secret } = config.cloudinary;
	if (!cloud_name || !api_key || !api_secret) {
		throw new AppError(503, "Photo upload isn't configured on the server");
	}
	const timestamp = Math.floor(Date.now() / 1000);
	const toSign = `folder=${PROOF_FOLDER}&timestamp=${timestamp}`;
	const signature = crypto
		.createHash("sha1")
		.update(toSign + api_secret)
		.digest("hex");
	return {
		cloudName: cloud_name,
		apiKey: api_key,
		folder: PROOF_FOLDER,
		timestamp,
		signature,
	};
};

const isProofPhotoUrl = (url: string) => {
	const cloud = config.cloudinary.cloud_name;
	if (!cloud) return false;
	try {
		const u = new URL(url);
		return (
			u.protocol === "https:" &&
			u.hostname === "res.cloudinary.com" &&
			u.pathname.startsWith(`/${cloud}/image/upload/`) &&
			u.pathname.includes(`/${PROOF_FOLDER}/`)
		);
	} catch {
		return false;
	}
};

export const UploadService = {
	createProofUploadSignature,
	isProofPhotoUrl,
};
