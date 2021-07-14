import React, { Component } from 'react';
import '@progress/kendo-theme-material/dist/all.css';
import Chat from 'twilio-chat';
import { Chat as ChatUI } from '@progress/kendo-react-conversational-ui';
import "./InCallChats.css"
import { db } from '../../../firebase';

class InCallChats extends Component {
  constructor(props) {
    super(props);
    this.state = {
        userName:this.props.identity,
        error: null,
        isLoading: true,
        messages: [],
        meeting: {},
        users:{},
    }

    this.user = {
        id: this.props.identity,
        name: this.props.identity
      };
  
      this.setupChatClient = this.setupChatClient.bind(this);
      this.messagesLoaded = this.messagesLoaded.bind(this);
      this.twilioMessageToKendoMessage = this.twilioMessageToKendoMessage.bind(this);
      this.messageAdded = this.messageAdded.bind(this);
      this.sendMessage = this.sendMessage.bind(this);
      this.handleError = this.handleError.bind(this);
  }

  componentDidMount() {
    fetch(`https://thistle-birman-7407.twil.io/chatToken?identity=${this.props.identity}`)
      .then(res => res.json())
      .then(data => Chat.create(data.accessToken))
      .then(this.setupChatClient)
      .catch(this.handleError);

      db.collection("Meetings")
        .doc(this.props.roomName)
        .onSnapshot((docSnapshot) => {
          const docData = docSnapshot.data();
          
        let users ={}
        docData.participants.map(participant => {
            users[participant['uid']] = participant['displayName']
        })
        this.setState({users: users, meeting: docData})
    });
  }

  handleError(error) {
    console.error(error);
    this.setState({
      error: 'Could not load chat.'
    });
  }

  setupChatClient(client) {
    
    this.client = client;
    this.client
      .getChannelByUniqueName(this.props.roomName)
      .then(channel => channel)
      .catch(error => {
        if (error.body.code === 50300) {
          return this.client.createChannel({ uniqueName: this.props.roomName });
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
        this.channel.getMessages(50).then(this.messagesLoaded);
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

  componentWillUnmount() {
    try{
      this.client.shutdown();
      }catch{
        
      }
  }

  render() {
    if (this.state.error) {
        return <p style={{color:'black'}}>{this.state.error}</p>;
      } else if (this.state.isLoading) {
        return <p style={{color:'black'}}>Loading chat...</p>;
      }
    return ( 
    <div className="chatContainer">
        <div className="chatInfo">{this.state.meeting.name} - {this.props.roomName}</div>
        <ChatUI
        user={this.user}
        messages={this.state.messages}
        onMessageSend={this.sendMessage}
        placeholder="Send Message..."
        
        />
    </div>    
    );
  }
}

export default InCallChats;