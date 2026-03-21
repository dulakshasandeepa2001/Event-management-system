import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createBatch,
  listBatches,
  getBatch,
  updateBatch,
  deactivateBatch,
  activateBatch,
  deleteBatch,
  exportActivationCodes
} from "../controllers/batchController.js";

import { uploadExcel } from "../controllers/excelController.js";

const router = express.Router();
router.use(protect);

// CRUD
router.post("/", createBatch);
router.get("/", listBatches);
router.get("/:id", getBatch);
router.put("/:id", updateBatch);

// Activation codes export
router.get("/activation-codes", exportActivationCodes);
router.get("/:id/activation-codes", exportActivationCodes);

// Soft deactivate / optional activate
router.patch("/:id/deactivate", deactivateBatch);
router.patch("/:id/activate", activateBatch);

// Hard delete (only when deactivated)
router.delete("/:id", deleteBatch);

// Excel upload
router.post("/:id/upload-excel", uploadExcel);

export default router;