
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const DateRangePickerTool = ({ dateRange, setDateRange }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DemoContainer components={['DatePicker', 'DatePicker']}>
          <DatePicker
            label="Start Date"
            value={dateRange[0]}
            onChange={(newValue) =>setDateRange([newValue, dateRange[1]])}
          />
          <DatePicker
            label="End Date"
            value={dateRange[1]}
            onChange={(newValue) =>setDateRange([dateRange[0], newValue])}
          />
        </DemoContainer>
      </LocalizationProvider>
  );
};

export default DateRangePickerTool;
