import { ServiceRepository } from '../repositories/service.repository';
import { CustomError } from '../utils/CustomError';
import { handleServiceError } from '../utils/handleDBError';

const serviceRepository = new ServiceRepository();

interface ServiceDuration {
  duration: number;
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

export class ServiceService {
  async createUpdate(data: ServiceData, loggedInUserID: any, serviceID?: number): Promise<number> {
    try {
      return await serviceRepository.createUpdate(data, parseInt(loggedInUserID), serviceID);
    } catch (error: any) {
      handleServiceError(error, 'process service');
      throw error;
    }
  }

  async get(serviceID?: any): Promise<any[]> {
    try {
      
      return await serviceRepository.get(serviceID);
    } catch (error: any) {
      handleServiceError(error, 'retrieve service');
      throw error;
    }
  }

  async getLookupList(): Promise<any[]> {
    try {
      return await serviceRepository.getLookupList();
    } catch (error: any) {
      handleServiceError(error, 'retrieve service lookup list');
      throw error;
    }
  }

  async delete(serviceID: number): Promise<void> {
    try {
      if (!serviceID) {
        throw CustomError.validationError('Service ID is required');
      }
      await serviceRepository.delete(serviceID);
    } catch (error: any) {
      handleServiceError(error, 'delete service');
    }
  }

  async getServiceByID(serviceID: number): Promise<any> {
    try {
      if (!serviceID) {
        throw CustomError.validationError('Service ID is required');
      }
      return await serviceRepository.getServiceByID(serviceID);
    } catch (error: any) {
      handleServiceError(error, 'fetch service detail');
    }
  }

  async getServiceCarers(serviceID: number): Promise<any> {
    try {
      if (!serviceID) {
        throw CustomError.validationError('Service ID is required');
      }
      return await serviceRepository.getServiceCarers(serviceID);
    } catch (error: any) {
      handleServiceError(error, 'fetch service carers');
    }
  }

  async updateServiceCarers(serviceID: number, carerIDs: any): Promise<any> {
    try {
      if (!serviceID) {
        throw CustomError.validationError('Service ID is required');
      }
      if (!carerIDs) {
        throw CustomError.validationError('Carer ID is required');
      }
      return serviceRepository.updateServiceCarers(serviceID, carerIDs);
    } catch (error: any) {
      handleServiceError(error, 'update service carers');
    }
  }
}
