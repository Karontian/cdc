// CommonAutoSuggest.js
import React, { Component } from 'react';
import Autosuggest from 'react-autosuggest';
import axios from 'axios';

const API_KEY = 'AIzaSyDdjMOgYAuUspOfs2tmKbDIGhiLHn2RbGI';
const url = 'https://maps.googleapis.com/maps/api/geocode/json?address=';

const getSuggestionValue = suggestion => suggestion.name;
const renderSuggestion = suggestion => (
  <div>
    {suggestion.name}
  </div>
);

class CommonAutoSuggest extends Component {
  constructor() {
    super();
    this.state = {
      value: '',
      suggestions: [],
    };
  }

  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue,
    });
    this.props.onHandleChange(newValue, this.props.index);
  };

  fetchSuggestions = async (value) => {
    try {
      const response = await axios.get(`${url}${value}&key=${API_KEY}`);
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

  onSuggestionsFetchRequested = ({ value }) => {
    this.fetchSuggestions(value);
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  render() {
    const { suggestions, value } = this.state;
    const { disabled, placeholder, index } = this.props;

    const inputProps = {
      placeholder,
      value,
      onChange: this.onChange,
      disabled,
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
