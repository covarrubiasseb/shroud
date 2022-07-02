import { render, screen } from '@testing-library/react';
import App from './App';

test('User can Login with Google using Firebase Auth', () => {
  render(<App />);
});

test('User can Logout with Google using Firebase Auth', () => {
  render(<App />);
});

test('User can visit a unique server (GET /servers/:id/channel/0)', () => {
  render(<App />);
});

test('User can visit different channels in a server (GET /servers/:id/channel/:index)', () => {
  render(<App />);
});

test('User can post messages in a server channel (PUT /servers/:id/channel/:index/messages/:id)', () => {
  render(<App />);
});

test('User can edit their own messages (POST /servers/:id/channel/:index/messages/:id)', () => {
  render(<App />);
});

test('User can delete their own messages (DELETE /servers/:id/channel/:index/messages/:id)', () => {
  render(<App />);
});

test('User can create new servers (PUT /servers/:id)', () => {
  render(<App />);
});

test('User can edit server names of servers they made (POST /servers/:id)', () => {
  render(<App />);
});

test('User can delete servers they made (DELETE /servers/:id)', () => {
  render(<App />);
});

test('User can create new channels in servers they made (PUT /servers/:id/channel/:index)', () => {
  render(<App />);
});

test('User can edit channel names in servers they made (POST /servers/:id/channel/:index)', () => {
  render(<App />);
});

test('User can delete channels in servers they made (DELETE /servers/:id/channel/:index)', () => {
  render(<App />);
});

test('User can delete messages in servers they made (DELETE /servers/:id/channel/:index/messages/:id)', () => {
  render(<App />);
});



