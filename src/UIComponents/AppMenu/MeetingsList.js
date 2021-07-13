import { Container, Divider, IconButton, List, ListItem, ListItemText, ListSubheader, Paper, Typography } from "@material-ui/core";
import React,{Component} from "react";
import "./MeetingsList.css"
import firebase from "firebase";
import { ArrowBack } from "@material-ui/icons";
import MeetingScreen from "./MeetingScreen";
import { db } from '../../firebase';

class MeetingsList extends Component {
    constructor(props) {
        super(props);
        // return the Dom element of the meeting lists
        this.meetingsList = this.meetingsList.bind(this);

        // if user selects a meeting then set selected meeting to the meeting uid
        this.setSelectedMeeting = this.setSelectedMeeting.bind(this);

        // returns the selected meeting screen
        this.meetingScreen = this.meetingScreen.bind(this);
        this.state = { 
            selectedMeeting:null,
            meetings:[]
         }
    }

    // compare method for meetings to sort by their time
    compareMeetingsByDate(a, b){
        if(a.scheduledAt.seconds > b.scheduledAt.seconds)
            return -1
        else if(a.scheduledAt.seconds < b.scheduledAt.seconds)
            return 1
    }

    componentDidMount(){
        db.collection("Meetings")
        .where("participantsUid", "array-contains", this.props.user.uid)
        .onSnapshot((querySnapshot) => {
        var meetings = []
        querySnapshot.forEach((doc) => {
            meetings.push(doc.data());
        });

        meetings.sort(this.compareMeetingsByDate);
        this.setState({meetings: meetings})
        if(this.state.selectedMeeting != null){
            const selectedMeeting = meetings.find(e => e.uid == this.state.selectedMeeting.uid)
            if(selectedMeeting == undefined){
                this.setState({selectedMeeting : null})
            }
            else{
            this.setState({selectedMeeting : selectedMeeting})
            }
        }
        
    });

    

    }

    // method to convert firebase timestamp to string and date object
    convertTimestampToString( timestamp ){
        const dateObj = new firebase.firestore.Timestamp(timestamp.seconds, timestamp.nanoseconds);
        const date = dateObj.toDate();
        const currentDate = new Date();
        const dateString = date.toLocaleString().split(',');
       
        if(currentDate < date){
            return (
                <span className="upcomingMeetings">{dateString[0]} {dateString[1]}</span>
            )
        }
        else if(currentDate.toLocaleString().split(',')[0] == dateString[0]){
            return (
                <span className="todayMeetings">{dateString[1]}</span>
            )
        }
        else{
            return (
                <span className="pastMeetings">{dateString[0]} {dateString[1]}</span>
            )
        }
    }

    setSelectedMeeting( meeting ){
        this.setState({selectedMeeting: meeting});
    }

    meetingsList(){
            return(
                <Paper className={"meetingsList"+ (this.state.selectedMeeting !== null?" hide":'')}>
                    
                    <List >
                        
                    <ListSubheader  className="meetingsListTitle">
                        <IconButton className="backButton" onClick={() => this.props.changeScreen('')}>
                            <ArrowBack />
                        </IconButton>
                        Meetings</ListSubheader>

                        {this.state.meetings.map( meeting =>{
                            return(<li key={meeting.uid}>
                                <Divider />
                                <ListItem  button onClick={() => this.setSelectedMeeting(meeting)}>
                                    <ListItemText secondary={this.convertTimestampToString(meeting.scheduledAt)}> {meeting.name} </ListItemText>
                                </ListItem>
                                
                                </li>
                            )
                        })}
                        
                        
                    </List>
                </Paper>
            )
    }

    meetingScreen(){
        if(this.state.selectedMeeting !== null)
        return (
            <MeetingScreen meeting={this.state.selectedMeeting} 
                           setSelectedMeeting={this.setSelectedMeeting}
                           user={this.props.user}
                           toogleStartMeetingScreen={this.props.toogleStartMeetingScreen}
                            />
        )
    }


    render() { 
        return ( 
            <Container className="meetingsContainer" maxWidth="sm">
                {this.meetingsList()}
                {this.meetingScreen()}
            </Container>
         );
    }
}
 
export default MeetingsList;