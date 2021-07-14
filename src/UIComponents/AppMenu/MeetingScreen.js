import { Button, Paper,IconButton, CircularProgress, Divider, Checkbox, FormControlLabel, 
          List, ListItem, ListItemText,Dialog,DialogActions,DialogContent,
          DialogContentText,DialogTitle,
          TextField,ListItemIcon } from '@material-ui/core';

import {Beenhere, VerifiedUser, Info} from '@material-ui/icons';
import React,{Component} from 'react'
import '@progress/kendo-theme-material/dist/all.css';
import Chat from 'twilio-chat';
import './MeetingScreen.css'
import { Chat as ChatUI } from '@progress/kendo-react-conversational-ui';
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from '@date-io/date-fns';
import 'date-fns';
import firebase from 'firebase';
import { db } from "../../firebase";

import { ArrowBack, Group, Settings,Delete, VideoCall } from '@material-ui/icons';


class MeetingScreen extends Component {

    constructor(props) {
        super(props);

        // fetch all the users in the meet from their uid and create a array
        // of their name and uid for further use
        this.setUsers = this.setUsers.bind(this); 

        //convert twilio message to a kendo message object
        this.twilioMessageToKendoMessage = this.twilioMessageToKendoMessage.bind(this);

        // convert firebase timestamp to JS date object
        this.convertTimestampToDate = this.convertTimestampToDate.bind(this);

        // handle inputs in meeting settings
        this.changeDateAndTime = this.changeDateAndTime.bind(this);
        this.changeMeetingName = this.changeMeetingName.bind(this);

        this.handleBackArrow = this.handleBackArrow.bind(this);

        // toogle screens
        this.toogleParticipantScreen = this.toogleParticipantScreen.bind(this);
        this.toogleSettingsScreen = this.toogleSettingsScreen.bind(this);
        this.toogleAddParticipantDialog = this.toogleAddParticipantDialog.bind(this);

        // methods to add or remove participants to the meet using their email
        this.handleAddParticipant = this.handleAddParticipant.bind(this);
        this.addParticipant = this.addParticipant.bind(this);
        this.removeParticipant = this.removeParticipant.bind(this);

        // method to make someone admin
        this.makeAdmin = this.makeAdmin.bind(this);

        // save the changes made in the meet settings
        this.updateMeeting = this.updateMeeting.bind(this);

        // handle the metting restriction setting
        this.handleRestriction = this.handleRestriction.bind(this);

        // methods to load, send and display chats messages
        this.setupChatClient = this.setupChatClient.bind(this);
        this.messagesLoaded = this.messagesLoaded.bind(this);
        this.messageAdded = this.messageAdded.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.handleError = this.handleError.bind(this);

        this.state = {
            // current user uid and display name
            userUid:this.props.user.uid, 
            userName:this.props.user.displayName,

            // current meeting uid
            roomName:this.props.meeting.uid,

            // error in loading chats
            error: null,

            // state for chat loading
            isLoading: true,

            // array of messages
            messages: [],

            // array of user objects for users in the meeting
            users:[],

            // the meeting object of selected meeting
            meeting:this.props.meeting,

            // flags for opned screens
            settingScreen: false,
            participantScreen: false,

            // get the scheduled date of the selected meeting
            meetScheduledAt: this.convertTimestampToDate(),

            // the meeting title, uid and restriction status
            meetingName: this.props.meeting.name,
            meetingUid: this.props.meeting.uid,
            meetingRestricted: this.props.meeting.restricted,

            addParticipantDialog: false,
            addParticipantEmail:'',
            addingParticipant:false,

            // check if the user is admin of the selected meeting
            isAdmin: this.props.meeting.participants.find(u => u.uid == this.props.user.uid)['admin']

        }
    
        // the user details for kendo chat ui
          this.user = {
            id: this.state.userUid,
            name: this.state.userName
          };

      }
    
      componentDidMount() {

        // Fetch a chat token for twilio server and setup a client identity
        fetch(`https://thistle-birman-7407.twil.io/chatToken?identity=${this.state.userUid}`)
        .then(res => res.json())
        .then(data => Chat.create(data.accessToken))
        .then(this.setupChatClient)
        .catch(this.handleError);
        
        this.setUsers(); // fetch and assign the user uid t=to their display names
         
      }

