import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyA8yW-vO0UaZ3eMJzU7sCp5VabN96Qf6zE",
  authDomain: "dynavue-13d34.firebaseapp.com",
  projectId: "dynavue-13d34",
  storageBucket: "dynavue-13d34.firebasestorage.app",
  messagingSenderId: "300319474748",
  appId: "1:300319474748:web:94ce9f6b5010afb3396f39",
  measurementId: "G-5K7XBXGXJN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { 
        vapidKey: 'BOS6DCjK8xPu_ypi0uzW_9Zo5yrRPo9CB9DUZgB3eL4EKiaqouWeoKLIM2BgdzbaIPB4Giz7mxiR9d7eAOBhi3U'
      });
      if (token) {
        return token;
      }
    }
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export default app;
