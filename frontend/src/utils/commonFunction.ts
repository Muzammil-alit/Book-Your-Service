const pad = (num: any) => {
    return num < 10 ? '0' + num : num;
};

export const GetFormattedDateTimeUTCString = (dateString: Date | string | null) => {
    if (dateString) {
        // Convert UTC datetime string to a Date object
        const utcDate = new Date(dateString);

        // Get local date components
        const year = utcDate.getFullYear();
        const month = pad(utcDate.getMonth() + 1); // Month is zero-based
        const day = pad(utcDate.getDate());

        // Get local time components
        let hours = utcDate.getHours();
        const minutes = pad(utcDate.getMinutes());
        const seconds = pad(utcDate.getSeconds());
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // Handle midnight (0 hours)

        // Format the date and time     
        const localDateTimeString = `${day}/${month}/${year}, ${hours}:${minutes} ${ampm}`;

        return localDateTimeString

    }
    return null;
}


export const formatTimeTo = (timeString: any) => {
    if(timeString){
    const [hourString, minute] = timeString.split(":");
    const hour = +hourString % 24;
    return (hour % 12 || 12) + ":" + minute + (hour < 12 ? " AM" : " PM");
    }
    return null;
}

export function GetFormattedDate(newDate: null) {
    if (newDate) {
        const updatedDate = new Date(newDate);
        if (isNaN(updatedDate.getTime())) return null;

        const date = new Date(newDate + "T00:00-0800")
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());      
        return  day + '/' + month + '/' + year;
    }
    return null;
}

export function GetFormattedDateWithYearFormat(newDate: string | null) {
    if (newDate) {
        const updatedDate = new Date(newDate);
        if (isNaN(updatedDate.getTime())) return null;

        const date = new Date(newDate + "T00:00-0800")
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());      
        return  year + '-' + month + '-' + day;
    }
    return null;
}
