import React,{Component} from 'react';
import './App.css';
import {Container, Dialog, CircularProgress, Typography, DialogContent, DialogActions, DialogTitle, Button} from '@material-ui/core';
import ConferenceRoom from './UIComponents/ConferenceScreen/ConfernceRoom';
import SideDrawer from './UIComponents/SideDrawer/SideDrawer';
import BottomPannel from './UIComponents/BottomPannel/BottomPannel';
import {getUserData, writeUserData} from './firebaseFunctions';
import AppMenu from './UIComponents/AppMenu/AppMenu';
import MeetingSelectionScreen from './UIComponents/InitiateMeeting/MeetingSelectionScreen';
import StartMeetingScreen from './UIComponents/StartMeetingScreen/StartMeetingScreen';
const { connect, LocalDataTrack } = require('twilio-video');


class App extends Component {
  constructor(props) {
    super(props)
    this.joinRoom = this.joinRoom.bind(this);
    this.leaveRoom = this.leaveRoom.bind(this);
    this.returnToMain = this.returnToMain.bind(this);
    this.toogleDevice = this.toogleDevice.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.toogleSideScreen= this.toogleSideScreen.bind(this);
    this.initiateMeeting = this.initiateMeeting.bind(this);
    this.toogleStartMeetingScreen = this.toogleStartMeetingScreen.bind(this);
    
    this.state = {
      identity: this.props.user.uid,
      room: null, // room object 
      roomName: '',
      isLoggedIn: false,

      userAudio: true,
      userVideo: true,
      MeetingSelectionScreen: false,
      startMeetingScreen:false,
      connecting: false,
      connectingError:'',

      sideScreen: false, // Flag for the opening side Bar for chats,etc

      messageTrack: new LocalDataTrack({name:'message'}), //data track for sending messages
      tracks:[]

    }

  }

  initiateMeeting(){
    this.setState({MeetingSelectionScreen : !this.state.MeetingSelectionScreen});
  }

  toogleStartMeetingScreen(roomName = ''){
    this.setState({roomName: roomName, startMeetingScreen: !this.state.startMeetingScreen});
  }
  
/* Join a video call room using twilio function call and Twilio SFU server */
  async joinRoom(tracks, roomName) {
    this.setState({connecting: true})
    
    this.setState({MeetingSelectionScreen: false,});
    this.setState({roomName: roomName, startMeetingScreen: !this.state.startMeetingScreen})

    try {
      this.setState({roomName : roomName});

      // Fetch Twilio token for a unique identity to connect to the server for service

      const response = await fetch(`https://thistle-birman-7407.twil.io/videoToken?identity=${this.state.identity}`);
      const data = await response.json();
      
      
      const room = await connect(data.accessToken, {
        name: this.state.roomName, // unique room name
        tracks: tracks,
      });
  
      this.setState({ room: room, tracks:tracks});

      tracks.map(track => {
        if(track.kind == 'audio'){
          this.setState({userAudio : track.isEnabled})
        }
        else{
          this.setState({userVideo : track.isEnabled})
        }
      })

      // publish message track for all users
      room.localParticipant.publishTrack(this.state.messageTrack);
      this.setState({connecting: false})
      

    } catch(err) {
      
      this.setState({connecting: false})
      if(this.state.room !== null)
        this.leaveRoom();
      else{
        this.setState({connectingError: err.message})
      }
    }

  }

  // Function to send message across the peer network
  sendMessage( message ){
    this.state.messageTrack.send(
      JSON.stringify( {from:this.state.identity, message: message} )
      );
  }
 
  toogleDevice( device ){

    if(device === 'mic'){
      this.state.room.localParticipant.audioTracks.forEach(
        publication => {
          if(this.state.userAudio)
          publication.track.disable();
          else
          publication.track.enable();
        });
      this.setState({userAudio: !this.state.userAudio});
    }

    else{
      this.state.room.localParticipant.videoTracks.forEach(
        publication => {
          if(this.state.userVideo)
          publication.track.disable();
          else
          publication.track.enable();
        });
      this.setState({userVideo: !this.state.userVideo});
    }
      
  }

  toogleSideScreen(){
    this.setState({sideScreen : !this.state.sideScreen})
  }

  returnToMain() {
    this.state.tracks.map(track => {
      track.stop();
      track.detach();
    })
    this.setState({ room: null, sideScreen: false, 
                    userAudio: false, userVideo: false,tracks:[] });

  }

  leaveRoom() {
    this.state.tracks.map(track => {
      track.stop();
      track.detach();
    })
    this.state.room.disconnect();
    this.returnToMain();
  }
  

  render(){
    
    

    return (
    <div className="App">
      
      { this.state.startMeetingScreen? <StartMeetingScreen 
      joinRoom={this.joinRoom} toogleStartMeetingScreen={this.toogleStartMeetingScreen}
      roomName={this.state.roomName} />:<></>}
      
      <div className="videoPannel" id="videoPannel">
        {this.state.MeetingSelectionScreen ? <MeetingSelectionScreen 
        initiateMeeting={this.initiateMeeting} 
        toogleStartMeetingScreen={this.toogleStartMeetingScreen} user={this.props.user} />:<></>}
      
        {
          this.state.room !== null?
          // if connected to a call go to conference room
          <Container disableGutters maxWidth={false} 
           className={"conferenceRoom"+ (this.state.sideScreen?' conferenceRoomAside':'')}>

          <ConferenceRoom leaveRoom={this.leaveRoom} room={this.state.room}
                          returnToMain={this.returnToMain} />
          
          </Container>

          : <AppMenu user={this.props.user}
            initiateMeeting={this.initiateMeeting}
          toogleStartMeetingScreen={this.toogleStartMeetingScreen} /> // else go to the main screen

        }

        <SideDrawer sideScreen = {this.state.sideScreen} 
                    roomName={this.state.roomName} 
                    identity={this.state.identity} 
                    room={this.state.room} />

      </div>

        <Dialog open={this.state.connecting} >
          <DialogContent className="connectingDialog">
          <CircularProgress />
          <br />
          <br />
          <Typography>Connecting...</Typography>
          </DialogContent>
        </Dialog>

        <Dialog open={this.state.connectingError != ''}>
          <DialogTitle>
            ERROR!
          </DialogTitle>
          <DialogContent dividers>
            <Typography>{this.state.connectingError}</Typography>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="primary" onClick={() => this.setState({connectingError: ''})} > OKAY </Button>
          </DialogActions>
        </Dialog>
      
        <BottomPannel room={this.state.room} leaveRoom={this.leaveRoom} 
                      joinRoom={this.initiateMeeting}
                      toogleDevice={this.toogleDevice} 
                      userAudio={this.state.userAudio}
                      userVideo={this.state.userVideo} 
                      sideScreen={this.state.sideScreen}
                      sendMessage={this.sendMessage} 
                      toogleSideScreen={this.toogleSideScreen} />

    </div>

  )};
  
}

export default App
