import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { WasteCategoryService } from "./wasteCategory.service";

const createWasteCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await WasteCategoryService.createWasteCategory(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Waste Category created successfully",
    data: result,
  });
});

const getAllWasteCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await WasteCategoryService.getAllWasteCategories();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Waste Categories retrieved successfully",
    data: result,
  });
});

const getWasteCategoryById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await WasteCategoryService.getWasteCategoryById(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Waste Category retrieved successfully",
    data: result,
  });
});

const updateWasteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await WasteCategoryService.updateWasteCategory(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Waste Category updated successfully",
    data: result,
  });
});

const deleteWasteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await WasteCategoryService.deleteWasteCategory(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Waste Category deleted successfully",
    data: result,
  });
});

export const WasteCategoryController = {
  createWasteCategory,
  getAllWasteCategories,
  getWasteCategoryById,
  updateWasteCategory,
  deleteWasteCategory,
};
