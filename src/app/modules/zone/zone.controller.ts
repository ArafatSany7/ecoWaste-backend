import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ZoneService } from "./zone.service";

const createZone = catchAsync(async (req: Request, res: Response) => {
  const result = await ZoneService.createZone(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Service Zone created successfully",
    data: result,
  });
});

const getAllZones = catchAsync(async (req: Request, res: Response) => {
  const result = await ZoneService.getAllZones();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service Zones retrieved successfully",
    data: result,
  });
});

const getZoneById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ZoneService.getZoneById(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service Zone retrieved successfully",
    data: result,
  });
});

const updateZone = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ZoneService.updateZone(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service Zone updated successfully",
    data: result,
  });
});

const deleteZone = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ZoneService.deleteZone(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service Zone deleted successfully",
    data: result,
  });
});

export const ZoneController = {
  createZone,
  getAllZones,
  getZoneById,
  updateZone,
  deleteZone,
};
