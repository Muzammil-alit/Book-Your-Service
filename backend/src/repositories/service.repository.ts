import sql = require('mssql');
import { executeStoredProcedure, toNestedData, toSqlTime7 } from '../utils/ExecuteProcedureFn';
import { handleRepositoryError } from '../utils/handleDBError';
import { eModuleName } from '../utils/dbConstraintMap';

interface ServiceDuration {
  duration: any;
  startTime: string;
  endTime: string;
}

interface ServiceData {
  serviceName: string;
  descr: string;
  serviceDurationType: number;
  active: boolean;
  durations: ServiceDuration[];
  updatedOn?: Date;
}

export class ServiceRepository {
  async createUpdate(
    data: ServiceData,
    operatingUserID: number,
    serviceID?: number,
  ): Promise<number> {
    const params = {
      ServiceID: serviceID ?? null,
      ServiceName: data.serviceName,
      Descr: data.descr,
      ServiceDurationType: data.serviceDurationType,
      Active: data.active,
      UpdatedOn: data.updatedOn ?? null,
      OperatingUserID: operatingUserID,
    };

    const tvps = {
      ServiceDurations: {
        typeName: 'ServiceDurationTableType',
        columns: [
          { name: 'Duration', type: sql.Int },
          { name: 'ShiftStartTime', type: sql.Time(7) },
          { name: 'ShiftEndTime', type: sql.Time(7) },
        ],
        rows: data.durations.map((d) => [
          parseInt(d.duration),
          toSqlTime7(d.startTime),
          toSqlTime7(d.endTime),
        ]),
      },
    };

    try {
      const result = await executeStoredProcedure('InsertUpdateService', params, tvps);
      return result[0]?.ServiceID;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.service);
      throw error;
    }
  }

  async get(serviceID?: number): Promise<any[]> {
    const params = { ServiceID: serviceID ?? null };
    try {
      const results = await executeStoredProcedure('GetServiceList', params);
      return results;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.service);
      throw error;
    }
  }

  async getLookupList(): Promise<any[]> {
    try {
      const results = await executeStoredProcedure('GetServiceLookupList', {});
      return results;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.service);
      throw error;
    }
  }

  async delete(serviceID: number): Promise<void> {
    const params = { ServiceID: serviceID };
    try {
      await executeStoredProcedure('DeleteService', params);
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.service);
    }
  }

  async getServiceByID(serviceID: number): Promise<any> {
    const params = { serviceID };
    try {
      // Need nested data for service durations
      const results = await executeStoredProcedure('GetServiceByID', params, {}, {}, true);
      return toNestedData(results);
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.service);
    }
  }

  async getServiceCarers(serviceID: number): Promise<any> {
    const params = { serviceID };
    try {
      const results = await executeStoredProcedure('GetAssignedCarersByServiceID', params);
      return results;
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.service);
    }
  }

  async updateServiceCarers(serviceID: number, carerIDs: any): Promise<any> {
    try {
      const carersTable = new sql.Table();
      carersTable.columns.add('ID', sql.Int);

      // Add each service ID as a row
      carerIDs.forEach((id) => {
        carersTable.rows.add(id);
      });

      await executeStoredProcedure('AssignCarersToService', { serviceID, carerIDs: carersTable });
    } catch (error: any) {
      handleRepositoryError(error, eModuleName.service);
    }
  }
}
