import React,{Component} from 'react';
import { Button, Checkbox, Container, Divider, IconButton, List, ListItem, ListItemIcon, ListItemText, Paper, TextField, Typography } from "@material-ui/core";
import "./UserProfile.css"
import { auth, db } from '../../firebase';
import { ArrowBack, Close, Done } from '@material-ui/icons';


class UserProfile extends Component {
    constructor(props) {
        super(props);
        // methods to handle the inputs
        this.handleNameChange = this.handleNameChange.bind(this);
        this.saveProfile = this.saveProfile.bind(this);

        this.state = { 
            userDisplayName: this.props.user.displayName,
            userEmail: this.props.user.email,
            userDisplayNameError: false,
            updating: false,

         }
    }

    handleNameChange(event){
        this.setState({ userDisplayName: event.target.value})
    }

    // save and update the user profile
    saveProfile(){
        if(this.state.userDisplayName == ''){
            this.setState({userDisplayNameError: true})
            return
        }
        this.props.user.updateProfile({displayName : this.state.userDisplayName})
            .then(this.setState({updating:true}));
            db.collection('users').doc(this.props.user.uid).update({
                displayName: this.state.userDisplayName
            })
    }

    render() { 
        return ( 
        <Container>
        <Paper className="userProfilePaper">
            <div className="topBar">
                <IconButton onClick={() => this.props.changeScreen('')}>
                    <ArrowBack />
                </IconButton> 
                <Typography>User Profile</Typography>
            </div>
            <div className="userInfo">
                <List>
                    <Divider />
                    <ListItem>
                        <ListItemText style={{margin:'5px'}}>User Name:</ListItemText>
                        <TextField className="textField"
                         value={this.state.userDisplayName} onChange={this.handleNameChange} 
                        variant="outlined" error={this.state.userDisplayNameError} helperText="user name will not be updated in past meetings" />
                    </ListItem>
                    <Divider />
                    <ListItem>
                        <ListItemText style={{margin:'5px'}}>User Email:</ListItemText>
                        <TextField className="textField" value={this.state.userEmail} disabled variant="outlined" />
                    </ListItem>
                    <Divider />
                    <ListItem>
                        <ListItemText>Email Verified: </ListItemText>
                        <ListItemIcon><Checkbox disabled checked={this.props.user.emailVerified} /> </ListItemIcon>
                    </ListItem>
                    <Divider />
                    <ListItem >
                        <Button  variant='contained' color='secondary' onClick={() => this.props.changeScreen('')}>Back</Button>
                        
                        <Button  variant='contained' className="bottomButtons" 
                            color="primary" onClick={this.saveProfile}>
                            Save 
                            {this.state.updating && <Done />}
                            </Button>

                        <Button className="bottomButtons" variant='contained' 
                        color='secondary' onClick={() => auth.signOut()}>Log out</Button>
                    </ListItem>
                </List>
            </div>
        </Paper> 
        </Container>
        );
    }
}
 
export default UserProfile;