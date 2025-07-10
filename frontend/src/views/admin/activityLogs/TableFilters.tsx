import { useState } from "react";
import { SelectChangeEvent, MenuItem, Select, Divider, InputLabel, FormControl } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/en-gb";
import { Skeleton } from "@mui/material";

dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.locale('en-gb');

// Updated DateRangeOption type with 'Custom' option
type DateRangeOption =
    | "This Week"
    | "Next Week"
    | "Later"
    | "Last Week"
    | "Earlier"
    | "This Month"
    | "Last Month"
    | "This Year"
    | "Last Year"
    | "All"
    | "Custom";

interface TableFiltersProps {
    onFilterChange: (dateFrom: string, dateTo: string, userID: string) => void;
    usersData: any[];
    loading: boolean;
}

interface DateRangeState {
    selectedRange: DateRangeOption;
    dateFrom: Dayjs | null;
    dateTo: Dayjs | null;
    selectedUser: string;
}

const getDateRange = (range: DateRangeOption): { startDate: Dayjs | null; endDate: Dayjs | null } | null => {
    const today = dayjs();
    let startDate: Dayjs | null;
    let endDate: Dayjs | null;

    switch (range) {
        case "This Week":
            startDate = today.startOf('week');
            endDate = today.endOf('week');
            break;
        case "Next Week":
            startDate = today.add(1, 'week').startOf('week');
            endDate = today.add(1, 'week').endOf('week');
            break;
        case "Later":
            startDate = today.add(1, 'week').endOf('week').add(1, 'day').startOf('day');
            endDate = null;
            break;
        case "Last Week":
            startDate = today.subtract(1, 'week').startOf('week');
            endDate = today.subtract(1, 'week').endOf('week');
            break;
        case "Earlier":
            startDate = null;
            endDate = today.subtract(1, 'week').startOf('week').subtract(1, 'day').endOf('day');
            break;
        case "This Month":
            startDate = today.startOf('month');
            endDate = today.endOf('month');
            break;
        case "Last Month":
            startDate = today.subtract(1, 'month').startOf('month');
            endDate = today.subtract(1, 'month').endOf('month');
            break;
        case "This Year":
            startDate = today.startOf('year');
            endDate = today.endOf('year');
            break;
        case "Last Year":
            startDate = today.subtract(1, 'year').startOf('year');
            endDate = today.subtract(1, 'year').endOf('year');
            break;
        case "All":
        case "Custom":
            return null;
        default:
            return null;
    }

    return { startDate, endDate };
};

const isValidYear = (date: Dayjs | null): boolean => {
    if (!date || !date.isValid()) return false;
    const year = date.year();
    return year >= 1000 && year <= 2099;
};



