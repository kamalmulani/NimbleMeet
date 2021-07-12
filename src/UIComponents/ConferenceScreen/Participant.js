import React, {Component} from 'react';
import DataTrack from './DataTrack';
import './Participant.css';
import { Grid, IconButton, Paper } from '@material-ui/core';
import { MicOff } from '@material-ui/icons';
import { db } from '../../firebase';

class Participant extends Component {
    constructor(props) {
        super(props);
      
        const existingPublications = Array.from(this.props.participant.tracks.values());
        const existingTracks = existingPublications.map(publication => publication.track);
        const nonNullMediaTracks = existingTracks.filter(track => track !== null && track.kind!='data')
       
        this.state = {
          tracks: nonNullMediaTracks,
          uid:this.props.participant.identity,
          gridSize: this.props.gridSize,
          userName:'',
          userDetails:{},
          muted: true
        }

      }

      componentDidMount() {
        // Subscribe to listen all the published tracks of participant
        if (!this.props.localParticipant) {
          this.props.participant.on('trackSubscribed', track => this.addTrack(track));
        }
        db.collection('users').doc(this.state.uid).get().then( userDoc =>
          {
            const userData = userDoc.data();
            
            this.setState({userName: userData.displayName, userDetails: userDoc.data()})
          })
      }

      addTrack(track) {
        if(track.kind == "data"){
          track.on('message', data => {
            var dataObj = JSON.parse(data)
            alert(dataObj['from'] + " sent "+dataObj['message'])
          });
        }
        else{
        this.setState({
          tracks: [...this.state.tracks, track]
        });

        if(track.kind == "audio"){
          this.setState({muted: track.isEnabled})
          track.on('disabled', track => {if(track.kind == 'audio'){this.setState({muted: false})}});
          track.on('enabled', track => {if(track.kind == 'audio'){this.setState({muted: true})}})
        }
      }

      }

      static getDerivedStateFromProps(props, state){
        return {
          gridSize: props.gridSize
        }
      }

      

      render() {
          

        return ( 
          <Grid  item xs={6} sm={this.state.gridSize} 
                 className="participant" 
                 id={this.props.participant.identity}>

            <Paper className="participantMediaContainer" elevation={3}>
            { 
              this.state.tracks.map(track => 
                <DataTrack key={track} filter={this.state.filter} track={track}/>)
            }
            <Grid container justify='center' className="participantOptions">  

            

               <div className="participantName" >{ this.state.userName }</div>
             </Grid >
            </Paper>
          </Grid>
        );
      }
}

export default Participant;
