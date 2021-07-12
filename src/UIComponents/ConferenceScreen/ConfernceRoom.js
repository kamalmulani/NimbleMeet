import React, {Component} from 'react';
import './ConferenceRoom.css';
import Participant from './Participant';
import {db} from '../../firebase'
import {Grid} from '@material-ui/core';

class ConferenceRoom extends Component {
    constructor(props) {
        super(props);

        this.leaveRoom = this.leaveRoom.bind(this);
        this.resizeGrid = this.resizeGrid.bind(this);
      
        this.state = {

          // List of participants
          remoteParticipants: Array.from(this.props.room.participants.values()),

          // normalize css to apply to every element
          videoStyle:`.track video{
                        
                      }
                      `, 

          gridSize: 6, // initialise grid size to 2 columns
          displayRoomName:'',
          
        }
        
      }

      componentDidMount() {

        this.props.room.on('participantConnected', participant => this.addParticipant(participant));
        this.props.room.on('participantDisconnected', participant => this.removeParticipant(participant));
        
        window.addEventListener("beforeunload", this.leaveRoom);
        
        this.resizeGrid();

        db.collection('Meetings').doc(this.props.room.name).get().then(room =>{
          
          this.setState({displayRoomName: room.data().name})
        })

      }

      componentWillUnmount() {
        this.leaveRoom();
      }

      leaveRoom() {
        this.props.room.disconnect();
        this.props.returnToMain();
      }

      addParticipant(participant) {

        this.setState({
          remoteParticipants: [...this.state.remoteParticipants, participant]
        });

       this.resizeGrid();

      }
    
      removeParticipant(participant) {

        this.setState({
          remoteParticipants: this.state.remoteParticipants.filter(p => p.identity !== participant.identity)
        });

        this.resizeGrid();

      }

      /* Function to calculate the size of each video element to fit all video screens
         to the videoPannel */
      
      resizeGrid(){

        var numParticipants = this.state.remoteParticipants.length + 1
        var numColumns = 2 // number of column *initilize with 2
        if(numParticipants > 4){
          numColumns = 3
        }
        else if(numParticipants > 6){
          numColumns = 4
        }
        
        // claculate number of rows
        var numRows = (numParticipants % numColumns == 0) ? 
                      (numParticipants/numColumns) : (numParticipants+numColumns-1) / numColumns

        // height of each video element
        var heightOfVideo = ((document.getElementById("videoPannel").clientHeight - 100) / numRows)+'px'

        // apply normalised css for every video element for height
       /* var videoStyle= createMuiTheme({
          overrides: {
            MuiCssBaseline: {
              '@global': {
                video: {
                  maxHeight: heightOfVideo,
                },
              },
            },
          },
        })
        */

        var videoStyle = `.track video{
                           max-height:`+heightOfVideo+` !important
                          }
                          
                          `
        this.setState({videoStyle: videoStyle, gridSize: (12/numColumns)})

        

        //this.setState({gridSize : 12/numColumns});
      }      

      render() {
        
        return (
          
            <Grid
          container
          style={{margin:'auto'}}
          justify="center"
          alignContent='center'
          wrap='wrap'
          alignItems="center"         
          direction='row'
          spacing={1}
          className = "participants">
            <style>{this.state.videoStyle}</style>
            <div className="displayedRoomName">{this.state.displayRoomName}</div>
            
              <Participant key={this.props.room.localParticipant.identity} 
                           localParticipant="true" 
                           participant={this.props.room.localParticipant} 
                           gridSize={this.state.gridSize} />
              {

                this.state.remoteParticipants.map(participant => 
                  <Participant key={participant.identity} participant={participant}
                  gridSize={this.state.gridSize} />
                )

              }
              
              
            </Grid>
          
        );
      }
  
}

export default ConferenceRoom;
