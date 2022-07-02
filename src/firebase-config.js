const config = {
  apiKey: 'AIzaSyCp7FKExzF04d_zioLw7Ymwv9SsgVcZn3o',
  authDomain: 'shroud-94b24.firebaseapp.com',
  projectId: 'shroud-94b24',
  storageBucket: 'shroud-94b24.appspot.com',
  messagingSenderId: '705196032022',
  appId: '1:705196032022:web:e93bf645d6fc67747e3537',
  measurementId: 'G-LB2PXXT26W'
};

export function getFirebaseConfig() {
  if (!config || !config.apiKey) {
    throw new Error('No Firebase configuration object provided.');
  } else {
    return config;
  }
}