export type ShiftType = {
    duration: string;
    startTime: string;
    startTimePeriod?: 'am' | 'pm';
    endTime: string;
    endTimePeriod?: 'am' | 'pm';
    isEditable?: boolean;
}

export type ServiceDurationType = {
    duration: number;
    startTime?: string;
    endTime?: string;
}

export type ServiceType = {
    serviceID?: number | null;
    serviceName: string;
    descr: string;
    serviceDurationType?: boolean;
    active: boolean;
    durations?: ServiceDurationType[];
    createdBy?: number | null;
    updatedBy?: number | null;
    createdOn?: string;
    updatedOn?: string | Date;
    loading?: boolean;

    Active?: boolean;
    
    ServiceName: string;
    Descr: string;
    ServiceID?: number | null;
    ServiceDurationType: boolean
}

