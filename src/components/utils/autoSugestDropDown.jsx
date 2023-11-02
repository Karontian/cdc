import React from 'react';
import Autosuggest from 'react-autosuggest';
import axios from 'axios';

const API_KEY = 'AIzaSyDdjMOgYAuUspOfs2tmKbDIGhiLHn2RbGI'
const url = 'https://maps.googleapis.com/maps/api/geocode/json?address='



// Teach Autosuggest how to calculate suggestions for any given input value.
// const getSuggestions = value => {
//   console.log('getSugestions'+value)
//   const inputValue = value.trim().toLowerCase();
//   const inputLength = inputValue.length;

//   return inputLength === 0 ? [] : this.state.suggestions.filter(lang =>
//     lang.name.toLowerCase().slice(0, inputLength) === inputValue
//   );
// };

// When suggestion is clicked, Autosuggest needs to populate the input
// based on the clicked suggestion. Teach Autosuggest how to calculate the
// input value for every given suggestion.
const getSuggestionValue = suggestion => suggestion.name;

// // Use your imagination to render suggestions.
// const renderSuggestion = suggestion => (
//   <div>
//     {suggestion.name}
//   </div>
// );

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
  // componentDidMount(str) {
  //   console.log('componentDidMount')
  //     axios.post(`${url}${str}=${API_KEY}`)
  //       .then(res => {console.log(res.data.results)})
  // }

  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue
    });
  };

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequested = ({ value }) => {
    this.fetchSuggestions(value);
  };

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };


    fetchSuggestions = async (input) => {
    try {
      const response = await axios.get(`${url}${input}&key=${API_KEY}`);
      console.log(response);
      const suggestions = response.data.results.map((result) => result.formatted_address);
      this.setState({ suggestions });
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    const { value, suggestions } = this.state;
    console.log(this.state.suggestions)

    // Autosuggest will pass through all these props to the input.
    const inputProps = {
      placeholder: 'Load Origin',
      value,
      onChange: this.onChange
    };

    // Finally, render it!
    return (
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={(suggestion) => (<div>{suggestion}</div>)}
        inputProps={inputProps}
      />
    );
  }
}

export default AutoSuggestDropDown;