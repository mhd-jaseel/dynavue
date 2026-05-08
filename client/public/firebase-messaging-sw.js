importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyA8yW-vO0UaZ3eMJzU7sCp5VabN96Qf6zE",
  authDomain: "dynavue-13d34.firebaseapp.com",
  projectId: "dynavue-13d34",
  storageBucket: "dynavue-13d34.firebasestorage.app",
  messagingSenderId: "300319474748",
  appId: "1:300319474748:web:94ce9f6b5010afb3396f39",
  measurementId: "G-5K7XBXGXJN"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png' // Fallback icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
