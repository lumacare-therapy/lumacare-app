import React from 'react';
import ReactDOM from 'react-dom/client';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
const paypalClientId = 'AYkkL5gWX0Ipl01CqNjK5el4DwNNkzo9BHuI991fm8hmonNNlMtZ_2RBRISsJbsiMmgCwLJyJbwoP8eD';

root.render(
  <React.StrictMode>
    <PayPalScriptProvider options={{ 
      "client-id": paypalClientId,
      currency: "USD",
      intent: "subscription",
      vault: true
    }}>
      <App />
    </PayPalScriptProvider>
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      console.log('Service Worker registered:', reg);
    }).catch(err => {
      console.log('Service Worker registration failed:', err);
    });
  });
}
