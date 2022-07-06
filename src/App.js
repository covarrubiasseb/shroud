import logo from './logo.svg';
import './App.css';
import React from 'react';
import { initializeApp } from 'firebase/app'; 
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithRedirect,
  signOut
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { getFirebaseConfig } from './firebase-config.js';
import ServerNav from './server-nav.js';
import ChannelNav from './channel-nav.js';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userNameValue: '',
      messageFormValue: '',
      userNameElement: '',
      signOutButtonElement: '',
      signInButtonElement: '',
      submitButtonElement: '',
      messages: [],
      serverId: '',
      serverIndex: '',
      channel: 0,
      requestNewSnapshot: false,
      unsubscribe: null,
      servers: []
    }

    this.initFirebaseAuth = this.initFirebaseAuth.bind(this);
    this.getUserId = this.getUserId.bind(this);
    this.getUserName = this.getUserName.bind(this);
    this.signIn = this.signIn.bind(this);
    this.signOutUser = this.signOutUser.bind(this);
    this.isUserSignedIn = this.isUserSignedIn.bind(this);
    this.authStateObserver = this.authStateObserver.bind(this);
    this.serverNavHandler = this.serverNavHandler.bind(this);
    this.channelNavHandler = this.channelNavHandler.bind(this);
    this.checkSignedInWithMessage = this.checkSignedInWithMessage.bind(this);
    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.onMessageFormSubmit = this.onMessageFormSubmit.bind(this);
    this.onMessageDelete = this.onMessageDelete.bind(this);
    this.saveMessage = this.saveMessage.bind(this);
    this.displayMessage = this.displayMessage.bind(this);
    this.loadMessages = this.loadMessages.bind(this);
    this.deleteMessage = this.deleteMessage.bind(this);
    this.toggleButton = this.toggleButton.bind(this);
  }

  initFirebaseAuth() {
    onAuthStateChanged(getAuth(), this.authStateObserver);
  }

  getUserId() {
  }

  getUserName() {
    return getAuth().currentUser.displayName;
  }

  async signIn() {
    let provider = new GoogleAuthProvider();
    await signInWithRedirect(getAuth(), provider);
  }

  signOutUser() {
    signOut(getAuth());
  }

  isUserSignedIn() {
    return !!getAuth().currentUser;
  }

  authStateObserver(user) {
    if (user) {
      // User is Signed In
      let userName = this.getUserName();

      this.setState({userNameValue: userName});

      this.state.userNameElement.removeAttribute('hidden');   
      this.state.signOutButtonElement.removeAttribute('hidden');     
      this.state.signInButtonElement.setAttribute('hidden', 'true');
      
    } else {
      this.state.userNameElement.setAttribute('hidden', 'true');      
      this.state.signOutButtonElement.setAttribute('hidden', 'true');     
      this.state.signInButtonElement.removeAttribute('hidden');     
    }
  }

  serverNavHandler(e) {
    e.preventDefault();
    this.setState({
      serverId: e.target.dataset.id,
      channel: 0,
      serverIndex: e.target.dataset.index
    });
  }

  channelNavHandler(e) {
    e.preventDefault();

    this.setState({
      channel: e.target.dataset.channel
    });
  }

  // Returns true if user is signed in. Otherwise false and displays a message
  checkSignedInWithMessage() {
    if (this.isUserSignedIn()) {
      return true;
    }

    alert('Sign in to send messages');
    return false;
  }

  handleMessageChange(e) {
    e.preventDefault();

    this.setState({messageFormValue: e.target.value});
    this.toggleButton();
  }

  // Message Submit Handler
  onMessageFormSubmit(e) {
    e.preventDefault();
    // Check that user entered a message and is signed in
    if (this.state.messageFormValue && this.checkSignedInWithMessage()) {
      this.saveMessage(this.state.messageFormValue, this.state.serverId, this.state.channel).then(() => {
        //  Clear message text field and re-enable the Send button
        this.setState({messageFormValue: ''});
        this.toggleButton();

        // Remove Duplicate Message
        let messages = this.state.messages;
        messages.pop();
        this.setState({
          messages: messages
        });
      });
    }
  }

  // Message delete Handler
  onMessageDelete(e) {
    e.preventDefault();

    // Check that the User is signed in and their ID matches the selected message ID
  }


  // Sends a message to the Firestore Database
  async saveMessage(messageText, serverId, channelIndex) {
    try {
      await addDoc(collection(getFirestore(), 'messages'), {
        name: this.getUserName(),
        text: messageText,
        timestamp: serverTimestamp(),
        serverId: serverId,
        channel: channelIndex
      });
    } catch (error) {
      console.error('Error writing new message to Firebase Database', error);
    }
  }

  displayMessage(uid, timestamp, name, text) {
    // TODO: Update state with new message
    let messages = this.state.messages;
    messages.push({
      userName: name,
      text: text,
      timestamp: timestamp
    });
    this.setState({
      messages: messages
    });
  }

  loadMessages(serverId, channelIndex) {

    this.setState({
      messages: []
    });

    const messagesQuery = query(collection(getFirestore(), 'messages'), where('channel', '==', channelIndex), 
                                                                        where('serverId', '==', serverId));
    // Ensure there is only one snapshot subscriber at a time, for the server the user is currently on
    if (!this.state.unsubscribe) {
      this.setState({

        unsubscribe:onSnapshot(messagesQuery, snapshot => {
                      snapshot.docChanges().forEach((change, idx) => {
                        if (change.type === 'removed') {
                          this.deleteMessage(change.doc.id);
                        } else {
                          let message = change.doc.data();
                          this.displayMessage(message.uid, message.timestamp, message.name, message.text);
                        }
                      });
                    })

      });
    } else {
      this.state.unsubscribe();

      this.setState({

        unsubscribe:onSnapshot(messagesQuery, snapshot => {
                      snapshot.docChanges().forEach(change => {
                        if (change.type === 'removed') {
                          this.deleteMessage(change.doc.id);
                        } else {
                          let message = change.doc.data();
                          this.displayMessage(change.doc.id, message.timestamp, message.name, message.text);
                        }
                      });
                    })

      });

    }
  }

  deleteMessage(id) {
    // TODO: delete message in state
  }

  toggleButton() {
    if (this.state.messageFormValue) {
      this.state.submitButtonElement.removeAttribute('disabled');
    } else {
      this.state.submitButtonElement.setAttribute('disabled', 'true');
    }
  }

  componentDidMount() {
    this.setState({
      userNameElement: document.getElementById('user-name'),
      signInButtonElement: document.getElementById('sign-in'),
      signOutButtonElement: document.getElementById('sign-out')
    });

    // Init Firebase
    initializeApp(getFirebaseConfig());
    this.initFirebaseAuth();

    // Find available servers to join
    const serversQuery = query(collection(getFirestore(), 'servers'));
    
    onSnapshot(serversQuery, snapshot => {
      snapshot.docChanges().forEach(change => {
        let serverId = change.doc._key.path.segments[6];
        let servers = this.state.servers;
        servers.push({
          serverId,
          channels: change.doc.data().channel
        });
        this.setState({
          servers: servers
        });
      });
    });
  }

  componentDidUpdate(prevProps, prevState) {

    if (!this.state.submitButtonElement && this.state.serverId) {
      this.setState({
        submitButtonElement: document.getElementById('submit') || ''
      });
    }

    if (prevState.serverId !== this.state.serverId) {
      this.loadMessages(this.state.serverId, 0);
    }

    if (prevState.channel !== this.state.channel) {
      this.loadMessages(this.state.serverId, this.state.channel);
    }
  }

  render() {

    return (

      <div className='App'>
        <div className='server-nav'>
          <ServerNav serverList={this.state.servers} serverNavHandler={this.serverNavHandler}/>
        </div>

        <div id='main-container'>
          <header className='App-header'>
            <img src={logo} className='App-logo' alt='logo' />
            <div hidden id="user-name">{this.state.userNameValue}</div>
            <button hidden id='sign-out' onClick={this.signOutUser}>Sign Out</button>
            <button id='sign-in' onClick={this.signIn}>Sign In with Google</button>
          </header>

          <div id='server-container'> 
            <div className='channel-nav'>
              <ChannelNav channelList={this.state.servers[this.state.serverIndex] ? this.state.servers[this.state.serverIndex].channels : []} 
                          channelNavHandler={this.channelNavHandler} />
            </div>

            <main id='messages-container'>
              <ul>
                {
                  this.state.messages.map((message, idx) => {
                    return (
                      <li key={idx+1}>
                        <div>userName: {message.userName}</div>
                        <div>messageText: {message.text}</div>
                        <div>{message.timestamp ? message.timestamp.toDate().toString() : ''}</div>
                        <button onClick={this.onMessageDelete}>Delete Message</button>
                      </li>
                    );
                  })
                }
              </ul>

              {
                this.state.serverId ?

                <form id='message-form' action='#' onSubmit={this.onMessageFormSubmit}>
                  <div>
                    <label><i>Type message here...</i></label>
                    <input type='text' id='message' autoComplete='off' value={this.state.messageFormValue} onChange={this.handleMessageChange}/>
                    <button id='submit' disabled type='submit'>Send</button>
                  </div>
                </form> :
                <span/>

              }

              
            </main>

          </div>

        </div>

      </div>

    );

  }

}

export default App;
