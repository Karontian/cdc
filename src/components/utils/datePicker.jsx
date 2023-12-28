import { useState} from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DateRange = (props) => {
  const [startDate, setStartDate] = useState(
    props.dateRange ? new Date(props.dateRange.split(' - ')[0]) : null
  );
  const [endDate, setEndDate] = useState(
    props.dateRange ? new Date(props.dateRange.split(' - ')[1]) : null
  );


  const onChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    if (start && end) {
      // If both start and end dates are available, call the parent component's callback
      props.onDateRangeChange(start, end);
    } 
  };

  return (
    <DatePicker
      selected={startDate}
      disabled={props.disabled}
      onChange={onChange}
      startDate={startDate}
      endDate={endDate}
      selectsRange
    />
  );
};

export default DateRange;