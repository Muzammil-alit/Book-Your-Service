import { CustomError } from './CustomError';
import {
  ckConstraintList,
  eModuleName,
  fkConstraintList,
  ukConstraintMessageMap,
} from './dbConstraintMap';

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatEnumKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2') // insert space before uppercase letters
    .replace(/^./, (s) => s.toUpperCase()); // capitalize first letter
}

// Repository layer error handler
export const handleRepositoryError = (
  error: any,
  context: any,
  customMessage: string = '',
): never => {
  // Re-throw if already a CustomError
  if (error instanceof CustomError) {
    throw error;
  }

  if (customMessage) {
    throw CustomError.badRequest(capitalize(customMessage));
  }

  const message = error.message?.toLowerCase() || '';
  const contextString = formatEnumKey(eModuleName[context]);
  // Handle specific database errors
  // For Foreign Key
  const matchedFK = fkConstraintList.find((fk) => message.includes(fk.toLowerCase()));
  if (matchedFK) {
    throw CustomError.badRequest(
      `Action couldn't be completed because related information is missing or in use elsewhere.`,
    );
  }
  // For Unique Key

  const matchedUK = Object.keys(ukConstraintMessageMap).find((uk) =>
    message.toLowerCase().includes(uk.toLowerCase()),
  );

  if (matchedUK) {
    const errorMsg = ukConstraintMessageMap[matchedUK];
    throw CustomError.badRequest(errorMsg);
  }

  // For Check Key
  const matchedCK = ckConstraintList.find((ck) => message.includes(ck.toLowerCase()));
  if (matchedCK) {
    throw CustomError.badRequest(capitalize(customMessage));
  }

  if (message.includes('record not found') || message.includes('not found')) {
    throw CustomError.badRequest(`${contextString} not found.`);
  }

  if (message.includes('Record already modified by another user.')) {
    throw CustomError.conflict(capitalize(message));
  }

  if (message.includes('validation')) {
    throw CustomError.validationError(`Invalid ${contextString} data.`);
  }

  if (message) {
    throw CustomError.badRequest(capitalize(message));
  }

  // Default error
  throw CustomError.internal(`Operation failed for ${contextString}.`);
};

// Service layer error handler
export const handleServiceError = (error: any, operation: string): never => {
  if (error instanceof CustomError) {
    throw error;
  }

  throw CustomError.internal(`Failed to ${operation}.`);
};
