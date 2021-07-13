import { Grid, Typography, Container } from '@material-ui/core';
import { AccountBox, Duo, VideoCall, ExitToApp } from '@material-ui/icons';
import React,{Component} from 'react';
import {auth} from '../../firebase'
import "./AppMenu.css"
import UserProfile from './UserProfile';
import MeetingsList from './MeetingsList';

class AppMenu extends Component {
    constructor(props) {
        super(props);

        this.screenRouter = this.screenRouter.bind(this); // method to show the sclected screen
        this.changeScreen = this.changeScreen.bind(this); // method to change the sclected screen

        this.state = { 
            selectedScreen :'', // state of the sclected screen default is empty screen
            user:this.props.user, // the user data
         }
    }

    changeScreen(screenTitle){
        this.setState({selectedScreen: screenTitle}) // change the screen based on selected option
    }

    screenRouter(){

        // show the screen based on selected option
        // If no screen is selected show default screens i.e, options

        if(this.state.selectedScreen == ''){
            return(
                <Container maxWidth="md">
                <Grid container justify='center'
                alignItems='center' spacing={2} className="optionsContainer">

                <Grid item xs={6} >
                    <div className="option" id="startMeetings" onClick={this.props.initiateMeeting}>
                    <VideoCall className="optionsIcon" />
                    <Typography>Start Meeting</Typography>
                    </div>
                </Grid> 

                <Grid item xs={6} >
                    <div className="option" id="meetings" 
                    onClick={() => this.changeScreen('meetingScreen')}>      
                    <Duo className="optionsIcon" />
                    <Typography>All Meetings</Typography>
                    </div>
                </Grid>  

                <Grid item xs={6} >
                    <div className="option" id="userProfile" 
                    onClick={() => this.changeScreen('userProfile')}>
                    <AccountBox className="optionsIcon" />
                    <Typography>User Profile</Typography>
                    </div>
                </Grid>

                <Grid item xs={6} >
                    <div className="option" id="logOut" onClick={() => auth.signOut()}>
                    <ExitToApp className="optionsIcon" />
                    <Typography>Log Out</Typography>
                    </div>
                </Grid>

            </Grid>
            </Container>
            )
        }

        else if(this.state.selectedScreen == 'userProfile'){
            return (<UserProfile user={this.props.user} 
                     changeScreen={this.changeScreen} />)
        }

        else if(this.state.selectedScreen == 'meetingScreen'){
            return(<MeetingsList 
                user={this.props.user} changeScreen={this.changeScreen} 
                toogleStartMeetingScreen={this.props.toogleStartMeetingScreen} />)
        }
    }

    render() { 
        return (
            <>
             {this.screenRouter()}
            </>
            
         );
    }
}
 
export default AppMenu;