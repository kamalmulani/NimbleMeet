import React,{Component} from 'react';
import './BottomPannel.css';
import {Grid, Container,Button, IconButton, Typography} from '@material-ui/core';
import { CallEnd, Chat, Mic, MicOff, Videocam, VideocamOff } from '@material-ui/icons';
import {auth} from '../../firebase'

class BottomPannel extends Component{
    constructor(props){
        super(props);
    }

    render() {
        // if the user is not in meeting return the application name
        if(this.props.room == null){
            return (
                <Container className="bottomPannel" justify="center" maxWidth={false}>
                    <Typography className="bottomTitle">NimbleMeet</Typography>            
                </Container>
            )
        }

        else{
            // else return the options for meeting
            return(
                <Container className="bottomPannel" maxWidth={false}>

                    <Grid container
                    direction="row"
                    justify="center"
                    alignItems="center"
                    className="bottomPannelButtonList"
                    spacing={2}
                    >
              
                    <Grid item>
                    <IconButton aria-label="camera toogle" className="camIcon"
                         style={{backgroundColor: this.props.userVideo?'blue':'red', 
                                 color:'white'}} 
                         onClick={()=> 
                            this.props.toogleDevice('cam')
                         }> 
                         {this.props.userVideo?
                            <Videocam />:
                            <VideocamOff />
                         }
                       </IconButton>
                    </Grid>

                    <Grid item>
                    <IconButton aria-label="mic Toogle" className="micIcon"
                        style={{backgroundColor:this.props.sideScreen?'blue':'red',
                                color:'white'}} 
                        onClick={()=> 
                            this.props.toogleSideScreen()
                        }> 
                        <Chat />
                    
                    </IconButton>
                    </Grid>

                    <Grid item>
                    <IconButton aria-label="Chat" className="chatIcon"
                        style={{backgroundColor:this.props.userAudio?'blue':'red',
                                color:'white'}} 
                        onClick={()=> 
                            this.props.toogleDevice('mic')
                        }> 
                        {this.props.userAudio? <Mic /> : <MicOff /> }
                    
                    </IconButton>
                    </Grid>

                    <Grid item>
                    <Button variant="contained"
                            color="secondary" size='large'
                            className="endCallButton"
                            onClick={this.props.leaveRoom}> 
                            END CALL 
                    </Button>

                    <IconButton aria-label="End Call"
                                style={{backgroundColor:'red', color:'white'}} 
                                onClick={this.props.leaveRoom}
                                className="endCallIcon"> 
                                <CallEnd /> 
                    </IconButton>
                    </Grid>

                    

                    </Grid>
            
                </Container>
            )
        }
    }

}

export default BottomPannel