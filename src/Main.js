import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App.js';
import {auth} from './firebase'
import {useAuthState} from 'react-firebase-hooks/auth';
import SignIn from './UIComponents/SignIn/SignIn';
import { CircularProgress } from '@material-ui/core';

function Main() {
    var user = {}
    [user] = useAuthState(auth)
    
    // show loding screen until app fetches auth status
    if(user[1]){
        return(
            <div style={{display:'flex',justifyContent:'center',height:'100vh',alignItems:'center',backgroundColor:'black'}}><CircularProgress /></div>
        )
    }

    // if user is not logged in return sign in page else return app
    return (
        <>
        {user[0] ? <App user={user[0]}  />:<SignIn />}
        </>
    )
}

export default Main
