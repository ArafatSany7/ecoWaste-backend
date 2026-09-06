import express from "express";
import auth from "../../middlewares/auth";
import { InvoiceController } from "./invoice.controller";

const router = express.Router();

router.get("/my-invoices", auth("CITIZEN"), InvoiceController.getMyInvoices);

export const InvoiceRoutes = router;