      componentDidUpdate(){
        // if new mem is added then add its uid and name to the array of users.
        if(this.state.meeting != this.props.meeting){
          this.setUsers();
        }
      }

      toogleAddParticipantDialog(){
        this.setState({addParticipantDialog: !this.state.addParticipantDialog})
      }

      convertTimestampToDate(){
        const timestamp = this.props.meeting.scheduledAt; // get the scheduled time of the meeting
        // convert the scheduled time to date object
        const dateObj = new firebase.firestore.Timestamp(timestamp.seconds, timestamp.nanoseconds); 
        const date = dateObj.toDate();
        return date;
        }

      //---- Handle meeting settings inputs

      changeDateAndTime(date){
        this.setState({meetScheduledAt: date});
      }
      
      changeMeetingName(field){ 
        this.setState({meetingName: field.target.value});
      }

      handleAddParticipant(event){
        this.setState({addParticipantEmail: event.target.value})
      }

      handleRestriction(){
        this.setState({meetingRestricted: !this.state.meetingRestricted})
      }

      //---- Handle meeting settings inputs

      // method to add the participant to the meeting from its email
      addParticipant(){
        this.setState({addingParticipant:true}) // show the processing modal

        // if user tries to add himself then return
        if(this.state.addParticipantEmail === this.props.user.email){
            this.setState({addParticipantEmail:'', addingParticipant: false})
            this.toogleAddParticipantDialog();
            return;
        }

        const email = this.state.addParticipantEmail
        
        // fetch the user details of user with given email
        db.collection('users').where('email','==',email).get().then(
          (querySnapshot) => {
            if(!querySnapshot.empty){
              querySnapshot.docs.forEach(doc => {
                // get the data of the document
                const data = doc.data();
                
                // if the user is not already present in the meet then add him
                if(!this.state.meeting.participantsUid.includes(data['uid'])){
                  const addParticipant = {
                    displayName: data['displayName'],
                    email: data['email'],
                    uid: data['uid'],
                    admin: false,
                    }
                  
                  // if the user is going to join for first time then add his data and uid to participants list
                  if(!this.state.meeting.participants.some(e => e.uid == data['uid'])){
                    db.collection('Meetings').doc(this.props.meeting.uid).update({
                      participants: [...this.props.meeting.participants, addParticipant],
                      participantsUid:[...this.props.meeting.participantsUid, data['uid']]
                    })
                  }
                  // if the user was present in the meet but was removed later then
                  // just add his uid to the participants list
                  else{
                    db.collection('Meetings').doc(this.props.meeting.uid).update({
                    participantsUid:[...this.props.meeting.participantsUid, data['uid']]
                    })
                  }
                }
                          
              }); 
            }
                  
          })
          .then(() => this.setState({addingParticipant : false, addParticipantEmail:''})) // after completion hide progress modal
          .catch( err =>{
              console.log(err)
          })
        
    }

    // method to make someone admin
    makeAdmin(uid){
      // get the details of the user who's to be made admin
      let currentUser = this.props.meeting.participants.find(u => u.uid == uid);
      // remove him from the participants list
      let participants = this.props.meeting.participants.filter(u => u.uid != uid);
      // set the user admin flag to true
      currentUser['admin'] = true;
      // add this new data to the participants array
      participants = [...participants, currentUser];
      // update the firebase document
      db.collection('Meetings').doc(this.state.roomName).update({
        participants: participants
      });
    }

    // method to remove participant from meeting
    removeParticipant(participantUid){
      this.setState({addingParticipant:true}) // toogle the processing screen
      // if user tries to remove himself then return
      if(participantUid === this.props.user.uid){
          this.setState({addingParticipant: false})
          return;
      }
      // else remove te participant from the array and update db
      db.collection('Meetings').doc(this.props.meeting.uid).update({
        participantsUid: this.props.meeting.participantsUid.filter(e => e != participantUid)
      }).then(this.setState({addingParticipant:false}))
      .catch(e => console.log(e))
        
    }
      
