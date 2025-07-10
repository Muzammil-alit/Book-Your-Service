import { ClientRepository } from '../repositories/client.repository';
import { CustomError } from '../utils/CustomError';
import { handleServiceError } from '../utils/handleDBError';

const clientRepository = new ClientRepository();

interface ClientUpdateParams {
  firstName: string;
  lastName: string;
  emailID: string;
  phoneNumber: string;
  active: boolean;
  changePassword: boolean;
  password?: string;
  updatedOn?: Date;
}

export class ClientService {
  async getClientList(clientID?: number): Promise<any> {
    try {
      return await clientRepository.getClientList(clientID);
    } catch (error: any) {
      handleServiceError(error, 'fetch client');
    }
  }

  async getClientByID(clientID: number): Promise<any> {
    try {
      if (!clientID || isNaN(clientID)) {
        throw CustomError.validationError('Client ID is required');
      }
      return await clientRepository.getClientById(clientID);
    } catch (error: any) {
      handleServiceError(error, 'fetch client');
    }
  }

  async updateClient(
    clientID: number,
    data: ClientUpdateParams,
    loggedInUserID: any,
  ): Promise<any> {
    try {
      // Validate input
      if (!clientID || isNaN(clientID)) {
        throw CustomError.validationError('Client ID is required');
      }

      if (!data.firstName || !data.lastName || !data.emailID) {
        throw CustomError.validationError('First name, last name, and email are required');
      }

      if (data.changePassword && !data.password) {
        throw CustomError.validationError('Password is required when changing password');
      }

      if (data.password && data.password.length < 8) {
        throw CustomError.validationError('Password must be at least 8 characters');
      }

      return await clientRepository.updateClient(clientID, data, parseInt(loggedInUserID));
    } catch (error: any) {
      handleServiceError(error, 'update client');
    }
  }
}
