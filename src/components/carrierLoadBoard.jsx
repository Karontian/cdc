import React, { Component } from 'react';
import NavBar from './navBar';
import CarrierSearchList from './carrierSearchList';
class CarrierLoadBoard extends Component {
    render() { 
        return (
            <div>
                <NavBar />
                <div id="board" style={{ height: "1000px", backgroundColor: "lightgray" }}>
                    <CarrierSearchList/>
                    {/* Your "Board" content */}
                </div>
            </div>
        );
    }
}
 
export default CarrierLoadBoard;