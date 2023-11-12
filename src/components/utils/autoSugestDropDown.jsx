import React from 'react';
import Autosuggest from 'react-autosuggest';
import axios from 'axios';

const API_KEY = 'AIzaSyDdjMOgYAuUspOfs2tmKbDIGhiLHn2RbGI'
const url = 'https://maps.googleapis.com/maps/api/geocode/json?address='


  // When suggestion is clicked, Autosuggest needs to populate the input
// based on the clicked suggestion. Teach Autosuggest how to calculate the
// input value for every given suggestion.
const getSuggestionValue = suggestion => suggestion.name;

// Use your imagination to render suggestions.
const renderSuggestion = suggestion => (
    <div>
      {suggestion.name}
    </div>
  );


 
  class AutoSuggestDropDown extends React.Component {
    constructor() {
      super();
  
      // Autosuggest is a controlled component.
      // This means that you need to provide an input value
      // and an onChange handler that updates this value (see below).
      // Suggestions also need to be provided to the Autosuggest,
      // and they are initially empty because the Autosuggest is closed.
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
      this.props.onHandleOriginChange(newValue, this.props.index);

    };
    
    fetchSuggestions = async (value) => {
        try {
          const response = await axios.get(`${url}${value}&key=${API_KEY}`);
          console.log(response) 
          const suggestions = response.data.results.map((result) => ({
            name: result.formatted_address,
         }));

         suggestions.push({ name: 'Z0' });
         suggestions.push({ name: 'Z1' });
   
         this.setState({ suggestions });
        } catch (error) {
          console.log(error);
        }
      }; 
  
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
  
    render() {
      const {  suggestions } = this.state;
      const {  disabled, origin, index } = this.props;
  
      // Autosuggest will pass through all these props to the input.
      const inputProps = {
        placeholder: 'Type a load Origin',
        value: origin,
        onChange: this.onChange,
        disabled: disabled
      };
  
      // Finally, render it!
      return (
        <Autosuggest
          index={index}
          disabled={disabled}
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps}
        />
      );
    }
  }

  export default AutoSuggestDropDown;