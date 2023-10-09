import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'
import axios from 'axios'; // Import Axios

axios.defaults.baseURL = 'http://localhost:3002'

class CarrierSearchList extends Component {
    state = { 
        loads: [],
        searches: [],
        isNewSearch: false, // Flag to track new search entries
        displayForm: false,
        formData: {
            equipment: '',
            dateRange: {},
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
        // Fetch data from the server when the component mounts
        axios.get('/loads') // Make a GET request to the server route
          .then((response) => {
            // console.log(response.data);
            this.setState({
              loads: response.data, // Update the searches state with the fetched data
            });
          })
          .catch((error) => {
            console.error('Error fetching data:', error);
          });

          axios.get('/newSearch') // Make a GET request to the server route
            .then((response) => {
                console.log(response.data);
                const formattedSearches = response.data.map((search) => ({
                    ...search,
                    dateRange: search.dateRange.split('T')[0], // Extract date part only
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

     newSearch = () => {//e is the event, index is the index of the search in the searches array
        const date = new Date();
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        const dateStr = localDate.toISOString().substr(0, 10);

        const newSearchData = {
            equipment: '',
            dateRange: dateStr,
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
        console.log('index', this.state.searches[index]);
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
            // Make a DELETE request to the server with the item's 'id'
            const response = await axios.delete(`/newSearch/${id}`);
            const updatedSearches = this.state.searches.filter((search) => search._id !== id); // Filter out the item being deleted
            this.setState({
                searches: updatedSearches,
                searchResolved: true, // Set searchResolved to true if needed
                searchClickedIndex: -1, // Reset the clicked index
              });
          

            if (response.status === 200) {
              // Handle the successful deletion (e.g., show a success message)
              console.log('Search entry deleted successfully');
              // You might want to refresh your search list or update the UI accordingly
            } else {
              // Handle delete errors
              console.error('Error deleting search entry:', response.statusText);
            }
          } catch (error) {
            // Handle unexpected errors (e.g., network issues)
            console.error('Error:', error);
          }    
        }

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
                console.log('id', id);
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
                    // searchData.editing = false;
                    // searchData.searchClicked = true;
                                    
                  } else {
                    // Handle update errors
                    console.error('Error updating search entry:', response.statusText);
                  }

            } else {
                console.log('NOT ID', searchData, status);
                console.log(searchData.createdAt)
                let timeStamp = searchData.createdAt;
                const idResponse = await axios.get(`/getNewSearchId/${timeStamp}`); // Make a GET request to the server route
                console.log('idResponse', idResponse.data[0]._id);
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
                    // searchData.editing = false;
                    // searchData.searchClicked = true;
                                    
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

                                        <input type='date' name='dateRange' value={search.dateRange} onChange={e => this.onChange(e, index)} disabled={search.searchClicked} />
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
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col">Age</th>
                                    <th scope="col">Date</th>
                                    <th scope="col">Equipment</th>
                                    <th scope="col">Origin DH</th>
                                    <th scope="col">Origin</th>
                                    <th scope="col">Destination DH</th>
                                    <th scope="col">Destination</th>
                                    <th scope="col">Company</th>
                                    <th scope="col">Contact</th>
                                    <th scope="col">Length</th>
                                    <th scope="col">Weight</th>
                                    <th scope="col">Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.searchClickedIndex !== null && (
                                    <>
                                        <tr key={this.state.searchClickedIndex}>
                                            <td colSpan="12">Search {this.state.searchClickedIndex}</td>
                                        </tr>
                                        {this.state.loads.map((load, index) => (
                                            <tr key={index}>
                                                <td>{load.age}</td>
                                                <td>{load.date}</td>
                                                <td>{load.equipment}</td>
                                                <td>{load.originDH}</td>
                                                <td>{load.origin}</td>
                                                <td>{load.destinationDH}</td>
                                                <td>{load.destination}</td>
                                                <td>{load.company}</td>
                                                <td>{load.contact}</td>
                                                <td>{load.length}</td>
                                                <td>{load.weight}</td>
                                                <td>{load.rate}</td>
                                            </tr>
                                        ))}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>

            </div>
        );
    }
}
 
export default CarrierSearchList;