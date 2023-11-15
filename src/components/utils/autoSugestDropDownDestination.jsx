import React from 'react';
import CommonAutoSuggest from './CommonAutoSuggest';
// import axios from 'axios';



// const API_KEY = 'AIzaSyDdjMOgYAuUspOfs2tmKbDIGhiLHn2RbGI'
// const url = 'https://maps.googleapis.com/maps/api/geocode/json?address='



// const getSuggestionValue = suggestion => suggestion.name;
// const renderSuggestion = suggestion => (
//     <div>
//       {suggestion.name}
//     </div>
//   );

class autoSugestDropDownDestination extends React.Component {
    constructor() {
      super();
      this.state = {
        value: '',
        suggestions: []
      };
    }
    onChange = (event, { newValue }) => {
        this.setState({
          value: newValue
        });
          // Call the onOriginChange callback with the new value
        this.props.onHandleDestinationChange(newValue, this.props.index);
  
      };
      
      // fetchSuggestions = async (value) => {
      //     try {
      //       const response = await axios.get(`${url}${value}&key=${API_KEY}`);
      //       console.log(response) 
      //       const suggestions = response.data.results.map((result) => ({
      //         name: result.formatted_address,
      //      }));
      //      this.setState({ suggestions });
      //     } catch (error) {
      //       console.log(error);
      //     }
      //   }; 
    
      // Autosuggest will call this function every time you need to update suggestions.
      // You already implemented this logic above, so just use it.
      onSuggestionsFetchRequested = ({ value }) => { 
          this.fetchSuggestions(value)
      };
    
      // Autosuggest will call this function every time you need to clear suggestions.
      onSuggestionsClearRequested = () => {
        this.setState({
          suggestions: []
        });
      };
    
    render() {      // const {  suggestions } = this.state;
      const {  disabled, index, destination } = this.props;
  
      // Autosuggest will pass through all these props to the input.
      // const inputProps = {
      //   placeholder: 'Type a load Destination',
      //   value: destination,
      //   onChange: this.onChange,
      //   disabled: disabled
      // };
  
      // Finally, render it!
      return (
            <CommonAutoSuggest
            // placeholder='Type a load Origin'
            index={index}
            disabled={disabled}
            onHandleChange={this.props.onHandleDestinationChange}
            value={destination}
          />
      );
      }
    }
    

 
export default autoSugestDropDownDestination;
