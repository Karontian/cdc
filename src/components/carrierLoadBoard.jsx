import React, { Component } from 'react';
import NavBar from './navBar';
import CarrierSearchList from './carrierSearchList';
class CarrierLoadBoard extends Component {
    render() { 
        return (
            <div>
                <NavBar />
                <div id="board" style={{ height: "500px", backgroundColor: "lightgray" }}>
                    <CarrierSearchList/>
                    {/* Your "Board" content */}
                </div>

                <div id="option1" style={{ height: "500px", backgroundColor: "lightblue" }}>
                    {/* Your "Option 1" content */}
                </div>

                <div id="option2" style={{ height: "500px", backgroundColor: "lightgreen" }}>
                    {/* Your "Option 2" content */}
                </div>
            </div>
        );
    }
}
 
export default CarrierLoadBoard;