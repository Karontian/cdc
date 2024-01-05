import React, { Component  } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'
import axios from 'axios'; // Import Axios
import DatePicker from './utils/datePicker';
import 'react-date-range/dist/styles.css'; // Import styles
import 'react-date-range/dist/theme/default.css'; // Import theme styles
import AutoSugestDropDown from './utils/AutoSugestDropDown';
import AutoSuggestDropDownDestination from './utils/AutoSugestDropDownDestination';
import LoadingSpinner from './utils/loadingSpinner';

axios.defaults.baseURL = 'http://localhost:3002'
// const API_KEY = 'AIzaSyDdjMOgYAuUspOfs2tmKbDIGhiLHn2RbGI'
// const url = 'https://maps.googleapis.com/maps/api/geocode/json?address='
const MAPBOX_API_KEY = 'pk.eyJ1Ijoia2Fyb250aWFucGNoIiwiYSI6ImNscXJhdGJiMDNoeWQyaXBocnJrd2F3cDQifQ.VCSEjiblfirsksTM7WNOHQ';
const MAPBOX_GEOCODING_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';
const MAPBOX_DIRECTIONS_URL = 'https://api.mapbox.com/directions/v5/mapbox/driving/';



class CarrierSearchList extends Component {
    state = { 
        search:{
          origin: '',
          destination: '',
        },
        activeSearch: [],
        sortConfig: {
            key: '',
            direction: 'ascending',
        },
        selectedOriginGroup: false,
        selectedDestinationGroup: false,
        results: [], //Results to display coming from the DB to the searchResults table
        placeholderText: new Date().toLocaleDateString(),
        filteredLoads: [], // Initialize an empty array to store filtered loads
        loads: [],
        searches: [],
        isNewSearch: false, // Flag to track new search entries
        displayForm: false,
        formData: {
            equipment: '',
            dateRange: {},
            selectedDate: {},
            endDate: {},    
            origin: '',
            originDH: '',
            destination: '',
            destinationDH: '',
            age: '',


        },
        searchResolved: true, // This is a flag to indicate if the search has been resolved or not
        searchClickedIndex: null, // This is the index of the search that was clicked
        entryClick: false, // This is a flag to indicate if a search entry was clicked,
        isLoading: false, // Add a loading state for the spinner
        
    } 

