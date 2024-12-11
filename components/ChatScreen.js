import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const stompClient = useRef(null);
  const scrollViewRef = useRef();
  const subscription = useRef(null);
  const isConnected = useRef(false);

  const getProfileImage = (characterId) => {
    const profileImages = {
      1: require('../assets/characterProfile/character1.png'),
      2: require('../assets/characterProfile/character2.png'),
      3: require('../assets/characterProfile/character3.png'),
      4: require('../assets/characterProfile/character4.png'),
      5: require('../assets/characterProfile/character5.png'),
      6: require('../assets/characterProfile/character6.png'),
    };
    return profileImages[characterId];
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    const formattedHours = hours % 12 || 12;
    return `${ampm} ${formattedHours}:${minutes.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    setMessages([]);
    isConnected.current = false;
    connectWebSocket();
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (subscription.current) {
      subscription.current.unsubscribe();
      subscription.current = null;
    }

    if (stompClient.current?.connected) {
      const leaveMessage = {
        nickname: "관리자",
        characterId: 99,
        timestamp: Date.now()
      };
      try {
        stompClient.current.send('/app/leave', {}, JSON.stringify(leaveMessage));
        stompClient.current.disconnect();
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    }
    
    setMessages([]);
    setInputMessage('');
    isConnected.current = false;
    stompClient.current = null;
  };

  const connectWebSocket = () => {
    if (isConnected.current) return;

    try {
      const socket = new SockJS('https://gogolckh.ddns.net:10/ws');
      //const socket = new SockJS('http://192.168.219.186:5000/ws');
      stompClient.current = Stomp.over(socket);

      stompClient.current.connect({}, 
        () => {
          console.log('웹소켓 연결됨');
          isConnected.current = true;

          if (subscription.current) {
            subscription.current.unsubscribe();
          }

          subscription.current = stompClient.current.subscribe('/topic/chat', (message) => {
            try {
              const chatMessage = JSON.parse(message.body);
              if (chatMessage.message) {
                setMessages(prev => [...prev, chatMessage]);
              }
            } catch (error) {
              console.error('Message parsing error:', error);
            }
          });

          const joinMessage = {
            nickname: "관리자",
            characterId: 99,
            position: [8, 0, -15],
            rotation: 335,
            currentAnimation: 'Stop',
            modelPath: '/models/character99.glb',
            timestamp: Date.now()
          };

          stompClient.current.send('/app/join', {}, JSON.stringify(joinMessage));
        },
        (error) => {
          console.error('STOMP connection error:', error);
          isConnected.current = false;
          cleanup();
        }
      );
    } catch (error) {
      console.error('WebSocket connection error:', error);
      isConnected.current = false;
      cleanup();
    }
  };

  const sendMessage = () => {
    if (inputMessage.trim() && stompClient.current?.connected && isConnected.current) {
      try {
        const chatMessage = {
          nickname: "관리자",
          message: inputMessage,
          characterId: 99,
          timestamp: Date.now()
        };

        stompClient.current.send('/app/chat', {}, JSON.stringify(chatMessage));
        setInputMessage('');
      } catch (error) {
        console.error('Message send error:', error);
      }
    }
  };

  const isMyMessage = (nickname) => nickname === "관리자";

  const renderMessageGroup = (messages, startIndex) => {
    const currentMessage = messages[startIndex];
    const isMe = isMyMessage(currentMessage.nickname);
    const isFirstInSequence = startIndex === 0 || 
      messages[startIndex - 1].nickname !== currentMessage.nickname;
    const isLastInSequence = startIndex === messages.length - 1 || 
      messages[startIndex + 1].nickname !== currentMessage.nickname;

    return (
      <View key={startIndex} style={[
        styles.messageGroup,
        isFirstInSequence ? styles.firstMessageGroup : null
      ]}>
        {!isMe && isFirstInSequence && (
          <View style={styles.profileRow}>
            <Image 
              source={getProfileImage(currentMessage.characterId)}
              style={styles.profileImage}
            />
            <Text style={styles.nickname}>{currentMessage.nickname}</Text>
          </View>
        )}
        <View style={[
          styles.messageRow,
          isMe ? styles.myMessageRow : styles.otherMessageRow,
          !isFirstInSequence && !isMe && styles.followUpMessage
        ]}>
          {isMe && isLastInSequence && (
            <Text style={styles.myTimeText}>
              {formatTime(currentMessage.timestamp)}
            </Text>
          )}
          <View style={[
            styles.messageBubble,
            isMe ? styles.myMessageBubble : styles.otherMessageBubble
          ]}>
            <Text style={styles.messageText}>{currentMessage.message}</Text>
          </View>
          {!isMe && isLastInSequence && (
            <Text style={styles.otherTimeText}>
              {formatTime(currentMessage.timestamp)}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.scrollViewContent}
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
      >
        {messages.map((_, index) => renderMessageGroup(messages, index))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="메시지를 입력하세요..."
          multiline
        />
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={sendMessage}
        >
          <Text style={styles.sendButtonText}>전송</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesContainer: {
    flex: 1,
    padding: 12,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageGroup: {
    marginBottom: 2,
  },
  firstMessageGroup: {
    marginTop: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingLeft: 12,
  },
  profileImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 8,
  },
  nickname: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 2,
    paddingLeft: 58,
  },
  myMessageRow: {
    justifyContent: 'flex-end',
    paddingRight: 12,
    paddingLeft: 50,
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
    paddingRight: 50,
  },
  followUpMessage: {
    //marginLeft: 46,
    paddingLeft: 58,
  },
  messageBubble: {
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    maxWidth: '75%',
  },
  myMessageBubble: {
    backgroundColor: '#FEE500',
    marginLeft: 2,
  },
  otherMessageBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    color: '#000',
  },
  myTimeText: {
    fontSize: 11,
    color: '#8f8f8f',
    marginRight: 4,
    marginBottom: 1,
  },
  otherTimeText: {
    fontSize: 11,
    color: '#8f8f8f',
    marginLeft: 4,
    marginBottom: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    marginRight: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: '#FEE500',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '600',
  },
});