const TableFilters: React.FC<TableFiltersProps> = ({ onFilterChange, usersData, loading }) => {
    const initialRange = "This Week";
    const initialDates = getDateRange(initialRange);

    const [state, setState] = useState<DateRangeState>({
        selectedRange: initialRange,
        dateFrom: initialDates?.startDate || null,
        dateTo: initialDates?.endDate || null,
        selectedUser: 'all',
    });

    const [errors, setErrors] = useState({
        fromDate: false,
        toDate: false
    });



    const handleUserChange = (event: SelectChangeEvent) => {
        const value = event.target.value;
        setState(prevState => ({
            ...prevState,
            selectedUser: value
        }));
        onFilterChange(
            state.dateFrom ? state.dateFrom.format() : '',
            state.dateTo ? state.dateTo.format() : '',
            value
        );
    };

    const handleRangeChange = (event: SelectChangeEvent<string>) => {
        const range = event.target.value as DateRangeOption;
        const dateRange = getDateRange(range);

        if (range === "Custom") {
            setState(prevState => ({
                ...prevState,
                selectedRange: range,
                dateFrom: null,
                dateTo: null,
            }));
            onFilterChange('', '', state.selectedUser);
        } else if (dateRange) {
            setState(prevState => ({
                ...prevState,
                selectedRange: range,
                dateFrom: dateRange.startDate,
                dateTo: dateRange.endDate,
            }));
            onFilterChange(
                dateRange.startDate ? dateRange.startDate.format() : '',
                dateRange.endDate ? dateRange.endDate.format() : '',
                state.selectedUser
            );
        } else {
            setState(prevState => ({
                ...prevState,
                selectedRange: range,
                dateFrom: null,
                dateTo: null,
            }));
            onFilterChange('', '', state.selectedUser);
        }
        // Reset errors when range changes
        setErrors({ fromDate: false, toDate: false });
    };



    const handleFromDateChange = (newDate: Dayjs | null) => {
        const isValid = newDate && newDate.isValid() && isValidYear(newDate);
        const newErrorState = !isValid;

        setErrors(prev => ({ ...prev, fromDate: newErrorState }));

        if (!newErrorState && isValid) {
            const date = newDate.startOf('day');
            setState(prevState => ({
                ...prevState,
                dateFrom: date,
                selectedRange: "Custom",
            }));
            if (!errors.toDate || !state.dateTo) {
                onFilterChange(
                    date.format(),
                    state.dateTo ? state.dateTo.format() : '',
                    state.selectedUser
                );
            }
        }
    };

    const handleToDateChange = (newDate: Dayjs | null) => {
        const isValid = newDate && newDate.isValid() && isValidYear(newDate);
        const newErrorState = !isValid;

        setErrors(prev => ({ ...prev, toDate: newErrorState }));

        if (!newErrorState && isValid) {
            const date = newDate.endOf('day');
            setState(prevState => ({
                ...prevState,
                dateTo: date,
                selectedRange: "Custom",
            }));
            if (!errors.fromDate || !state.dateFrom) {
                onFilterChange(
                    state.dateFrom ? state.dateFrom.format() : '',
                    date.format(),
                    state.selectedUser
                );
            }
        }
    };



    return (
        <div className="flex flex-wrap gap-4 p-4">
            <>
                {/* User dropdown */}
                <FormControl fullWidth sx={{ width: 200, backgroundColor: 'white' }} size="small">
                    <InputLabel id="user-select-label">User</InputLabel>
                    <Select
                        labelId="user-select-label"
                        value={state.selectedUser}
                        onChange={handleUserChange}
                        label="User"
                    >
                        <MenuItem value="all">All Users</MenuItem>
                        {usersData.map((user) => (
                            <MenuItem key={user.UserID} value={user.UserID}>
                                {user.FirstName + `${user.LastName ? " " + user.LastName : ""}`}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Date Range Dropdown with separators */}
                <FormControl fullWidth sx={{ width: 200, backgroundColor: 'white' }} size="small">
                    <InputLabel id="date-range-label">Date Range</InputLabel>
                    <Select
                        labelId="date-range-label"
                        value={state.selectedRange}
                        onChange={handleRangeChange}
                        label="Date Range"
                    >
                        <MenuItem value="All">All</MenuItem>
                        <Divider />
                        <MenuItem value="This Week">This Week</MenuItem>
                        {/* <MenuItem value="Next Week">Next Week</MenuItem>
                        <MenuItem value="Later">Later</MenuItem> */}
                        <Divider />
                        <MenuItem value="Last Week">Last Week</MenuItem>
                        {/* <MenuItem value="Earlier">Earlier</MenuItem> */}
                        <Divider />
                        <MenuItem value="This Month">This Month</MenuItem>
                        <MenuItem value="Last Month">Last Month</MenuItem>
                        <Divider />
                        <MenuItem value="This Year">This Year</MenuItem>
                        <MenuItem value="Last Year">Last Year</MenuItem>
                        <Divider />
                        <MenuItem value="Custom">Custom</MenuItem>
                    </Select>
                </FormControl>

                {/* Date pickers */}




                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
                    <DatePicker
                        label="From Date"
                        value={state.dateFrom}
                        onChange={handleFromDateChange}
                        maxDate={state.dateTo || undefined}
                        format="DD/MM/YYYY"
                        sx={{
                            width: 200,
                            backgroundColor: 'white',
                            '& .Mui-error': {
                                borderColor: 'red',
                            }
                        }}
                        slotProps={{
                            textField: {
                                size: 'small',
                                error: errors.fromDate,
                                // helperText: errors.fromDate ? 'Invalid date' : ''
                            }
                        }}
                        onError={(reason) => {
                            setErrors(prev => ({ ...prev, fromDate: reason !== null }));
                        }}
                    />
                    <DatePicker
                        label="To Date"
                        value={state.dateTo}
                        onChange={handleToDateChange}
                        minDate={state.dateFrom || undefined}
                        format="DD/MM/YYYY"
                        sx={{
                            width: 200,
                            backgroundColor: 'white',
                            '& .Mui-error': {
                                borderColor: 'red',
                            }
                        }}
                        slotProps={{
                            textField: {
                                size: 'small',
                                error: errors.toDate,
                                // helperText: errors.toDate ? 'Invalid date' : ''
                            }
                        }}
                        onError={(reason) => {
                            setErrors(prev => ({ ...prev, toDate: reason !== null }));
                        }}
                    />
                </LocalizationProvider>



            </>
        </div>
    );
};

export default TableFilters;