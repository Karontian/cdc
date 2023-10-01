import React, { Component } from 'react';

class NavBar extends Component {
    render() {
        return (
            <div style={{margin:'20px 20px'}}>
                <a style={{marginRight: '10px', marginLeft: '10px'}} href="#board">Board</a>
                <a style={{marginRight: '10px'}} href="#option1">Option 1</a>
                <a style={{marginRight: '10px'}} href="#option1">Option 2</a>
                <a style={{marginLeft: '800px'}}href="#option3">UserProfile</a>
                <span>/</span>  
                <a href="#option4">UserTypeLogo</a>
            </div>
        );
    }
}

export default NavBar;
