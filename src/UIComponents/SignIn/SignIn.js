import React,{useState} from 'react';
import firebase from 'firebase';
import {auth, db} from '../../firebase'
import './SignIn.css'
import { TextField, Button, Dialog, Container,Typography, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';

function SignIn() {
    function signInWithGoogle(){
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider).then( userObj => { 

            const userData = {
                uid: userObj.user.uid,
                displayName: userObj.user.displayName,
                email: userObj.user.email,
                friends:[],
            }
            db.collection("users").doc(userData.uid).get().then( userDoc =>{
                if(!userDoc.exists){
                    db.collection("users").doc(userObj.user.uid).set(userData);
                }
            }).catch(err => setfirebaseError(err.message))
            
        });
    }

    function logIn() {
        if(email == ''){
            setemailError("email can't be empty")
            return;
        }
        if(password == ''){
            setpasswordError("password can't be empty")
            return;
        }
        auth.signInWithEmailAndPassword(email,password).catch(err => setfirebaseError(err.message))
    }

    function signUp() {

        setpasswordError('');
        setemailError('');
        setdisplayNameError('');

        if(confirmPassword != password){
            setpasswordError("password doesn't match");
            return;
        }
        if(email == ''){
            setemailError("email can't be empty")
            return;
        }
        if(password == ''){
            setpasswordError("password can't be empty")
            return;
        }
        if(displayName == ''){
            setdisplayNameError("display name can't be empty")
            return;
        }
        auth.createUserWithEmailAndPassword(email,password).then(userObj =>{
            userObj.user.updateProfile({displayName: displayName});
            const userData = {
                uid: userObj.user.uid,
                displayName: displayName,
                email: userObj.user.email,
                friends:[],
            }
            db.collection("users").doc(userData.uid).get().then( userDoc =>{
                if(!userDoc.exists){
                    db.collection("users").doc(userObj.user.uid).set(userData);
                }
            });
            userObj.user.sendEmailVerification()
        }).catch(err => setfirebaseError(err.message))
    }

    const [displayName, setdisplayName] = useState('');
    const [displayNameError, setdisplayNameError] = useState('');
    const [passwordError, setpasswordError] = useState('');
    const [emailError, setemailError] = useState('');
    const [email, setemail] = useState('');
    const [password, setpassword] = useState('');
    const [signUpMode, setsignUpMode] = useState(false);
    const [confirmPassword, setconfirmPassword] = useState('');
    const [firebaseError, setfirebaseError] = useState('')

    return (
        <div className='signIn'>
        <Container maxWidth="xs" className='signInContainer'>
        <div className="logInOptionsContainer">
        <Button variant={signUpMode?"outlined":"contained"} onClick={() => setsignUpMode(false)} color="primary" className="logInOptionsButtons">Log In</Button>
        <Button variant={signUpMode?"contained":"outlined"} onClick={() => setsignUpMode(true)} color="primary" className="logInOptionsButtons">Sign Up</Button>
        </div>
        {signUpMode?
        <div className="signUpFieldContainer">

        <TextField error={displayNameError != ''} helperText={displayNameError}
         variant="outlined" label="display Name" 
         value={displayName} onChange={event => setdisplayName(event.target.value)} />

        <TextField variant="outlined" type="email" 
        label="E-mail" value={email} error={emailError != ''} 
        helperText={emailError}
        onChange={event => setemail(event.target.value)} />
        
        <TextField variant="outlined" type="password" 
        label="password" value={password} error={passwordError != ''} helperText={passwordError}
        onChange={event => setpassword(event.target.value)} />
        
        <TextField variant="outlined" type="password" label="confirm password" value={confirmPassword} onChange={event => setconfirmPassword(event.target.value)} />
        
        <Button onClick={signUp} variant="contained" color="primary">Create new user</Button>
        </div>
        :
        <div className="signInFieldContainer">
            <TextField variant="outlined"
             type="email" label="E-mail" value={email} error={emailError != ''} 
             helperText={emailError}
             onChange={event => setemail(event.target.value)} />
        <TextField variant="outlined" type="password" label="password" value={password} onChange={event => setpassword(event.target.value)} />
            
            <Button onClick={logIn} variant="contained" color="primary">Log In</Button>
        </div>
        }
        <Typography></Typography>
        <Button className="googleSignIn" onClick={signInWithGoogle} variant="outlined" color="primary">Sign in with Google</Button>
        </Container>

        <Dialog open={firebaseError != ''}>
            <DialogTitle>Error</DialogTitle>
            <DialogContent>
                <Typography>
                    {firebaseError}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setfirebaseError('')}>
                    Okay
                </Button>
            </DialogActions>
        </Dialog>
        </div>
    )
}

export default SignIn
