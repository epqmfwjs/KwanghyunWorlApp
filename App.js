import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import axios from './utils/axiosConfig';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import ChatScreen from './components/ChatScreen';
import UserListScreen from './components/UserListScreen';
import MoveSite from './components/MoveSite';
import UpdateListScreen from './components/UpdateListScreen';
import UpdateCreateScreen from './components/UpdateCreateScreen';

const Stack = createNativeStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const [fcmToken, setFcmToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  const [errorMessage, setErrorMessage] = useState('');

  const sendTokenToServer = async (token) => {
    try {
      console.log('Sending FCM token to server:', token);
      const response = await axios.post('/api/notification/register', {
        userId: DEVICE_ID,
        token: token
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log('Token registration response:', response.data);
    } catch (error) {
      console.error('Error registering token:', error);
      setErrorMessage('ERROR: ' + error.message);
    }
  };

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      setFcmToken(token);
      if (token) {
        sendTokenToServer(token);
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("Notification response:", response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  function HomeScreen({ navigation }) {
    return (
      <LinearGradient
        colors={['#192f6a','#d04a4a', '#e6bc4b']}
        //colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.container}
      >
        <StatusBar style="light" />
        <View style={styles.header}>
          <Text style={styles.title}>KwanghunWorld</Text>
          <Text style={styles.subtitle}>Admin Hub</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.buttonShadow]}
            onPress={() => navigation.navigate('Chat')}
          >
            <Text style={styles.buttonText}>채팅 참여하기</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.buttonShadow]}
            onPress={() => navigation.navigate('UserList')}
          >
            <Text style={styles.buttonText}>접속 유저</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.buttonShadow]}
            onPress={() => navigation.navigate('UpdateList')}
          >
            <Text style={styles.buttonText}>업데이트 리스트</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.buttonShadow]}
            onPress={() => MoveSite()}
          >
            <Text style={styles.buttonText}>사이트 이동</Text>
          </TouchableOpacity>
        </View>

        {notification && (
          <View style={styles.notificationContainer}>
            <Text style={styles.notificationTitle}>마지막 알림:</Text>
            <Text style={styles.notificationContent}>{notification.request.content.title}</Text>
            <Text style={styles.notificationContent}>{notification.request.content.body}</Text>
          </View>
        )}

        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}
      </LinearGradient>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Chat" 
          component={ChatScreen}
          options={{ 
            title: 'KwanghunWorld 채팅',
            headerStyle: {
              backgroundColor: '#4c669f',
            },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen 
          name="UserList" 
          component={UserListScreen}
          options={{ 
            title: '접속 유저 목록',
            headerStyle: {
              backgroundColor: '#4c669f',
            },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen 
          name="UpdateList" 
          component={UpdateListScreen}
          options={{ 
            title: '업데이트 리스트',
            headerStyle: {
              backgroundColor: '#4c669f',
            },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen 
          name="UpdateCreate" 
          component={UpdateCreateScreen}
          options={{ 
            title: '업데이트 등록',
            headerStyle: {
              backgroundColor: '#4c669f',
            },
            headerTintColor: '#fff',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    alert('실제 디바이스에서만 알림을 받을 수 있습니다');
    return;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('알림 권한이 필요합니다!');
      return;
    }

    const token = await Notifications.getDevicePushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId,
    });
    console.log('FCM token:', token);
    return token.data;
  } catch (error) {
    console.error('Error getting push token:', error);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: Constants.statusBarHeight,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#E0E0E0',
    letterSpacing: 1,
  },
  buttonContainer: {
    width: '85%',
    alignItems: 'center',
    gap: 20,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 18,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
  },
  buttonShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    color: '#2c3e50',
    fontSize: 18,
    fontWeight: '600',
  },
  notificationContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 7,
  },
  notificationTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#2c3e50',
  },
  notificationContent: {
    fontSize: 16,
    color: '#34495e',
    lineHeight: 22,
  },
  errorContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: 'rgba(244, 67, 54, 0.95)',
    borderRadius: 15,
    width: '100%',
  },
  errorText: {
    fontSize: 16,
    color: '#fff',
  },
});