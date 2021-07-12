import { Button, Chip, Dialog, DialogActions, DialogContent, Checkbox,FormControlLabel,
        DialogTitle,IconButton,Paper,TextField, Tooltip, Typography } from "@material-ui/core";
import { Assignment, Close, } from "@material-ui/icons";
import React,{Component} from "react";
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import { db } from "../../firebase";
import firebase from "firebase";
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";

class MeetingSelectionScreen extends Component {
    constructor(props) {
        super(props);
        this.joinRoomIdRef = React.createRef();
        this.hostMeetingTitle = React.createRef();
        this.scheduledAtInput = React.createRef();
        this.addParticipantRef = React.createRef();

        this.tabpannel = this.tabpannel.bind(this);
        this.changeState = this.changeState.bind(this); 
        this.closePopup = this.closePopup.bind(this);
        this.updatejoinRoomId=this.updatejoinRoomId.bind(this);
        this.updateHostMeetingTitle=this.updateHostMeetingTitle.bind(this);
        this.joinRoom = this.joinRoom.bind(this);
        this.hostRoom = this.hostRoom.bind(this);
        this.toogleScheduleMeet = this.toogleScheduleMeet.bind(this);
        this.handleScheduleDate = this.handleScheduleDate.bind(this);
        this.handleAddParticipant = this.handleAddParticipant.bind(this);
        this.addParticipant = this.addParticipant.bind(this);
        this.handleRestriction = this.handleRestriction.bind(this);
        this.scheduleMeet = this.scheduleMeet.bind(this);

        this.state = { 
            action:'',
            roomName:'',
            tabIndex:0,
            randomRoomId: Math.random().toString(36).substring(4),
            joinRoomId:'',
            joinRoomErrorDiscription:'',
            joinRoomError:false,
            hostMeetingTitle: '',
            hostMeetingTitleError:false,
            hostMeetingTitleErrorDiscription:'',
            scheduledAt: new Date(),
            addParticipantEmail:'',
            addParticipantError:false,
            addParticipantErrorDiscription:'',
            scheduledMeetParticipants:[],
            addParticipantUid:[this.props.user.uid],
            restricted: false
         }
    }

    componentDidMount(){
        this.setState({randomRoomId:Math.random().toString(36).substring(4)})
    }

    componentWillUnmount(){
        delete this.state.scheduledAt
    }

    closePopup(){
        this.props.initiateMeeting();
    }

    handleScheduleDate(date){
        this.setState({scheduledAt : date })
        //console.log("scheduled=",date)
    }

    handleAddParticipant(event){
        this.setState({addParticipantEmail : event.target.value})
        //console.log("added=",event.target.value)
    }

    handleRestriction(){
        this.setState({restricted : !this.state.restricted})
    }

    changeState(state,val){
        if(state === 'tabIndex'){
            if(val == 0){
                this.setState({
                    action:'',
                    roomName:'',
                    tabIndex:0,
                    randomRoomId: Math.random().toString(36).substring(4),
                    joinRoomId:'',
                    joinRoomErrorDiscription:'',
                    joinRoomError:false,
                    hostMeetingTitle: '',
                    hostMeetingTitleError:false,
                    hostMeetingTitleErrorDiscription:'',
                    scheduledAt: new Date(),
                    addParticipantEmail:'',
                    addParticipantError:false,
                    addParticipantErrorDiscription:'',
                    scheduledMeetParticipants:[],
                    addParticipantUid:[this.props.user.uid],
                    restricted:false,
            
                })
            }
            else if(val == 2 && this.state.hostMeetingTitle==''){
                this.setState({hostMeetingTitleError: true, hostMeetingTitleErrorDiscription:"meeting title can't be empty"})
                return;
            }
            this.setState({tabIndex : val})
        }
        else if(state === 'action' )
            this.setState({action : val, tabIndex:1})
    }

    toogleScheduleMeet(){
        if(this.state.hostMeetingTitle == ''){
            this.setState({hostMeetingTitleErrorDiscription: "Meeting name can't be empty",
                            hostMeetingTitleError: true});
            return;
        }
        this.changeState('tabIndex', 2);

    }

