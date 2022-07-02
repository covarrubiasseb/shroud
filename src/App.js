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
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { getFirebaseConfig } from './firebase-config.js';

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
      messages: []
    }

    this.initFirebaseAuth = this.initFirebaseAuth.bind(this);
    this.getUserName = this.getUserName.bind(this);
    this.signIn = this.signIn.bind(this);
    this.signOutUser = this.signOutUser.bind(this);
    this.isUserSignedIn = this.isUserSignedIn.bind(this);
    this.authStateObserver = this.authStateObserver.bind(this);
    this.checkSignedInWithMessage = this.checkSignedInWithMessage.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.onMessageFormSubmit = this.onMessageFormSubmit.bind(this);
    this.saveMessage = this.saveMessage.bind(this);
    this.displayMessage = this.displayMessage.bind(this);
    this.loadMessages = this.loadMessages.bind(this);
    this.deleteMessage = this.deleteMessage.bind(this);
    this.toggleButton = this.toggleButton.bind(this);
  }

  initFirebaseAuth() {
    onAuthStateChanged(getAuth(), this.authStateObserver);
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

  // Returns true if user is signed in. Otherwise false and displays a message
  checkSignedInWithMessage() {
    if (this.isUserSignedIn()) {
      return true;
    }

    alert('Sign in to send messages');
    return false;
  }

  handleChange(e) {
    this.setState({messageFormValue: e.target.value});
    this.toggleButton();
  }

  // Message Submit Handler
  onMessageFormSubmit(e) {
    e.preventDefault();
    // Check that user entered a message and is signed in
    if (this.state.messageFormValue && this.checkSignedInWithMessage()) {
      this.saveMessage(this.state.messageFormValue).then(() => {
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

  // Sends a message to the Firestore Database
  async saveMessage(messageText) {
    try {
      await addDoc(collection(getFirestore(), 'messages'), {
        name: this.getUserName(),
        text: messageText,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error writing new message to Firebase Database', error);
    }
  }

  displayMessage(id, timestamp, name, text) {
    // TODO: Update state with new message
    let messages = this.state.messages;
    messages.push({text:text});
    this.setState({
      messages: messages
    });
  }

  loadMessages() {
    const recentMessagesQuery = query(collection(getFirestore(), 'messages'), orderBy('timestamp', 'asc'));
    onSnapshot(recentMessagesQuery, snapshot => {

      snapshot.docChanges().forEach((change, idx) => {
        if (change.type === 'removed') {
          this.deleteMessage(change.doc.id);
        } else {
          let message = change.doc.data();
          this.displayMessage(change.doc.id, message.timestamp, message.name, message.text);
        }
      });

    });
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
      signOutButtonElement: document.getElementById('sign-out'),
      submitButtonElement: document.getElementById('submit')
    });

    // Init Firebase
    initializeApp(getFirebaseConfig());
    this.initFirebaseAuth();
    this.loadMessages();
  }

  render() {

    return (

      <div className='App'>
        <header className='App-header'>
          <img src={logo} className='App-logo' alt='logo' />
          <div hidden id="user-name">{this.state.userNameValue}</div>
          <button hidden id='sign-out' onClick={this.signOutUser}>Sign Out</button>
          <button id='sign-in' onClick={this.signIn}>Sign In with Google</button>
        </header>

        <main id='messages-container'>
          <ul>
            {
              this.state.messages.map((message, idx) => {
                return (
                  <li key={idx+1}>{message.text}</li>
                );
              })
            }
          </ul>

          <form id='message-form' action='#' onSubmit={this.onMessageFormSubmit}>
            <div>
              <label><i>Type message here...</i></label>
              <input type='text' id='message' autoComplete='off' value={this.state.messageFormValue} onChange={this.handleChange}/>
              <button id='submit' disabled type='submit'>Send</button>
            </div>
          </form>
        </main>
      </div>

    );

  }

}

export default App;
