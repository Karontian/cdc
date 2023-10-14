import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

class DateRangePicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: null,      // Selected date or start date of the range
      startDate: null,     // Start date of the range
      endDate: null,       // End date of the range
      selecting: false,    // Indicates if a range is being selected
    };
  }

  
  formatSelectedRange = () => {
    const { startDate, endDate } = this.state;
    if (startDate && endDate) {
      return `${startDate.toLocaleDateString()}-${endDate.toLocaleDateString()}`;
    }

    return startDate ? startDate.toLocaleDateString() : '';
  };

  handleDateChange = (date) => {
    const { startDate, endDate } = this.state;

    if (!startDate || endDate) {
      // If no start date selected or an end date is already selected, start a new range
      this.setState({
        startDate: date,
        endDate: null,
        selecting: true,   // Set the selecting flag to true
      });
    } else if (startDate && !endDate) {
      // If a start date is selected but no end date, set the end date
      this.setState({
        endDate: date,
        selecting: false,  // Set the selecting flag to false
      });
    }

      // Pass the date range to the master component when it changes
      this.props.onDateRangeChange(startDate, date);

  };

  render() {
    return (
      <div>
        <DatePicker
          disabled={this.props.disabled}
          selected={null}
          onChange={this.handleDateChange}
          selectsStart
          startDate={this.state.startDate}
          endDate={this.state.endDate}
          placeholderText={this.props.dateRange}
          selectsEnd
          shouldCloseOnSelect={false}
        />
        
      </div>
    );
  }
}

export default DateRangePicker;