    updatejoinRoomId(event) {
        this.setState({
          joinRoomId: event.target.value
        });
       
      }

      updateHostMeetingTitle(event){
          this.setState({
              hostMeetingTitle: event.target.value
          });
          //console.log("val=",this.state.joinRoomId, event.target.value)
      }

      addParticipant(){
          if(this.state.addParticipantEmail === this.props.user.email){
              this.setState({addParticipantEmail:''})
              return;
          }
          const email = this.state.addParticipantEmail
          if(!this.state.scheduledMeetParticipants.some(e => e.email == email)){
            db.collection('users').where('email','==',email).get().then(
                (querySnapshot) => {
                    if(!querySnapshot.empty){
                        querySnapshot.docs.forEach(doc => {
                            const data = doc.data();
                            const addParticipant = {
                                displayName: data['displayName'],
                                email: data['email'],
                                uid: data['uid'],
                                admin: false,

                            }
                            
                            this.setState({scheduledMeetParticipants:[...this.state.scheduledMeetParticipants,
                                addParticipant],
                            addParticipantEmail: '', addParticipantUid:[...this.state.addParticipantUid, data['uid']]})
                            this.setState({addParticipantError:false, addParticipantErrorDiscription: ''})
                            
                        }); 
                    }
                    
                }
            ).catch( err =>{
                this.setState({addParticipantError:true, addParticipantErrorDiscription: err.message})
            })
          }
            
      }

    joinRoom(){
        const meetingDoc = db.collection('Meetings').doc(this.state.joinRoomId);
        meetingDoc.get().then(
            (doc) => {
                if(doc.exists){
                    const docData = doc.data();

                    if(docData['restricted']){
                        this.setState({joinRoomErrorDiscription: "This room is restricted",
                            joinRoomError:true});
                            return;
                    }

                    if(!docData['participantsUid'].includes(this.props.user.uid)){
                    meetingDoc.update({participantsUid:[...docData['participantsUid'],this.props.user.uid]});
                    const userData = {
                        displayName:this.props.user.displayName,
                        uid: this.props.user.uid,
                        admin: false,
                        email: this.props.user.email
                    }
                    meetingDoc.update({participants:[...docData['participants'],userData]})
                }

                    this.props.initiateMeeting()
                    this.props.toogleStartMeetingScreen(this.state.joinRoomId);
                }
                else{
                    this.setState({joinRoomErrorDiscription : "Room id doesn't exist",
                                   joinRoomError: true})
                }
            }
        ).catch(
            (err) => {
                this.setState({joinRoomErrorDiscription: err.message,
                               joinRoomError:true})
            }
        )        
    }

    hostRoom(){
        if(this.state.hostMeetingTitle == ''){
            this.setState({hostMeetingTitleErrorDiscription: "Meeting name can't be empty",
                            hostMeetingTitleError: true});
            return;
        }

        const roomDetails = {
            participants:[{
                displayName:this.props.user.displayName,
                uid: this.props.user.uid,
                admin: true,
                email: this.props.user.email
            }],
            uid:this.state.randomRoomId,
            scheduledAt: firebase.firestore.Timestamp.now(),
            name: this.state.hostMeetingTitle,
            participantsUid: this.state.addParticipantUid,
            restricted: false
        }
        db.collection('Meetings').doc(this.state.randomRoomId).set(roomDetails).then(() => {
                    this.props.initiateMeeting()
                    this.props.toogleStartMeetingScreen(this.state.randomRoomId);
        })
    }

    scheduleMeet(){
        const roomDetails = {
            participants:[{
                displayName:this.props.user.displayName,
                uid: this.props.user.uid,
                admin: true,
                email: this.props.user.email
            }, ...this.state.scheduledMeetParticipants],
            uid:this.state.randomRoomId,
            scheduledAt: firebase.firestore.Timestamp.fromDate(this.state.scheduledAt),
            name: this.state.hostMeetingTitle,
            participantsUid: this.state.addParticipantUid,
            restricted: this.state.restricted
        }
        db.collection('Meetings').doc(this.state.randomRoomId).set(roomDetails).then(() => {
                    this.changeState('tabIndex',3);
        })
    }

