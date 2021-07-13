import { Button, Dialog, DialogContent, DialogTitle, LinearProgress, Typography } from "@material-ui/core";
import {Mic, MicOff, Videocam, VideocamOff} from '@material-ui/icons'
import React,{Component} from "react";
import './StartMeetingScreen.css';
import pollAudioLevel from './audioLevel.js'
const { createLocalVideoTrack, createLocalAudioTrack} = require('twilio-video');


class StartMeetingScreen extends Component {
    constructor(props) {
        super(props);
        // start and store the local media tracks
        this.startLocalVideo = this.startLocalVideo.bind(this);
        this.startLocalAudio = this.startLocalAudio.bind(this);
        this.localVideoRef = React.createRef();
        this.localAudioRef = React.createRef();
        // methods to enable and disable the cam and mic
        this.toogleVideo = this.toogleVideo.bind(this);
        this.toogleAudio = this.toogleAudio.bind(this);
        this.closeScreen = this.closeScreen.bind(this);

        this.state = { 
            videoTrackError:'',
            videoTrack:null,
            audioTrack:null,
            audioTrackError:'',
            audioLevel:0,
            tracks:[],
            isVideoReady:false,
            isAudioReady: false,
         }
    }

    componentDidMount() {
        this._isMounted = true;
        this.startLocalVideo();
        this.startLocalAudio();
        
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    toogleVideo(){
        if(this.state.videoTrack.isEnabled)
        this.state.videoTrack.disable();
        else
        this.state.videoTrack.enable();
    }

    toogleAudio(){
        if(this.state.audioTrack.isEnabled)
        this.state.audioTrack.disable();
        else
        this.state.audioTrack.enable();
    }

    closeScreen(){
        try{
        this.state.videoTrack.stop();
        this.state.videoTrack.detach();        
        this.state.audioTrack.stop();
        }
        catch{
           
        }
        finally{
        this.props.toogleStartMeetingScreen();
        }
    }

    async startLocalVideo(){
        const videoTrack = await createLocalVideoTrack({aspectRatio:{exact:1}}).catch(err => {
            this.setState({videoTrackError: "video error : " + err.message});
        });
        
        try{
        var videoTrackChild = videoTrack.attach();
        this.localVideoRef.current.classList.add('localVideoTrackTest');
        this.localVideoRef.current.appendChild(videoTrackChild);
        this.setState({videoTrack: videoTrack, tracks: [...this.state.tracks,videoTrack]})
        }
        catch(error){
            console.log(error.message)
        }

        
        
    }

    

    async startLocalAudio(){
        const audioTrack = await createLocalAudioTrack().catch(err => {
            this.setState({audioTrackError: "Audio error : " + err.message});
        });
        
        if(audioTrack !== undefined){
        try{
        this.setState({audioTrack: audioTrack,tracks: [...this.state.tracks,audioTrack]});
        
        pollAudioLevel(audioTrack, level => {
            if(this._isMounted)
                this.setState({audioLevel: level*10, audioTrackError:''}) 
            else return;
        });
        }
        
        catch(error){
            this.setState({audioTrackError: error.message})
        }
        
        }
        
    }

    render() { 
        return ( 
            <Dialog open={true} maxWidth="md" fullWidth>
                <DialogTitle>Start Meeting</DialogTitle>
                <DialogContent dividers>
                <div id="DeviceConfigContainer">
                    <div id="trackContainer">
                <div id="video-local-tack" ref={this.localVideoRef}>
                <Typography>{this.state.videoTrackError}</Typography>
                </div>
                
                <div id="audio-local-tack" ref={this.localAudioRef}>
                <Typography id="audioLevelText">Audio Level: </Typography>
                <div> <LinearProgress variant="determinate" id="audioLevelMeter" value={this.state.audioLevel} /> </div>
                <Typography>{this.state.audioTrackError}</Typography>
                </div>
                
                
                </div>
                <div id="trackToogleButtons">
                    {this.state.videoTrack!=null?
                <Button variant="contained" color="primary" onClick={this.toogleVideo}>
                     {this.state.videoTrack.isEnabled? <Videocam />:<VideocamOff />}
                     Video 
                     </Button>:<></>}
                {this.state.audioTrack!=null?
                <Button variant="contained" color="primary" onClick={this.toogleAudio}>
                    {this.state.audioTrack.isEnabled? <Mic />:<MicOff />}
                     Audio </Button>:<></>}
                <Button onClick={this.closeScreen} variant="contained" color="secondary">Cancel</Button>
                {(this.state.videoTrack != null || this.state.audioTrack != null) ?
                <Button onClick={() => this.props.joinRoom( this.state.tracks,this.props.roomName)} variant="contained" style={{backgroundColor:'green',color:'white'}}>Start</Button>:<></>}
                </div>
                </div>
                </DialogContent>
                
            </Dialog>
         );
    }
}
 
export default StartMeetingScreen;