    // fetch user details and construct a array of user uids and their display names
      setUsers(){
        let users ={}
        this.props.meeting.participants.map(participant => {
            users[participant['uid']] = participant['displayName']
        })
        this.setState({users: users, meeting: this.props.meeting})
      }

      //-- methods for sending, receiveing and handeling messages
    
      handleError(error) {
        console.error(error);
        this.setState({
          error: error.message
        });
      }
    
      setupChatClient(client) {
        
        this.client = client;
        this.client
          .getChannelByUniqueName(this.state.roomName)
          .then(channel => channel)
          .catch(error => {
            if (error.body.code === 50300) {
              return this.client.createChannel({ uniqueName: this.state.roomName });
            } else {
              this.handleError(error);
          }
        })
          .then(channel => {
           this.channel = channel;
           return this.channel.join().catch(() => {});
          })
          .then(() => {
            this.setState({ isLoading: false });
            this.channel.getMessages(100).then(this.messagesLoaded);
            this.channel.on('messageAdded', this.messageAdded);
          })
          .catch(this.handleError);
       }
    
       twilioMessageToKendoMessage(message) {
           
        return {
          text: message.body,
          author: { id: message.author, name: this.state.users[message.author] },
          timestamp: message.dateCreated
        };
      }
    
      messagesLoaded(messagePage) {
        this.setState({
          messages: messagePage.items.map(this.twilioMessageToKendoMessage)
        });
      }
    
      messageAdded(message) {
        this.setState(prevState => ({
          messages: [
            ...prevState.messages,
            this.twilioMessageToKendoMessage(message)
          ]
        }));
      }
      sendMessage(event) {
        this.channel.sendMessage(event.message.text);
      }

      //-- methods for sending, receiveing and handeling messages
    
      componentWillUnmount() {
        try{
        this.client.shutdown();
        }catch{
          
        }
      }

      handleBackArrow(){
        if(this.state.settingScreen || this.state.participantScreen){
          this.setState({settingScreen: false})
          this.setState({participantScreen : false})
        }
        else{
          this.props.setSelectedMeeting(null);
        }
      }

      // save and update the meeting changes in meeting settings
      updateMeeting(){
        
        db.collection('Meetings').doc(this.state.roomName).update({
          name: this.state.meetingName,
          scheduledAt: this.state.meetScheduledAt,
          restricted: this.state.meetingRestricted
        })
      }

      toogleSettingsScreen(){
        this.setState({settingScreen: true, participantScreen: false})
      }

      toogleParticipantScreen(){
        this.setState({participantScreen: true, settingScreen: false})
      }