    handleDeleteParticipant(partitipantToDelete){
        this.setState({
            scheduledMeetParticipants: this.state.scheduledMeetParticipants.filter( p => p.email !== partitipantToDelete.email),
            addParticipantEmail: '',
        })
    }

    tabpannel(){
        switch (this.state.tabIndex) {
            case 0:
                return (
                    <DialogContent dividers>
                    <div style={{display:'flex',width:'60%',justifyContent:'space-evenly',flexDirection:'column',margin:'auto'}}>
                        <Button style={{margin:'10px'}} variant="contained" color="primary"
                         onClick={()=> this.changeState('action','host')}>Host Meeting</Button>
                         
                        <Button style={{margin:'10px'}} variant="contained" color="primary" 
                        onClick={()=> this.changeState('action','join')}>Join Meeting</Button>
                    </div>
                    </DialogContent>
                )

                break;
            
            case 1:
                var disableJoinButton = this.state.joinRoomId === '';
                return(
                    <div style={{display:'flex',justifyContent:'center',flexDirection:'column',alignItems:'center', padding:'10px'}}>
                        {this.state.action === 'host' ?
                            <div >

                                <div id="roomIdContainer"  style={{dislay:'flex',justifyContent:'center'}}>
                                <TextField id="hostRoomId" style={{maxWidth:'80%'}}  label="host Room Id"
                                defaultValue={this.state.randomRoomId} disabled
                                 variant="outlined" helperText="This is a auto generated Room Id copy it for futher use" />

                                <Tooltip title="Copy to clipboard" placement="top">
                                <IconButton color="primary" onClick={() => {navigator.clipboard.writeText(this.state.randomRoomId)}}>
                                    <Assignment />
                                </IconButton>
                                </Tooltip>
                                <br />
                                <br />
                                </div>
                                <TextField value={this.state.hostMeetingTitle}
                                style={{width:'100%'}}
                                onChange={this.updateHostMeetingTitle} id="HostMeetingTitle"
                                 ref={this.hostMeetingTitle} error={this.state.hostMeetingTitleError}
                                  helperText={this.state.hostMeetingTitleErrorDiscription} 
                                  label="Meeting Title"  variant="outlined" />
                                  <br />
                                  <div style={{display:'grid',gridTemplateColumns:'33% 33% 34%'}}>
                                 <Button style={{margin:'10px 0'}} color="secondary" variant='contained' onClick={( ) => this.changeState('tabIndex',0)} > Back </Button>
                                <Button style={{margin:'10px'}} color="primary" variant='contained'
                                     onClick={this.hostRoom} > Host Now </Button>
                                <Button style={{margin:'10px 0', fontSize:'0.8rem'}} color="primary" variant='contained'
                                     onClick={this.toogleScheduleMeet} > Schedule Meet </Button>
                                </div>
                                
                            </div>:

                            <div style={{display:'flex', padding:'8px',flexDirection:'column'}}>
                                <TextField value={this.state.joinRoomId}
                                onChange={this.updatejoinRoomId} id="joinRoomId"
                                
                                 ref={this.joinRoomIdRef} error={this.state.joinRoomError} helperText={this.state.joinRoomErrorDiscription} required label="Join Room Id"  variant="outlined" />
                                 <div style={{display:'flex', justifyContent:'center'}}>
                                 <Button style={{margin:'10px'}} color="secondary" variant='contained' onClick={( ) => this.changeState('tabIndex',0)} > Back </Button>
                               
                                <Button style={{margin:'10px'}} color="primary" variant='contained' disabled={disableJoinButton}
                                     onClick={this.joinRoom} > Join </Button>
                                     <br />
                                 </div>
                            </div>
                        }
                        
                    </div>
                )

                break;

            case 2 :
                return(
                    <div style={{ display: 'flex',
                        padding: '10px',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection:'column'}}>
                        
                        <div style={{margin:'5px 0'}}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils} >
                        <DateTimePicker label='Meeting Date and time'
                            ref={this.scheduledAtInput}
                            inputVariant="outlined"
                            value={this.state.scheduledAt}
                            onChange={this.handleScheduleDate} />
                        </MuiPickersUtilsProvider>

                        <FormControlLabel
                        control={<Checkbox checked={this.state.restricted} id="restricted" 
                        style={{display: 'block',padding:'10px'}}/>}
                        label="Restricted : " onChange={this.handleRestriction} labelPlacement="start"/>
                        
                        
                        <div style={{display:'grid', margin:'5px 0'}}>
                        <div style={{margin:'5px 0'}}>
                            <Paper component="ul" style={{display: 'flex',justifyContent: 'center',flexWrap: 'wrap',
                                listStyle: 'none',padding: '2px',margin: 0, maxWidth:'100%', maxHeight:'80px',overflowY:'auto'}}>
                            
                                { this.state.scheduledMeetParticipants.map(user =>{
                                    return(
                                    <li key={user['email']}>
                                        <Chip
                                         label={user['displayName']} 
                                         onDelete={() => this.handleDeleteParticipant(user)}/>
                                    </li>
                                    );
                                })
                            }
                                
                            </Paper>
                        </div>
                            
                            <TextField style={{margin:'5px 0'}} variant='outlined' label='add Participants' error={this.state.addParticipantError}
                            helperText={this.state.addParticipantErrorDiscription}
                            ref={this.addParticipantRef} value={this.state.addParticipantEmail} 
                            onChange={this.handleAddParticipant}/>
                            <Button style={{margin:'5px 0'}} onClick={this.addParticipant} variant='contained' color='primary' >Add</Button>
                        </div>
                        
                        <Button style={{margin:'10px'}} color="secondary" variant='contained' onClick={this.closePopup} > close </Button>
                        <Button variant="outlined" color="primary" onClick={this.scheduleMeet}>Schedule</Button>
                        </div>

                    </div>
                )

                break;

                case 3:
                    return(
                        <DialogContent dividers>
                            <div>
                            <Typography>Meeting Scheduled</Typography>
                            <div>
                                Meeting Title : {this.state.hostMeetingTitle}
                            </div>
                            <div>
                                Meeting Id : {this.state.randomRoomId}
                            </div>
                            <FormControlLabel
                        control={<Checkbox checked={this.state.restricted} id="restricted" 
                        style={{display: 'block',padding:'10px'}}/>}
                        label="Restricted : " disabled labelPlacement="start"/>
                        
                            <div>
                                participants: <div style={{margin:'5px 0'}}>
                            <Paper component="ul" style={{display: 'flex',justifyContent: 'center',flexWrap: 'wrap',
                                listStyle: 'none',padding: '2px',margin: 0, maxWidth:'100%', maxHeight:'80px',overflowY:'auto'}}>
                            
                                { this.state.scheduledMeetParticipants.map(user =>{
                                    return(
                                    <li key={user['email']}>
                                        <Chip
                                         label={user['displayName']} 
                                         onDelete={() => this.handleDeleteParticipant(user)}/>
                                    </li>
                                    );
                                })
                            }
                                
                            </Paper>
                        </div>
                            </div>
                            <div>
                                Scheduled At: {this.state.scheduledAt.toLocaleString()}
                            </div>
                            </div>
                            <DialogActions>
                            <Button style={{margin:'10px'}} color="secondary" variant='contained' onClick={this.closePopup} > Done </Button>
                        </DialogActions>
                        </DialogContent>
                        
                    )

        
            default:
                return <div>error</div>
                break;
        }
        
    }

    render() { 
        return ( 
            <div>
                <Dialog fullWidth  maxWidth="md" open={true}>
                    <DialogTitle style={{textAlign:'center', position:'relative'}}>
                        New Meeting
                        <IconButton onClick={this.closePopup} style={{position:'absolute',top:'1%',right:'1%'}}>
                            <Close />
                        </IconButton>
                    </DialogTitle>
                        { this.tabpannel() }
                </Dialog>
            </div>
         );
    }
}
 
export default MeetingSelectionScreen;