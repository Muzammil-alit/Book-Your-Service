import { Request, Response, NextFunction } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

export function validateDto<T>(dtoClass: new () => T) {
  return async function (req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Convert request body to DTO instance
      const dtoInstance = plainToInstance(dtoClass, req.body);
      // Validate the DTO instance
      const errors = await validate(dtoInstance!);
      if (errors.length > 0) {
        res.status(400).json({
          message: "Validation failed",
          errors: errors.map(error => error.constraints),
        });
        return;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