      // return the selected screen default is the chat screen
      chatsWidget(){
        if(this.state.settingScreen){
          return(
          <div>
            <List>
              <Divider />
              <li key='meetingName'>
              <ListItem className="meetDetailsContainer">
                <span className="meetDetailsTag">Metting Title:</span>
                <TextField value={this.state.meetingName} 
                onChange={this.changeMeetingName} variant="outlined" 
                disabled={!this.state.isAdmin}/>
              </ListItem>
              </li>

              <Divider />
              <li key='meetingId'>
              <ListItem className="meetDetailsContainer">
                <span className="meetDetailsTag">Metting ID:</span>
                <TextField value={this.state.meetingUid} disabled variant="outlined" />
              </ListItem>
              </li>

              <Divider />
              <li key='meetingSchedule'>
              <ListItem className="meetDetailsContainer">
              <span className="meetDetailsTag">Metting Date and Time:</span>
                <MuiPickersUtilsProvider utils={DateFnsUtils} >
                        <DateTimePicker
                        value={this.state.meetScheduledAt}
                        onChange={this.changeDateAndTime}
                        disabled={!this.state.isAdmin}
                            inputVariant="outlined" />
                  </MuiPickersUtilsProvider>
              </ListItem>
              </li>
              <Divider />

              <li key='meetingRestricted'>
              <ListItem className="meetDetailsContainer">
              <FormControlLabel
                control={<Checkbox  disabled={!this.state.isAdmin}
                checked={this.state.meetingRestricted} id="restricted"
                />}
                label="Restricted : " onChange={this.handleRestriction}
                style={{margin:'1%'}} 
                labelPlacement="start"/>  
              </ListItem>
              </li>

              <Divider />
              <ListItem>
                <Button variant="contained"
                 color="secondary" onClick={this.handleBackArrow}
                 className="backButton">Back</Button>
                  { this.state.isAdmin?
                 <Button variant="contained"
                 color="primary" onClick={this.updateMeeting}
                 className="backButton">Save</Button>:<></>
                  }
              </ListItem>
            </List>
          </div>
          )
        }

        else if(this.state.participantScreen){
          return(
            <div style={{height:'92%'}}>
              <List style={{height:'80%', overflowY:'auto'}}>
                {this.state.meeting.participants.map( participant =>{
                  if(this.state.meeting.participantsUid.includes(participant.uid)){
                  return(
                    <li key={participant.uid}>
                      <Divider />
                      <ListItem>
                        <ListItemText primary={participant.displayName} secondary={participant.email} />
                        <ListItemIcon>
                          { participant.admin?<VerifiedUser />:<></>}
                          {
                            (this.state.isAdmin && !participant.admin)?
                          <IconButton onClick={() => this.removeParticipant(participant.uid)}>
                          <Delete />
                          </IconButton> :<></>
                          }
                          {
                            (this.state.isAdmin && !participant.admin)?
                            <IconButton onClick={() => this.makeAdmin(participant.uid)}>
                            <Beenhere />
                            </IconButton> :<></>
                          }
                        </ListItemIcon>
                      </ListItem>
                    </li>
                  )}
                })}
              </List>
              { this.state.isAdmin?
              <div id="addParticipantButton">
              <Button variant="outlined" onClick={this.toogleAddParticipantDialog} >Add Participant</Button>
              </div>:<></>
              }
            </div>
          )
        }

        else if (this.state.error) {
          return (<div className="chatsLoading"><Divider /><p>{this.state.error}</p> </div>);
        }
        
        else if (this.state.isLoading) {
          return (
              <div className="chatsLoading">
                <Divider />
              <CircularProgress />
              </div>
            
          )
        }

      
        return(
          <div className="meetingChatContainer">
            <ChatUI
            user={this.user}
            messages={this.state.messages}
            onMessageSend={this.sendMessage}
            placeholder="Send Message..."
            
            />
        </div> 
        )
      }
    
      render() {
        
        return ( 
          <div style={{height:'100%'}}>
          <Paper className="meetingScreen">
            <div className="meetingInfo">
              <div>
              <IconButton onClick={this.handleBackArrow}>
                <ArrowBack />
              </IconButton>
             {this.props.meeting.name}
             </div>

             <div>
               
               <IconButton className="settingsIcon" onClick={this.toogleSettingsScreen}>
               { this.state.isAdmin?
                 <Settings />:<Info />}
               </IconButton>

               <IconButton className="participantsIcon" onClick={this.toogleParticipantScreen}>
                 <Group />
               </IconButton>

               <IconButton className="participantsIcon" onClick={() => {this.props.toogleStartMeetingScreen(this.state.roomName); this.props.setSelectedMeeting(null);}}>
                 <VideoCall />
               </IconButton>
             </div>
             
             </div>
          {this.chatsWidget()}
        </Paper>  
          <div style={{display:'absolute'}}>
        <Dialog open={this.state.addParticipantDialog} onClose={this.toogleAddParticipantDialog} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">ADD PARTICIPANT</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter Email of user to add
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="userEmail"
            label="Email Address"
            type="email"
            value={this.state.addParticipantEmail}
            onChange = {this.handleAddParticipant}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.toogleAddParticipantDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={this.addParticipant} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={this.state.addingParticipant}>
      <div className="chatsLoading" style={{overflow:'hidden'}}>
                <Divider />
              <CircularProgress />
              </div>
      </Dialog>
      </div>
        </div>
        );
      }

}
 
export default MeetingScreen;