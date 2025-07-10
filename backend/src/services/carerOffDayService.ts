import { CarerOffDayRepository } from '../repositories/carerOffDays.repository';
import { handleServiceError } from '../utils/handleDBError';

const carerOffDayRepository = new CarerOffDayRepository();

interface OffDay {
  date: string;
}

export class CarerOffDayService {
  async create(
    carerID: number,
    dateFrom: Date,
    dateTo: Date,
    operatingUserID: number,
  ): Promise<void> {
    try {
      await carerOffDayRepository.create(carerID, dateFrom, dateTo, operatingUserID);
    } catch (error: any) {
      handleServiceError(error, 'create carer off day');
    }
  }

  async update(
    carerOffDayID: number,
    dateFrom: Date,
    dateTo: Date,
    operatingUserID: number,
  ): Promise<void> {
    try {
      await carerOffDayRepository.update(carerOffDayID, dateFrom, dateTo, operatingUserID);
    } catch (error: any) {
      handleServiceError(error, 'update carer off day');
    }
  }

  async updateCarerOffDays(
    carerID: number,
    offDays: OffDay[],
    operatingUserID: number,
  ): Promise<void> {
    try {
      await carerOffDayRepository.updateCarerOffDays(carerID, offDays, operatingUserID);
    } catch (error: any) {
      handleServiceError(error, 'update carer off day');
    }
  }

  async delete(carerOffDayID: number): Promise<void> {
    try {
      await carerOffDayRepository.delete(carerOffDayID);
    } catch (error: any) {
      handleServiceError(error, 'delete carer off day');
    }
  }

  async getCarerOffDayByID(carerOffDayID: number): Promise<any> {
    try {
      return await carerOffDayRepository.getCarerOffDayByID(carerOffDayID);
    } catch (error: any) {
      handleServiceError(error, 'fetch carer off day');
    }
  }

  async getListByCarerID(carerID: number): Promise<any[]> {
    try {
      return await carerOffDayRepository.getListByCarerID(carerID);
    } catch (error: any) {
      handleServiceError(error, 'fetch carer off day');
      throw error;
    }
  }
}
