import { eModuleName } from '../utils/dbConstraintMap';
import { executeStoredProcedure } from '../utils/ExecuteProcedureFn';
import { handleRepositoryError } from '../utils/handleDBError';

interface ClientUpdateData {
  firstName: string;
  lastName: string;
  emailID: string;
  phoneNumber: string;
  active: boolean;
  changePassword: boolean;
  password?: string;
  updatedOn?: Date | null;
}

export class ClientRepository {
  async getClientList(clientID?: number): Promise<any[]> {
    try {
      const result = await executeStoredProcedure('GetClientList', { clientID });
      return result || [];
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.client);
      return [];
    }
  }

  async getClientById(clientID: number): Promise<any> {
    try {
      const result = await executeStoredProcedure('GetClientByID', { clientID });
      const client = result?.[0]?.Client || result?.[0];
      return client;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.client);
    }
  }

  async updateClient(
    clientID: number,
    data: ClientUpdateData,
    operatingUserID: number,
  ): Promise<any> {
    try {
      const result = await executeStoredProcedure('ClientUpdate', {
        clientID,
        firstName: data.firstName,
        lastName: data.lastName,
        emailID: data.emailID,
        phoneNo: data.phoneNumber,
        active: data.active,
        updatePassword: data.changePassword,
        password: data.password ?? null,
        operatingUserID,
        updatedOn: data.updatedOn ?? null,
      });

      return result?.[0];
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.client);
    }
  }
}
