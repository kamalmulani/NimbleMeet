import React, { Component } from "react";
import './SideDrawer.css'
import InCallChats from "./ChatScreen/InCallChats";

class SideDrawer extends Component {
    constructor(props) {
        super(props);
        this.state = { 
           visiblity: false,
           smallScreen: window.innerWidth < 800
         }
    }

    static getDerivedStateFromProps(props, state){
        return {
          visiblity: props.sideScreen,
        }
      }
      
    render() { 
        return ( 
            <div className={'sideDrawerOpen'+(this.state.visiblity?'':' sideDrawerClose')}>

              {this.props.room==null?<></>:  
              <InCallChats identity={this.props.identity} roomName={this.props.roomName} />}
           
            </div>
         );
    }
}
 
export default SideDrawer;