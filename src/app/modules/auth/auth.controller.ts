import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthService } from "./auth.service";

import config from "../../config";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.registerUser(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken, ...result } = await AuthService.loginUser(req.body);

  res.cookie("refreshToken", refreshToken, {
    secure: config.env === "production",
    httpOnly: true,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  const result = await AuthService.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Access token retrieved successfully",
    data: result,
  });
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("refreshToken");

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User logged out successfully",
    data: null,
  });
});

const initiateGoogleLogin = catchAsync(async (req: Request, res: Response) => {
  const clientId = config.google.client_id;
  const redirectUri = config.google.callback_url || `http://localhost:${config.port}/api/v1/auth/google/callback`;

  if (!clientId) {
    throw new Error("Google Client ID is not configured in environment variables");
  }

  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: redirectUri as string,
    client_id: clientId as string,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };

  const qs = new URLSearchParams(options);

  const GoogleUrl = `${rootUrl}?${qs.toString()}`;

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Google login initiated. Visit the GoogleUrl in a browser to authenticate with Google.",
    data: {
      GoogleUrl,
    },
  });
});

const googleCallback = catchAsync(async (req: Request, res: Response) => {
  const code = req.query.code as string;

  if (!code) {
    throw new Error("Authorization code not provided by Google");
  }

  const clientId = config.google.client_id;
  const clientSecret = config.google.client_secret;
  const redirectUri = config.google.callback_url || `http://localhost:${config.port}/api/v1/auth/google/callback`;

  if (!clientId || !clientSecret) {
    throw new Error("Google credentials are not configured in environment variables");
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId as string,
      client_secret: clientSecret as string,
      redirect_uri: redirectUri as string,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    throw new Error(tokenData.error_description || "Failed to fetch Google OAuth tokens");
  }


  const userResponse = await fetch("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  const googleUser = await userResponse.json();

  if (!userResponse.ok) {
    throw new Error("Failed to fetch Google user profile");
  }


  const { refreshToken, ...result } = await AuthService.googleLogin({
    email: googleUser.email,
    firstName: googleUser.given_name || "Google",
    lastName: googleUser.family_name || "",
  });

  res.cookie("refreshToken", refreshToken, {
    secure: config.env === "production",
    httpOnly: true,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Google login successful",
    data: result,
  });
});

const loginWithGoogleIdToken = catchAsync(async (req: Request, res: Response) => {
  const { idToken } = req.body;


  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
  const googleUser = await response.json();

  if (!response.ok) {
    throw new Error(googleUser.error_description || "Invalid Google ID Token");
  }

  if (!googleUser.email) {
    throw new Error("Google ID Token does not contain an email address");
  }

  const { refreshToken, ...result } = await AuthService.googleLogin({
    email: googleUser.email,
    firstName: googleUser.given_name || "Google",
    lastName: googleUser.family_name || "",
  });

  res.cookie("refreshToken", refreshToken, {
    secure: config.env === "production",
    httpOnly: true,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Google login successful",
    data: result,
  });
});

export const AuthController = {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  initiateGoogleLogin,
  googleCallback,
  loginWithGoogleIdToken,
};
