import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'
import axios from 'axios'; // Import Axios
import DatePicker from './utils/datePicker';
import 'react-date-range/dist/styles.css'; // Import styles
import 'react-date-range/dist/theme/default.css'; // Import theme styles

axios.defaults.baseURL = 'http://localhost:3002'

class CarrierSearchList extends Component {
    state = { 
        sortConfig: {
            key: '',
            direction: 'ascending',
        },
        results: [
            {
                age: 2,
                date: '10/10/2023',
                equipment: 'FlatBed',
                originDH: '100',
                origin: 'Buenos Aires',
                destinationDH: '200',
                destination: 'Sao Paulo',
                company: 'Transporte SA',
                contact: '+54 11 1234 5678', // Argentina
                length: '40 ft',
                weight: '25,000 lbs',
                rate: '500',
            },
            {
                age: 4,
                date: '10/12/2023',
                equipment: 'Van',
                originDH: '150',
                origin: 'Lima',
                destinationDH: '250',
                destination: 'Bogota',
                company: 'Cargo Express',
                contact: '+51 987 654 321', // Peru
                length: '30 ft',
                weight: '20,000 lbs',
                rate: '600',
            },
            {
                age: 6,
                date: '10/15/2023',
                equipment: 'Reefer',
                originDH: '100',
                origin: 'Mexico City',
                destinationDH: '300',
                destination: 'Montevideo',
                company: 'Logistics Inc.',
                contact: '+52 55 1234 5678', // Mexico
                length: '45 ft',
                weight: '28,000 lbs',
                rate: '700',
            },
            {
                age: 2,
                date: '10/17/2023',
                equipment: 'FlatBed',
                originDH: '200',
                origin: 'Santiago',
                destinationDH: '100',
                destination: 'Rio de Janeiro',
                company: 'TransCargo',
                contact: '+56 2 9876 5432', // Chile
                length: '40 ft',
                weight: '24,000 lbs',
                rate: '550',
            },
            {
                age: 4,
                date: '10/20/2023',
                equipment: 'Van',
                originDH: '100',
                origin: 'Bogota',
                destinationDH: '150',
                destination: 'Lima',
                company: 'Express Logistics',
                contact: '+57 1 123 4567', // Colombia
                length: '30 ft',
                weight: '22,000 lbs',
                rate: '580',
            },
            {
                age: 6,
                date: '10/22/2023',
                equipment: 'Reefer',
                originDH: '200',
                origin: 'Rio de Janeiro',
                destinationDH: '250',
                destination: 'Sao Paulo',
                company: 'CargoMasters',
                contact: '+55 11 4321 8765', // Brazil
                length: '45 ft',
                weight: '26,000 lbs',
                rate: '650',
            },
            {
                age: 2,
                date: '10/25/2023',
                equipment: 'FlatBed',
                originDH: '150',
                origin: 'Sao Paulo',
                destinationDH: '100',
                destination: 'Buenos Aires',
                company: 'Cargo Transport',
                contact: '+54 11 8765 4321', // Argentina
                length: '40 ft',
                weight: '23,000 lbs',
                rate: '560',
            },
            {
                age: 4,
                date: '10/27/2023',
                equipment: 'Van',
                originDH: '100',
                origin: 'Montevideo',
                destinationDH: '200',
                destination: 'Mexico City',
                company: 'FastCargo',
                contact: '+598 2 1234 5678', // Uruguay
                length: '30 ft',
                weight: '21,000 lbs',
                rate: '590',
            },
            {
                age: 6,
                date: '10/30/2023',
                equipment: 'Reefer',
                originDH: '200',
                origin: 'Lima',
                destinationDH: '250',
                destination: 'Santiago',
                company: 'Peru Transport',
                contact: '+51 999 888 777', // Peru
                length: '45 ft',
                weight: '27,000 lbs',
                rate: '630',
            },
            {
                age: 2,
                date: '11/1/2023',
                equipment: 'FlatBed',
                originDH: '100',
                origin: 'Buenos Aires',
                destinationDH: '200',
                destination: 'Sao Paulo',
                company: 'Transporte SA',
                contact: '+54 11 1234 5678', // Argentina
                length: '40 ft',
                weight: '25,000 lbs',
                rate: '500',
            }
        ], //Results to display coming from the DB to the searchResults table
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
        
    } 
    componentDidMount() {
          axios.get('/newSearch') // Make a GET request to the server route
            .then((response) => {
                const formattedSearches = response.data.map((search) => ({
                    ...search,
                    // dateRange: search.dateRange.split('T')[0], // Extract date part only
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
            dateRange: 'Select Date Range',
            origin: '',
            originDH: '100',
            destination: '',
            destinationDH: '100',
            age: '2',
            searchClicked: false, // Initialize searchClicked to false for the new search
            editing: false,
            createdAt : Date.now()

        };
        this.setState({
            isNewSearch: true, // Set isNewSearch to true
            searches: [...this.state.searches, newSearchData],
            searchResolved: false, // Set searchResolved to false
        });
    }

    onChange = (e, index) => {//e is the event, index is the index of the search in the searches array
        e.preventDefault(); // Prevent form submission
        const newSearches = this.state.searches.slice();
        newSearches[index][e.target.name] = e.target.value;
        this.setState({
          searches: newSearches,
        });
      }
      
    onSubmit = async (e, index, updateTag, id) => {
        e.preventDefault()
        console.log('onSubmit', this.state.searches[index]);
        
        if (index >= 0 && index < this.state.searches.length) {
                const newSearchData = this.state.searches[index];
                                          // Check if equipment is selected
                              if (newSearchData.equipment === '' || newSearchData.equipment === 'select') {
                                  alert('Please select equipment type');
                                  return;
                              }
                 newSearchData.searchClicked = true; // Set searchClicked to true
                try {
                  // Make a POST request to your server using Axios
                  const response = await axios.post('/newSearch', newSearchData);
            
                  if (response.status === 201) {
                    // Handle success, e.g., show a success message or reset the form              
                    this.setState({
                      searchResolved: true, // Set searchResolved to true
                      searchClickedIndex: index, // Set the clicked index
                    });
                    this.fetchLoadsData();
                    this.onEntryClick(e, index);
                  } else {
                    // Handle error, e.g., show an error message
                    console.error('Error adding NewSearch:', response.statusText);
                  }
                } catch (error) {
                  console.error('Error:', error);
                }
              } 
    }
      
    onDelete = async (e, index, id) => {
            e.preventDefault();
            try {
              if (id) {
                // If there's an ID, make a DELETE request with it
                const response = await axios.delete(`/newSearch/${id}`);
                const updatedSearches = this.state.searches.filter((search) => search._id !== id);
                this.setState({
                  searches: updatedSearches,
                  searchResolved: true,
                  searchClickedIndex: -1,
                });
          
                if (response.status === 200) {
                  console.log('Search entry deleted successfully');
                } else {
                  console.error('Error deleting search entry:', response.statusText);
                }
              } else {
                // If there's no ID, simply remove the item from the state
                const updatedSearches = this.state.searches.slice(); // Create a shallow copy of the searches array
                updatedSearches.splice(index, 1); // Remove the item at the specified index
                this.setState({
                  searches: updatedSearches,
                  searchResolved: true,
                  searchClickedIndex: -1,
                });
              }
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
    
    onEditSave = async (e, index, id, status) => {
        try{
            const searchData = this.state.searches[index];
                    if (searchData.equipment === 'select') {
                        alert('Please select equipment type');
                        return;
                    }
        
            if(id){
                const response = await axios.put(`/newSearch/${id}`, searchData);
                const formattedDate = response.data.dateRange.split('T')[0];

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
                    this.fetchLoadsData();
                                    
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
                    this.fetchLoadsData();                                  
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

    onEntryClick = (e, index) => {} // This is a placeholder for now

    fetchLoadsData = async () => {
        axios.get('/loads')
        .then((response) => {
          console.log(response.data);
          this.setState({
            loads: response.data,
          });
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
    }        

    handleDateRangeChange = async (startDate, endDate, index) => {
        console.log(this.state.searches[index]);
        const startDateString = startDate ? startDate.toLocaleDateString() : '';
        const endDateString = endDate ? endDate.toLocaleDateString() : '';
      
        let placeholderText = '';

        if (startDate && endDate) {
            const updatedSearches = [...this.state.searches];
            updatedSearches[index].dateRange = `${startDateString}-${endDateString}`;
            this.setState({ searches: updatedSearches });
        
            placeholderText = `${startDateString} - ${endDateString}`;

            // Rest of your code...
        } else if (startDate) {
            const updatedSearches = [...this.state.searches];
            updatedSearches[index].dateRange = startDateString;
            this.setState({ searches: updatedSearches });        
            placeholderText = startDateString;

        }
          // Update the placeholderText state
            this.setState({
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
                        <div key={index} id='form' className='container bg-dark border child mb-1'>
                            <div className='overlay' 
                                 onClick={e=>this.onEntryClick(e, index)}>
                                <div className='card-body'>
                                    <form onSubmit={(e) => this.onSubmit(e, index)}>
                                        <select
                                            name='equipment'
                                            disabled={search.searchClicked}
                                            onChange={e => this.onChange(e, index)}
                                            value={search.equipment}
                                            >
                                            {/*Provide Options*/}
                                            <option value='select'>Equipment</option>
                                            <option value='flatBed'>FlatBed</option>
                                            <option value='van'>Van</option>
                                            <option value='reefer'>Reefer</option>
                                        </select>

                                        <DatePicker 
                                        disabled={search.searchClicked} 
                                        onDateRangeChange={(startDate, endDate) => this.handleDateRangeChange(startDate, endDate, index)} 
                                        placeholderText={this.state.placeholderText}
                                        dateRange={search.dateRange}
                                        />

                                        {/* <input type='date' name='dateRange' value={search.dateRange} onChange={e => this.onChange(e, index)} disabled={search.searchClicked} /> */}

                                        <input type='text' name='origin' value={search.origin} onChange={e => this.onChange(e, index)} disabled={search.searchClicked} />
                                        <input type='number' name='originDH' value={search.originDH} onChange={e => this.onChange(e, index)} disabled={search.searchClicked} />
                                        <input type='text' name='destination' value={search.destination} onChange={e => this.onChange(e, index)} disabled={search.searchClicked} />
                                        <input type='number' name='destinationDH' value={search.destinationDH} onChange={e => this.onChange(e, index)} disabled={search.searchClicked} />
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
                                        onClick={e => this.onDelete(e, index, search._id)}
                                    >
                                        DELETE
                                    </button>
                                ) : null}
                                {search.editing ? (
                                    <button
                                        type='button'
                                        className="btn btn-primary"
                                        onClick={e => this.onEditSave(e, index, search._id, search.searchClicked)}
                                    >
                                        SAVE
                                    </button>
                                ) : null}
                            </div>
                            </div>   
                        </div>
                    ))}
                </div>

                <div id='resultList'>
                    <h1>Search Results</h1>
                    {this.state.results.length === 0 ? (
                            <p>0 results in the db</p>
                        ) : (
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
                                            <td>{result.company}</td>
                                            <td>{result.contact}</td>
                                            <td>{result.length}</td>
                                            <td>{result.weight}</td>
                                            <td>${result.rate}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
            </div>
        );
    }
}
 
export default CarrierSearchList;