// import { Carer } from "../models";
import { CarerRepository } from '../repositories/carer.repository';
import { handleServiceError } from '../utils/handleDBError';

const carerRepository = new CarerRepository();

export class CarerService {
  async create(data: any): Promise<any> {
    try {
      return carerRepository.create(data);
    } catch (error: any) {
      handleServiceError(error, 'create carer');
    }
  }

  async getAll(loggedInUserID: number): Promise<any[]> {
    try {
      return carerRepository.getAll(loggedInUserID);
    } catch (error: any) {
      handleServiceError(error, 'fetch carers');
      throw error;
    }
  }

  async getLookupList(loggedInUserID: number): Promise<any[]> {
    try {
      return carerRepository.getLookupList(loggedInUserID);
    } catch (error: any) {
      handleServiceError(error, 'fetch carer lookup list');
      throw error;
    }
  }

  async getById(carerID: number): Promise<any | null> {
    try {
      return carerRepository.getById(carerID);
    } catch (error: any) {
      handleServiceError(error, 'fetch carer');
    }
  }

  async update(carerID: number, data: any) {
    try {
      return carerRepository.update(carerID, data);
    } catch (error: any) {
      handleServiceError(error, 'update carer');
    }
  }

  async delete(carerID: number): Promise<void> {
    try {
      return carerRepository.delete(carerID);
    } catch (error: any) {
      handleServiceError(error, 'delete carer');
    }
  }

  async getCarerServices(carerID: number): Promise<void> {
    try {
      return carerRepository.getCarerServices(carerID);
    } catch (error: any) {
      handleServiceError(error, 'fetch carer services');
    }
  }

  async updateCarerServices(carerID: number, serviceIDs: any): Promise<void> {
    try {
      return carerRepository.updateCarerServices(carerID, serviceIDs);
    } catch (error: any) {
      handleServiceError(error, 'fetch carer services');
    }
  }
}
