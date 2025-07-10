import multer from "multer";
import { Request } from "express";

// Validate file type
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ["image/jpeg", "image/png"];
  if (!allowedTypes.includes(file.mimetype)) {
    cb(new Error("Only JPG and PNG files are allowed"));
  } else {
    cb(null, true);
  }
};

// Configure Multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(), // Store in memory before saving to DB
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter, // Validate file type
});

export default upload;
