import { executeStoredProcedure } from '../utils/ExecuteProcedureFn';
import sql from 'mssql';
import { handleRepositoryError } from '../utils/handleDBError';
import { eModuleName } from '../utils/dbConstraintMap';

export class CarerRepository {
  async create(data: any): Promise<any> {
    try {
      const specialTypes: Record<string, { type: any; value: any }> = {};
      specialTypes.profilePic = {
        type: sql.VarBinary,
        value: data.profilePic,
      };
      const result = await executeStoredProcedure(
        'CarerInsert',
        {
          firstName: data.firstName,
          lastName: data.lastName,
          emailID: data.emailID,
          password: data.password,
          descr: data.descr,
          color: data.color,
          active: data.active,
          operatingUserID: data.createdBy,
        },
        {},
        specialTypes,
      );
      return result;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.carer);
    }
  }

  async getAll(_loggedInUserID: number): Promise<any> {
    try {
      const result = await executeStoredProcedure('GetCarerList', {});
      return result;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.carer);
    }
  }

  async getLookupList(_loggedInUserID: number): Promise<any> {
    try {
      const result = await executeStoredProcedure('GetCarerLookupList', {});
      return result;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.carer);
    }
  }

  async getById(carerID: number): Promise<any> {
    try {
      const result = await executeStoredProcedure('GetCarerByID', { carerID });
      return result?.[0];
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.carer);
    }
  }

  async update(carerID: number, updatedData: any): Promise<any> {
    const params = {
      carerID,
      firstName: updatedData.firstName,
      lastName: updatedData.lastName,
      emailID: updatedData.emailID,
      descr: updatedData.descr,
      color: updatedData.color || '#000000',
      active: updatedData.active,
      updatePassword: updatedData.updatePassword,
      password: updatedData.password ?? null,
      updateProfilePic: updatedData.updateProfilePic,
      operatingUserID: updatedData.createdBy,
      updatedOn: updatedData.updatedOn ?? null,
    };
    const specialTypes: Record<string, { type: any; value: any }> = {};
    specialTypes.profilePic = {
      type: sql.VarBinary,
      value: updatedData.profilePic,
    };
    try {
      const result = await executeStoredProcedure('CarerUpdate', params, {}, specialTypes);
      return result;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.carer);
    }
  }

  async getCarerServices(carerID: number): Promise<any> {
    try {
      const results = await executeStoredProcedure('GetAssignedServicesByCarerID', { carerID });
      return results;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.carer);
    }
  }

  async updateCarerServices(carerID: number, serviceIDs: any): Promise<any> {
    try {
      const servicesTable = new sql.Table();
      servicesTable.columns.add('ID', sql.Int);

      // Add each service ID as a row
      serviceIDs.forEach((id) => {
        servicesTable.rows.add(id);
      });

      await executeStoredProcedure('AssignServicesToCarer', { carerID, serviceIDs: servicesTable });
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.carer);
    }
  }

  async delete(carerID: number): Promise<any> {
    try {
      const result = await executeStoredProcedure('CarerDelete', { carerID });
      return result;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.carer);
    }
  }
}
