// CommonAutoSuggest.js

import React from 'react';
import Autosuggest from 'react-autosuggest';
import axios from 'axios';


const API_KEY = 'AIzaSyDdjMOgYAuUspOfs2tmKbDIGhiLHn2RbGI'
const url = 'https://maps.googleapis.com/maps/api/geocode/json?address='

const MAPBOX_API_KEY = 'pk.eyJ1Ijoia2Fyb250aWFucGNoIiwiYSI6ImNscXJhdGJiMDNoeWQyaXBocnJrd2F3cDQifQ.VCSEjiblfirsksTM7WNOHQ'
const MAPBOX_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';



const getSuggestionValue = suggestion => suggestion.name;
const renderSuggestion = suggestion => <div>{suggestion.name}</div>;

class CommonAutoSuggest extends React.Component {
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
    this.props.onHandleChange(newValue, this.props.index);

    // // Save the selected suggestion to local storage
    // localStorage.setItem(`suggestion_${this.props.index}`, newValue);
  };

  fetchSuggestions = async (value) => { ///GOOGLE API
    try {
      const response = await axios.get(`${url}${value}&key=${API_KEY}`);
      const suggestions = response.data.results.map((result) => {
        // name: result.formatted_address,
                  // Find the city, state and country in the address components
          const cityObj = result.address_components.find(component => component.types.includes('locality'));
          const stateObj = result.address_components.find(component => component.types.includes('administrative_area_level_1'));
          const countryObj = result.address_components.find(component => component.types.includes('country'));
          const city = cityObj ? cityObj.long_name : '';
          const state = stateObj ? stateObj.long_name : '';
          const country = countryObj ? countryObj.long_name : '';
          // Format the suggestion name
          return {
            name: `${city}, ${state}, ${country}`,
          };

     });

   


     suggestions.push({ name: 'Z0' });
     suggestions.push({ name: 'Z1' });
     suggestions.push({ name: 'Z2' });
     suggestions.push({ name: 'Z3' });
     suggestions.push({ name: 'Z4' });



     this.setState({ suggestions });
    } catch (error) {
      console.log(error);
    }


  }; 
  fetchSuggestionsMapbox = async (value) => { ///MAPBOX API
    try {
      const response = await axios.get(`${MAPBOX_URL}${encodeURIComponent(value)}.json?access_token=${MAPBOX_API_KEY}`);
      const suggestions = response.data.features.map((feature) => {
        return {
          name: feature.place_name,
        };
      });

      

     suggestions.push({ name: 'Z0' });
     suggestions.push({ name: 'Z1' });
     suggestions.push({ name: 'Z2' });
     suggestions.push({ name: 'Z3' });
     suggestions.push({ name: 'Z4' });
     suggestions.push({ name: 'CR' });
     suggestions.push({ name: 'SV' });
     suggestions.push({ name: 'AR' });
     suggestions.push({ name: 'HN' });
     suggestions.push({ name: 'NY, US'});
     suggestions.push({ name: 'ON, CA'});





      this.setState({ suggestions });
    } catch (error) {
      console.log(error);
    }
    };

  onSuggestionsFetchRequested = ({ value }) => { 
    this.fetchSuggestionsMapbox(value);
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  
  onKeyDown = (event) => {
  const { keyCode } = event;
  const { suggestions } = this.state;

  // Check if the Tab key was pressed
  if (keyCode === 9 && suggestions.length > 0) {
    // event.preventDefault(); // Prevent the default action
    this.setState({ value: suggestions[0].name }); // Set the value to the first suggestion
    this.props.onHandleChange(suggestions[0].name, this.props.index); // Update the parent component

    // Move the focus to the next field
    const nextField = document.querySelector('input[name="nextFieldName"]');
    if (nextField) {
      nextField.focus();
    }
  }
};


  render() {
    const { suggestions,  } = this.state;
    const { disabled, index, placeholder, value } = this.props;

    const inputProps = {
      placeholder,
      value,
      onChange: this.onChange,
      disabled,
      onKeyDown: this.onKeyDown

    };


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

export default CommonAutoSuggest;