    componentDidMount() {
          axios.get('/newSearch') // Make a GET request to the server route
            .then((response) => {
                const formattedSearches = response.data.map((search) => (
                  {
                    ...search,
                    dateRange: search.dateRange,
                    searchClicked: true, // Initialize searchClicked to false for each search
                  }));
                this.setState({
                    searches: formattedSearches, // Update the searches state with the fetched data
                });
               
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
      }

      //SEARCH LIST FUNCTIONS
    newSearch = () => {//e is the event, index is the index of the search in the searches array
        const newSearchData = {
            equipment: '',
            dateRange: null,
            origin: '',
            originDH: '100',
            destination: '',
            destinationDH: '100',
            age: '2',
            searchClicked: false, // Initialize searchClicked to false for the new search
            editing: false,
            createdAt : Date.now(),

        };
        
        this.setState({
            isNewSearch: true, // Set isNewSearch to true
            searches: [...this.state.searches, newSearchData],
            searchResolved: false, // Set searchResolved to false
            activeSearch: [], // Set activeSearch to an empty array
            results: [], // Set results to an empty array
        });
    }

    cancelNewSearch = () => {
        // Remove the last new search data from the state
        const newSearches = this.state.searches.slice(0, -1);
        this.setState({
            isNewSearch: true,
            searches: newSearches,
            searchResolved: true, // or set it to false if needed
        });
    }
    
   onChange = (e, index) => {//e is the event, index is the index of the search in the searches array
          e.preventDefault(); // Prevent form submission
          const newSearches = this.state.searches.slice(); // Create a shallow copy of the searches array
          newSearches[index][e.target.name] = e.target.value; // Update the value of the input field that changed
          this.setState({
            searches: newSearches,
          });
        }
        
    onSubmit = async (e, index, updateTag, id) => {
        e.preventDefault()
        // console.log('onSubmit', this.state.searches[index]);
        
        if (index >= 0 && index < this.state.searches.length) {
                const newSearchData = this.state.searches[index];
                                          // Check if equipment is selected
                              if (newSearchData.equipment === '' || newSearchData.equipment === 'select') {
                                  alert('Please select equipment type');
                                  return;
                              }
                              if (!newSearchData.dateRange) {
                                console.log('newSearchData.dateRange', newSearchData.dateRange);
                                alert('Please select a date range');
                                return; // Stop the function if dateRange is empty or null
                            }
                    
                 newSearchData.searchClicked = true; // Set searchClicked to true
                try {

                  // Make a POST request to your server using Axios
                  const response = await axios.post('/newSearch', newSearchData);
            
                  if (response.status === 201) {
                    // Handle success, e.g., show a success message or reset the form              
                    this.setState({
                      isLoading : false, // Set loading state to false
                      searchResolved: true, // Set searchResolved to true
                      searchClickedIndex: index, // Set the clicked index
                      activeSearch: newSearchData,
                    });

                     this.fetchLoadsData(newSearchData.equipment, newSearchData.dateRange, newSearchData.age, this.state.searches[index]);

                  } else {
                    // Handle error, e.g., show an error message
                    console.error('Error adding NewSearch:', response.statusText);
                  }
                } catch (error) {
                  console.error('Error:', error);
                  this.setState({ isLoading: false }); // Set loading state to false
                }
              } 

    }
      
    onDelete = async (e, index, id) => {
            console.log('onDelete', id, this.state.results);
            e.preventDefault();
            try {
              if (id) {
                // If there's an ID, make a DELETE request with it
                const response = await axios.delete(`/newSearch/${id}`);
                console.log('response', response);
                const updatedSearches = this.state.searches.filter((search) => search._id !== id);
                this.setState({
                  searches: updatedSearches,
                  searchResolved: true,
                  searchClickedIndex: -1,
                  results: [],
                });
          
                if (response.status === 200) {
                  console.log('Search entry deleted successfully');
                } else {
                  console.error('Error deleting search entry:', response.statusText);
                }
              } else {
                console.log('No ID provided', e, index);
                // If there's no ID, simply remove the item from the state
                console.log('onDelete', this.state.searches[index]);
                let createdAt = this.state.searches[index].createdAt;
                axios.get(`/getNewSearchId/${createdAt}`)
                  .then((response) => {
                      console.log(response.data);
                      this.onDelete(e, index, response.data[0]._id)
                  })
                  
                const updatedSearches = this.state.searches.slice(); // Create a shallow copy of the searches array
                updatedSearches.splice(index, 1); // Remove the item at the specified index
                this.setState({
                  searches: updatedSearches,
                  searchResolved: true,
                  searchClickedIndex: -1,
                });

                

              }
              console.log('onDelete',  this.state.results);
            } catch (error) {
              console.error('Error:', error);
            }
    };

    onEdit = (e, index) => {
        const updatedSearches = [...this.state.searches];
        updatedSearches[index].searchClicked = false; // Set searchClicked to false
        this.setState({ searches: updatedSearches });
        updatedSearches[index].editing = true;
        
     }
    
    onEditSave = async (index, id, equipment) => {
        try{
            const searchData = this.state.searches[index];
                    if (searchData.equipment === 'select') {
                        alert('Please select equipment type');
                        return;
                    }
                    console.log('searchData.dateRange', searchData.dateRange);
        
            if(id){
              console.log('onEditSave', id, searchData);
                const response = await axios.put(`/newSearch/${id}`, searchData);
                console.log('response', response);
                const formattedDate = response.data.dateRange.split('T')[0] 

                if (response.status === 200) {
                    // Handle the successful update (e.g., display a success message)
                    const createdSearch = { ...response.data, dateRange: formattedDate }; // Include the formatted date
                    const updatedSearches = [...this.state.searches];
                    updatedSearches[index] = createdSearch; //  Update the item in the array with the updated data
                    updatedSearches[index].editing = false;
                    updatedSearches[index].searchClicked = true;
                    this.setState({
                        searches: updatedSearches, // Update the searches state with the updated data
                        searchResolved: true, // Set searchResolved to true
                        searchClickedIndex: index, // Set the clicked index
                    });
                    this.fetchLoadsData(equipment, searchData.dateRange, searchData.age, this.state.searches[index]);
                                    
                  } else {
                    // Handle update errors
                    console.error('Error updating search entry:', response.statusText);
                  }

            } else {
                let timeStamp = searchData.createdAt;
                const idResponse = await axios.get(`/getNewSearchId/${timeStamp}`); // Make a GET request to the server route
                let id = idResponse.data[0]._id;
                const response = await axios.put(`/newSearch/${id}`, searchData);
                const formattedDate = response.data.dateRange.split('T')[0];
                if (response.status === 200) {
                    // Handle the successful update (e.g., display a success message)
                    console.log('Search entry updated successfully');
                    const createdSearch = { ...response.data, dateRange: formattedDate }; // Include the formatted date
                    const updatedSearches = [...this.state.searches];
                    updatedSearches[index] = createdSearch; //  Update the item in the array with the updated data
                    updatedSearches[index].editing = false;
                    updatedSearches[index].searchClicked = true;
                    this.setState({
                        searches: updatedSearches, // Update the searches state with the updated data
                        searchResolved: true, // Set searchResolved to true
                        searchClickedIndex: index, // Set the clicked index
                    });
                    this.fetchLoadsData(equipment, searchData.dateRange, searchData.age, this.state.searches[index]);                                  
                  } else {
                    // Handle update errors
                    console.error('Error updating search entry:', response.statusText);
                  }


             }        
            
            }  catch (error) {
          // Handle unexpected errors (e.g., network issues)
          console.error('Error updating search entry:', error);
        }
    }

    onEntryClick = (e, index, equipment) => {
      // console.log('onEntryClick', index, equipment);
        if (this.state.searches[index].searchClicked ) {
            this.fetchLoadsData(equipment, this.state.searches[index].dateRange, this.state.searches[index].age, this.state.searches[index]);

        } else {
            return
        }
    }

    fetchLoadsData = async (tag, dateRange, age, index) => {
      console.log('fetchLoadsData', tag, dateRange, age, index);
      this.setState({ isLoading: true }); // Set loading to true before the API call


      const locationGroup =  {
        Z0 :[
          { name: "Belize", abb: "BZ" },
          { name: "Costa Rica", abb: "CR" },
          { name: "El Salvador", abb: "SV" },
          { name: "Guatemala", abb: "GT" },
          { name: "Honduras", abb: "HN" },
          { name: "Mexico", abb: "MX" },
          { name: "Nicaragua", abb: "NI" },
          { name: "Panama", abb: "PA" },
        ],
        Z1 : [
          { name: "Argentina", abb: "AR" },
          { name: "Bolivia", abb: "BO" },
          { name: "Brazil", abb: "BR" },
          { name: "Chile", abb: "CL" },
          { name: "Colombia", abb: "CO" },
          { name: "Ecuador", abb: "EC" },
          { name: "French Guiana", abb: "GF" },
          { name: "Guyana", abb: "GY" },
          { name: "Paraguay", abb: "PY" },
          { name: "Peru", abb: "PE" },
          { name: "Suriname", abb: "SR" },
          { name: "Uruguay", abb: "UY" },
          { name: "Venezuela", abb: "VE" },
          { name: "Falkland Islands", abb: "FK" }
                   
        ],
        Z2 : [
          { name: "Alabama", abb: "AL, US" },
          { name: "Alaska", abb: "AK, US" },
          { name: "Arizona", abb: "AZ, US" },
          { name: "Arkansas", abb: "AR, US" },
          { name: "California", abb: "CA, US" },
          { name: "Colorado", abb: "CO, US" },
          { name: "Connecticut", abb: "CT, US" },
          { name: "Delaware", abb: "DE, US" },
          { name: "Florida", abb: "FL, US" },
          { name: "Georgia", abb: "GA, US" },
          { name: "Hawaii", abb: "HI, US" },
          { name: "Idaho", abb: "ID, US" },
          { name: "Illinois", abb: "IL, US" },
          { name: "Indiana", abb: "IN, US" },
          { name: "Iowa", abb: "IA, US" },
          { name: "Kansas", abb: "KS, US" },
          { name: "Kentucky", abb: "KY, US" },
          { name: "Louisiana", abb: "LA, US" },
          { name: "Maine", abb: "ME, US" },
          { name: "Maryland", abb: "MD, US" },
          { name: "Massachusetts", abb: "MA, US" },
          { name: "Michigan", abb: "MI, US" },
          { name: "Minnesota", abb: "MN, US" },
          { name: "Mississippi", abb: "MS, US" },
          { name: "Missouri", abb: "MO, US" },
          { name: "Montana", abb: "MT, US" },
          { name: "Nebraska", abb: "NE, US" },
          { name: "Nevada", abb: "NV, US" },
          { name: "New Hampshire", abb: "NH, US" },
          { name: "New Jersey", abb: "NJ, US" },
          { name: "New Mexico", abb: "NM, US" },
          { name: "New York", abb: "NY, US" },
          { name: "North Carolina", abb: "NC, US" },
          { name: "North Dakota", abb: "ND, US" },
          { name: "Ohio", abb: "OH, US" },
          { name: "Oklahoma", abb: "OK, US" },
          { name: "Oregon", abb: "OR, US" },
          { name: "Pennsylvania", abb: "PA, US" },
          { name: "Rhode Island", abb: "RI, US" },
          { name: "South Carolina", abb: "SC, US" },
          { name: "South Dakota", abb: "SD, US" },
          { name: "Tennessee", abb: "TN, US" },
          { name: "Texas", abb: "TX, US" },
          { name: "Utah", abb: "UT, US" },
          { name: "Vermont", abb: "VT, US" },
          { name: "Virginia", abb: "VA, US" },
          { name: "Washington", abb: "WA, US" },
          { name: "West Virginia", abb: "WV, US" },
          { name: "Wisconsin", abb: "WI, US" },
          { name: "Wyoming", abb: "WY, US" }
        ],
        Z3 : [
          { name: "Alberta", abb: "AB, CA" },
          { name: "British Columbia", abb: "BC, CA" },
          { name: "Manitoba", abb: "MB, CA" },
          { name: "New Brunswick", abb: "NB, CA" },
          { name: "Newfoundland and Labrador", abb: "NL, CA" },
          { name: "Northwest Territories", abb: "NT, CA" },
          { name: "Nova Scotia", abb: "NS, CA" },
          { name: "Nunavut", abb: "NU, CA" },
          { name: "Ontario", abb: "ON, CA" },
          { name: "Prince Edward Island", abb: "PE, CA" },
          { name: "Quebec", abb: "QC, CA" },
          { name: "Saskatchewan", abb: "SK, CA" },
          { name: "Yukon", abb: "YT, CA" }
        ],
        Z4 : [
          { name: "Bahamas", abb: "BS" },
          { name: "Barbados", abb: "BB" },
          { name: "Cuba", abb: "CU" },
          { name: "Dominican Republic", abb: "DO" },
          { name: "Haiti", abb: "HT" },
          { name: "Jamaica", abb: "JM" },
          { name: "Trinidad and Tobago", abb: "TT" },
          { name: "Saint Lucia", abb: "LC" },
          { name: "Saint Vincent and the Grenadines", abb: "VC" },
          { name: "Grenada", abb: "GD" },
          { name: "Antigua and Barbuda", abb: "AG" },
          { name: "Saint Kitts and Nevis", abb: "KN" }
        ],

      }
    

      let originLocationGroup = false
      let destinationLocationGroup = false 
      


      //date Formating before server call
      function formatDates(dateRange) {
        const [start, end] = dateRange.split(' - ');
        const [startMonth, startDay, startYear] = start.split('/');
        const [endMonth, endDay, endYear] = end.split('/');
        const startDateString = `${startYear}-${startMonth.padStart(2, '0')}-${startDay.padStart(2, '0')}`;
        const endDateString = `${endYear}-${endMonth.padStart(2, '0')}-${endDay.padStart(2, '0')}`;
        return [startDateString, endDateString];
        }
      //Trip Calculation   MAPBOX API MAPBOX API
   
      // async function tripCalculator(origin, destination) {
      //   console.log('tripCalculator', origin, destination);
      
      //   try {
      //     // Geocode the origin and destination
      //     const originResponse = await axios.get(`${MAPBOX_GEOCODING_URL}${encodeURIComponent(origin)}.json?access_token=${MAPBOX_API_KEY}`);
      //     const destinationResponse = await axios.get(`${MAPBOX_GEOCODING_URL}${encodeURIComponent(destination)}.json?access_token=${MAPBOX_API_KEY}`);
      
      //     const originCoordinates = originResponse.data.features[0].center.join(',');
      //     const destinationCoordinates = destinationResponse.data.features[0].center.join(',');
      
      //     // Calculate the trip
      //     const directionsResponse = await axios.get(`${MAPBOX_DIRECTIONS_URL}${originCoordinates};${destinationCoordinates}.json?access_token=${MAPBOX_API_KEY}`);
      //     const data = directionsResponse.data;
      //               // The distance of the trip in meters
      //         const distanceMeters = data.routes[0].distance;

      //         // The duration of the trip in seconds
      //         const durationSeconds = data.routes[0].duration;

      //         // Convert distance to kilometers (1 meter = 0.001 kilometers)
      //         const distanceKilometers = distanceMeters * 0.001;

      //         // Convert duration to hours (1 second = 0.000277778 hours)
      //         const durationHours = durationSeconds * 0.000277778;

      //         console.log('Distance:', distanceKilometers, 'kmts');
      //         console.log('Duration:', durationHours, 'hours');
      //   } catch (error) {
      //     console.error('Error:', error);
      //   }
      // }
      async function tripCalculator(origin, destinations) {
        console.log('tripCalculator', origin, destinations);
      
        try {
          // Geocode the origin
          const originResponse = await axios.get(`${MAPBOX_GEOCODING_URL}${encodeURIComponent(origin)}.json?access_token=${MAPBOX_API_KEY}`);
          const originCoordinates = originResponse.data.features[0].center.join(',');
      
          for (let i = 0; i < destinations.length; i++) {
            const destination = destinations[i].origin;
      
            // Geocode the destination
            const destinationResponse = await axios.get(`${MAPBOX_GEOCODING_URL}${encodeURIComponent(destination)}.json?access_token=${MAPBOX_API_KEY}`);
            const destinationCoordinates = destinationResponse.data.features[0].center.join(',');
      
            // Calculate the trip
            const directionsResponse = await axios.get(`${MAPBOX_DIRECTIONS_URL}${originCoordinates};${destinationCoordinates}.json?access_token=${MAPBOX_API_KEY}`);
            const data = directionsResponse.data;
            // console.log('data', data);
      
            // The distance of the trip in meters
            const distanceMeters = data.routes[0].distance;
      
            // The duration of the trip in seconds
            const durationSeconds = data.routes[0].duration;
      
            // Convert distance to kilometers (1 meter = 0.001 kilometers)
            const distanceKilometers = distanceMeters * 0.001;
      
            // Convert duration to hours (1 second = 0.000277778 hours)
            const durationHours = durationSeconds * 0.000277778;
      
            console.log(`Trip ${i + 1}:`);
            console.log('Distance:', distanceKilometers, 'kmts');
            console.log('Duration:', durationHours, 'hours');
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }


        const [startDateString, endDateString] = formatDates(dateRange);
        // Send a GET request to fetch loads matching the provided tag
        axios.get(`/loads?equipment=${tag}&startDate=${startDateString}&endDate=${endDateString}`)
  
        .then((response) => { 
                let dateFilteredResults = response.data

                       // ***** COUNTRY FILTER *****///
                 console.log('dateFilteredResults', dateFilteredResults, index.origin, index.destination);
                 let countryCodeOrigins = [];
                 let locationGroupArray = [].concat(...Object.values(locationGroup).map(group => group.map(country => country.abb.slice(-2))));
                  // console.log('locationGroupArray', locationGroupArray);
                 for (let i = 0; i < dateFilteredResults.length; i++) {
                    let originCountry = dateFilteredResults[i].origin.slice(-2);

                      if(dateFilteredResults[i].origin.slice(-2) === 'US' || dateFilteredResults[i].origin.slice(-2) === 'CA')  {
   //WORKGIN HERE !!! WORKING HERE !!! WORKING HERE !!!  WORKING HERE !!! WORKING HERE !!! WORKING HERE !!! WORKING HERE !!!
                          //NEED THE PROGRAM TO DISTINGUISH AND FILTER BY STATE WHEN US AND CA
                             if(originCountry === index.origin.slice(-2)) {
                                // console.log('MATCH', originCountry, index.origin.slice(-2));
                                countryCodeOrigins.push(dateFilteredResults[i]);  
                              }
  //WORKGIN HERE !!! WORKING HERE !!! WORKING HERE !!!  WORKING HERE !!! WORKING HERE !!! WORKING HERE !!! WORKING HERE !!!

                      } else  if(locationGroupArray.includes(index.origin.slice(-2))) {
                        // console.log('locationGroupArray', locationGroupArray, index.origin.slice(-2));
                        if(originCountry === index.origin.slice(-2)) {
                          // console.log('MATCH', originCountry, index.origin.slice(-2));
                          countryCodeOrigins.push(dateFilteredResults[i]);  
                        }
                    }
                 }
                 console.log('countryCodeOrigins', countryCodeOrigins);
                //  dateFilteredResults = countryCodeOrigins;

                      // ***** COUNTRY FILTER *****///


                       // ***** LOCATION CODE FILTER *****///
                // Check if location group exists and filter results
              if (locationGroup.hasOwnProperty(index.origin)) {
                originLocationGroup = true;
                let originLGresults
                    if(index.origin === 'Z2' || index.origin === 'Z3'){
                        originLGresults = dateFilteredResults.filter((result) => {
                        return locationGroup[index.origin].some((location) => location.abb === result.origin.slice(-6));
                      })  
                    } else {
                        originLGresults = dateFilteredResults.filter((result) => {
                      return locationGroup[index.origin].some((location) => location.abb === result.origin.slice(-2));
                });
              }

                if (originLGresults.length === 0) {
                }

                dateFilteredResults = originLGresults;

              } else if (index.origin !== undefined) {
              }
                // Repeat the same checks for destination
              if (locationGroup.hasOwnProperty(index.destination)) {
                destinationLocationGroup = true;
                let destinationLGresults; // Declare destinationLGresults here

                if(index.destination === 'Z2' || index.destination === 'Z3'){
                  destinationLGresults = dateFilteredResults.filter((result) => {
                    return locationGroup[index.destination].some((location) => location.abb === result.destination.slice(-6));
                  })  
                } else {
                  destinationLGresults = dateFilteredResults.filter((result) => {
                    return locationGroup[index.destination].some((location) => location.abb === result.destination.slice(-2));
                  });
                }

                if (destinationLGresults.length === 0) {
                }

                dateFilteredResults = destinationLGresults;
              } 
                  else if (index.destination !== undefined) {
              }
              if (originLocationGroup === true && destinationLocationGroup === true) {
                
                
                if (index.origin === index.destination) {
                    console.log('intraZone', dateFilteredResults);
                    let intraZone = dateFilteredResults.filter((result) => {
                      const originGroup = locationGroup[index.origin];
                      const destinationGroup = locationGroup[index.destination];
                      const sliceLength = index.origin === 'Z2' || index.origin === 'Z3' ? -6 : -2;


                      return (
                        originGroup.some((location) => location.abb === result.origin.slice(sliceLength)) &&
                        destinationGroup.some((location) => location.abb === result.destination.slice(sliceLength))
                      )
                    });

                    dateFilteredResults = intraZone;
        
                  } else if (index.origin !== index.destination) { //INTERZONE searches are not allowed by the API, restricting for now
                    let interZone = dateFilteredResults.filter((result) => {
                      const originGroup = locationGroup[index.origin];
                      const destinationGroup = locationGroup[index.destination];
                      const sliceLengthOrigin = index.origin === 'Z2' || index.origin === 'Z3' ? -6 : -2;
                      const sliceLengthDestination = index.destination === 'Z2' || index.destination === 'Z3' ? -6 : -2;
                
                      return (
                        originGroup.some((location) => location.abb === result.origin.slice(sliceLengthOrigin)) &&
                        destinationGroup.some((location) => location.abb === result.destination.slice(sliceLengthDestination))
                      )
                    });
                    dateFilteredResults = interZone;

                  }

              }
              let locationGroupFilter = dateFilteredResults
              console.log('locationGroupFilter', locationGroupFilter);
                       // ***** LOCATION CODE FILTER *****///



                      //*** DEAD HEAD FILTER***//
        //MAIN FUNCTION DONE ALREADY WORKING AND TESTING WITH MAPBOX... SCROLL UP TO SEE IT                      
        // tripCalculator(index.origin , locationGroupFilter);
      
                    //*** DEAD HEAD FILTER***//

          // tripCalculator( index.origin , locationGroupFilter);


        })
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
    }
    
    handleDateRangeChange = async (startDate, endDate, index) => {
        const startDateString = startDate ? startDate.toLocaleDateString() : '';
        const endDateString = endDate ? endDate.toLocaleDateString() : '';
      
        const updatedSearches = [...this.state.searches];
        let placeholderText = '';
      
        if (startDate && endDate) {
          updatedSearches[index].dateRange = `${startDateString} - ${endDateString}`;
          placeholderText = `${startDateString} - ${endDateString}`;
        } else if (startDate) {
          updatedSearches[index].dateRange = startDateString;
          placeholderText = startDateString;
        }
      
        // Update the searches and placeholderText state
        this.setState({
          searches: updatedSearches,
          placeholderText,
        });

    }


    //SEARCH RESULTS FUNCTIONS


    onHandleSorting = async (header) => {
      try {
          this.setState(
              (prevState) => {
                  let direction = 'ascending';
                  if (prevState.sortConfig.key === header && prevState.sortConfig.direction === 'ascending') {
                      direction = 'descending';
                  }
      
                  // Return the updated state
                  return { sortConfig: { key: header, direction } };
              },
              () => {
                  console.log('Sort config after update:', this.state.sortConfig);
                  const { results, sortConfig } = this.state;
                  let sortedResults;
                  if (sortConfig.key) {
                      console.log('results', results)
                      sortedResults = [...results].sort((a, b) => {
                        if (sortConfig.direction === 'ascending') {
                          // You can add logic for different headers
                          switch (sortConfig.key) {
                            case 'Age':
                              return a.age - b.age;
                            case 'Date':
                              return a.date.localeCompare(b.date);
                            case 'Equipment':
                              return a.equipment.localeCompare(b.equipment);
                            // Add more cases for other headers
                            case 'Origin DH':
                              return a.originDH - b.originDH;
                            case 'Origin':
                              return a.origin.localeCompare(b.origin);
                            case 'Destination DH':
                              return a.destinationDH - b.destinationDH;
                            case 'Destination':
                              return a.destination.localeCompare(b.destination);
                            case 'Miles':
                              return a.miles - b.miles; // Sort by miles
                            case 'Company':
                              return a.company.localeCompare(b.company);
                            case 'Contact':
                              return a.contact.localeCompare(b.contact);
                            case 'Length':
                              return parseFloat(a.length) - parseFloat(b.length);
                            case 'Weight':
                              return parseFloat(a.weight) - parseFloat(b.weight);
                            case 'Rate':
                              return parseFloat(a.rate) - parseFloat(b.rate);
                            default:
                              return 0;
                          }
                        } else {
                          switch (sortConfig.key) {
                              case 'Age':
                                return b.age - a.age;
                              case 'Date':
                                return b.date.localeCompare(a.date);
                              case 'Equipment':
                                return b.equipment.localeCompare(a.equipment);
                              // Add more cases for other headers
                              case 'Origin DH':
                                  return b.originDH - a.originDH;
                                case 'Origin':
                                  return b.origin.localeCompare(a.origin);
                                case 'Destination DH':
                                  return b.destinationDH - a.destinationDH;
                                case 'Destination':
                                  return b.destination.localeCompare(a.destination);
                                case 'Miles':
                                  return b.miles - a.miles; // Sort by miles in descending order
                                case 'Company':
                                  return b.company.localeCompare(a.company);
                                case 'Contact':
                                  return b.contact.localeCompare(a.contact);
                                case 'Length':
                                  return parseFloat(b.length) - parseFloat(a.length);
                                case 'Weight':
                                  return parseFloat(b.weight) - parseFloat(a.weight);
                                case 'Rate':
                                  return parseFloat(b.rate) - parseFloat(a.rate);
                              
                              default:
                                return 0;
                              }
                            }
                          });
                          console.log('Sorted Results', sortedResults);
  
                      } else {
                        // If no sorting key, use the original order
                        sortedResults = [...results];
                      }
  
                      this.setState({ results: sortedResults })                     
            }
          );
      } catch (error) {
          console.error('Error:', error);
      }
  }
  
    onHandleOriginChange = (newOrigin, index) => {
        const newSearches = [...this.state.searches];
        newSearches[index].origin = newOrigin;
        if(newOrigin === 'Z0' || newOrigin === 'Z1') {
            this.setState({selectedOriginGroup: true})
        } else {
          this.setState({selectedOriginGroup: false})
        }
        this.setState({
          searches: newSearches,
        });
    }


    onHandleDestinationChange = (newDestination, index) => {
        const newSearches = [...this.state.searches];
        newSearches[index].destination = newDestination;
        if(newDestination === 'Z0' || newDestination === 'Z1') {  
          this.setState({selectedDestinationGroup: true})
        } else {
          this.setState({selectedDestinationGroup: false})
        }

        this.setState({
          searches: newSearches,
        });

    }

    locationGroups = (results) => {
    

    }

    
    

    render() { 
        return (
            <div>
                <h1>SEARCH  LIST</h1>
                <div id='newSearchButton'>
                      <button onClick={this.newSearch} 
                      type="button" 
                      className="btn btn-primary"
                      disabled={!this.state.searchResolved}
                      >New Search</button>
                </div>

                <div id='searchList'>
                    {this.state.searches.map((search, index) => (
                        <div key={index} id='form' className='container bg-secondary border child mb-1'>
                            <div className='overlay' 
                                 onClick={(e)=>this.onEntryClick(e, index, search.equipment)}>
                                <div className='card-body' >
                                    <form onSubmit={(e) => this.onSubmit(e, index)}
  
                                            >
                                        <select
                                            name='equipment'
                                            disabled={search.searchClicked}
                                            onChange={e => this.onChange(e, index)}
                                            value={search.equipment}

                                            >
                                            {/*Provide Options*/}
                                            <option value='select'>Equipment</option>
                                            <option value='Flatbed'>FlatBed</option>
                                            <option value='Van'>Van</option>
                                            <option value='Reefer'>Reefer</option>
                                        </select>

                                        <DatePicker 
                                        disabled={search.searchClicked} 
                                        onDateRangeChange={(startDate, endDate) => this.handleDateRangeChange(startDate, endDate, index)} 
                                        dateRange={search.dateRange}
                                        />
                                        <AutoSugestDropDown
                                          name='origin'
                                          value={search.origin}
                                          onChange={(e) => this.onChange(e, index)}  
                                          disabled={search.searchClicked}
                                          onHandleOriginChange={this.onHandleOriginChange}
                                          index={index}
                                          origin={search.origin}
                                        />
                                        <input type='number' name='originDH' 
                                        value={search.originDH  > 100 ? 100 : search.originDH} 
                                        onChange={e => this.onChange(e, index)} 
                                        disabled={search.searchClicked || this.state.selectedOriginGroup} />

                                        <AutoSuggestDropDownDestination
                                              name='destination'
                                              value={search.destination}
                                              onChange={(e) => this.onChange(e, index)}  
                                              disabled={search.searchClicked}
                                              onHandleDestinationChange={this.onHandleDestinationChange}
                                              index={index}
                                              destination={search.destination}
                                          

                                        />
                                        <input type='number' name='destinationDH' 
                                        value={search.destinationDH > 100 ? 100 : search.destinationDH} 
                                        onChange={e => this.onChange(e, index)} 
                                        disabled={search.searchClicked || this.state.selectedDestinationGroup} />
                                       
                                       
                                       
                                       
                                        <select name="age" value={search.age} onChange={e => this.onChange(e, index)} disabled={search.searchClicked}>
                                            <option value='2'>2</option>
                                            <option value='4'>4</option>
                                            <option value='6'>6</option>
                                            <option value='8'>8+</option>
                                        </select>
                                    </form>
                                </div>
                                <div className="btn-group" role="group" aria-label="Basic example">
                                {!search.searchClicked && !search.editing ? (
                                    <button
                                        type='submit'
                                        className="btn btn-primary"
                                        onClick={e => this.onSubmit(e, index,  this.state.isNewSearch, search._id)}
                                    >
                                        SEARCH
                                    </button>
                                ) : null}
                                 {!search.searchClicked && !search.editing ? (
                                    <button
                                        type='submit'
                                        className="btn btn-secondary"
                                        onClick={e => this.cancelNewSearch(e, index, search._id)}
                                    >
                                        CANCEL
                                    </button>
                                ) : null}
                                {search.searchClicked ? (
                                    <button
                                        type='button'
                                        className="btn btn-primary"
                                        onClick={e => this.onEdit(e, index)}
                                    >
                                        EDIT
                                    </button>
                                ) : null}                                
                                {search.searchClicked ? (
                                    <button
                                        type='button'
                                        className="btn btn-danger"
                                        onClick={(e) => {e.stopPropagation(); this.onDelete(e, index, search._id)}}
                                        
                                    >
                                        DELETE
                                    </button>
                                ) : null}
                                {search.editing ? (
                                    <button
                                        type='button'
                                        className="btn btn-primary"
                                        onClick={e => this.onEditSave(index, search._id, search.equipment)}
                                    >
                                        SAVE
                                    </button>
                                ) : null}
                                {search.editing ? (
                                    <button
                                        type='button'
                                        className="btn btn-secondary"
                                        onClick={e => this.onEditSave(index, search._id, search.equipment)}
                                    >
                                        CANCEL
                                    </button>
                                ) : null}
                            </div>
                            </div>   
                        </div>
                    ))}
                </div>

                <div id='resultList'>
                        <h1>Search Results</h1>
                        {this.state.isLoading ? (
                          <LoadingSpinner/>
                        ) : (
                          this.state.results.length === 0 ? (
                            <p> Please create or Select a search!!</p>
                          ) : (   
                            <div>
                              <p>{this.state.results.length} results in DB!!</p>
                              <table className="table">
                                <thead>
                                  <tr>
                                    <th scope="col" onClick={() => this.onHandleSorting('Age')}>Age</th>
                                    <th scope="col" onClick={() => this.onHandleSorting('Date')}>Date</th>
                                    <th scope="col" onClick={() => this.onHandleSorting('Equipment')}>Equipment</th>
                                    <th scope="col" onClick={() => this.onHandleSorting('Origin DH')}>Origin DH</th>
                                    <th scope="col" onClick={() => this.onHandleSorting('Origin')}>Origin</th>
                                    <th scope="col" onClick={() => this.onHandleSorting('Destination DH')}>Destination DH</th>
                                    <th scope="col" onClick={() => this.onHandleSorting('Destination')}>Destination</th>
                                    <th scope="col" onClick={() => this.onHandleSorting('Miles')}>Miles</th>
                                    <th scope="col" onClick={() => this.onHandleSorting('Company')}>Company</th>
                                    <th scope="col" onClick={() => this.onHandleSorting('Contact')}>Contact</th>
                                    <th scope="col" onClick={() => this.onHandleSorting('Length')}>Length</th>
                                    <th scope="col" onClick={() => this.onHandleSorting('Weight')}>Weight</th>
                                    <th scope="col" onClick={() => this.onHandleSorting('Rate')}>Rate</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {this.state.results.map((result, index) => (
                                    <tr key={index}>
                                      <td>{result.age}</td>
                                      <td>{result.date}</td>
                                      <td>{result.equipment}</td>
                                      <td>{result.originDH}</td>
                                      <td>{result.origin}</td>
                                      <td>{result.destinationDH}</td>
                                      <td>{result.destination}</td>
                                      <td>{result.distance}</td>
                                      <td>{result.company}</td>
                                      <td>{result.contact}</td>
                                      <td>{result.length}</td>
                                      <td>{result.weight}</td>
                                      <td>${result.rate}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )
                        )}
                      </div>

                
            </div>
        );
    }
}
 
export default CarrierSearchList;