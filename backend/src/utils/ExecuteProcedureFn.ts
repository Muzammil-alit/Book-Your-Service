
import { connectDB } from "../config/database";
import sql from "mssql";

export interface TVP {
  typeName: string;
  columns: { name: string; type: sql.ISqlType }[];
  rows: any[][];
}

export async function executeStoredProcedure(
  procedureName: string,
  params: Record<string, any>,
  tvps: Record<string, TVP> = {},
  specialTypes: Record<string, { type: any; value: any }> = {},
  isNested: boolean = false
): Promise<any> {
  const pool = await connectDB();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();
    const request = new sql.Request(transaction)
    // Regular scalar parameters
    for (const [key, value] of Object.entries(params)) {
      request.input(key, value);
    }

    // Special types
    for (const [key, { type, value }] of Object.entries(specialTypes)) {
      request.input(key, type, value);
    }

    // TVPs
    for (const [key, tvp] of Object.entries(tvps)) {
      const table = new sql.Table();
      for (const col of tvp.columns) {
        table.columns.add(col.name, col.type);
      }
      for (const row of tvp.rows) {
        table.rows.add(...row);
      }
      request.input(key, sql.TVP(tvp.typeName), table);
    }

    const result = await request.execute(procedureName);
    await transaction.commit();
    return isNested ? result.recordsets : (result.recordset ?? result);

  } catch (error) {
    await transaction.rollback();
    console.error(`Error executing stored procedure ${procedureName}:`, error);
    throw error;
  }
}

export const toSqlTime7 = (value: string): Date => {
  const timePart = value.split('.')[0];
  const [hours, minutes, seconds] = timePart.split(':').map(Number);
  const date = new Date(0);
  date.setUTCHours(hours, minutes, seconds, 0);
  return date;
}

export const toNestedData = (inputData: any): any => {
  const serviceData = inputData[0][0];
  serviceData.Durations = inputData[1]
  return serviceData
}

export const toNestedMultipleDataServices = (inputData: any): any => {
  const [services, durations] = inputData;  
  // Create a map of ServiceID to its durations for faster lookup
  const durationsMap = new Map();
  durations.forEach((duration: any) => {
    if (!durationsMap.has(duration.ServiceID)) {
      durationsMap.set(duration.ServiceID, []);
    }
    durationsMap.get(duration.ServiceID).push(duration);
  });
  
  // Add Durations to each service
  return services.map((service: any) => {
    return {
      ...service,
      Durations: durationsMap.get(service.ServiceID) || []
    };
  });
}

export const toNestedMultipleDataCalendar = (inputData: any): any => {
  const [carers, weeklySchedules, offDays, bookings] = inputData;
  
  // Create maps for faster lookup
  const offDaysMap = new Map();
  const weeklySchedulesMap = new Map();
  const bookingsMap = new Map();

  // Populate offDays map (key: CarerID, value: array of offDays)
  offDays.forEach((offDay: any) => {
    if (!offDaysMap.has(offDay.CarerID)) {
      offDaysMap.set(offDay.CarerID, []);
    }
    offDaysMap.get(offDay.CarerID).push(offDay);
  });

  // Populate weeklySchedules map (key: CarerID, value: array of weeklySchedules)
  weeklySchedules.forEach((schedule: any) => {
    if (!weeklySchedulesMap.has(schedule.CarerID)) {
      weeklySchedulesMap.set(schedule.CarerID, []);
    }
    weeklySchedulesMap.get(schedule.CarerID).push(schedule);
  });

  // Populate bookings map (key: CarerID, value: array of bookings)
  bookings.forEach((booking: any) => {
    if (!bookingsMap.has(booking.CarerID)) {
      bookingsMap.set(booking.CarerID, []);
    }
    bookingsMap.get(booking.CarerID).push(booking);
  });

  // Merge all data under each carer
  return carers.map((carer: any) => {
    return {
      ...carer,
      OffDays: offDaysMap.get(carer.CarerID) || [],
      WeeklySchedules: weeklySchedulesMap.get(carer.CarerID) || [],
      Bookings: bookingsMap.get(carer.CarerID) || []
    };
  });
};

