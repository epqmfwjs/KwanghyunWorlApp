import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Image } from 'react-native';
import axios from '../utils/axiosConfig';

export default function UserListScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/member/connected');
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError('사용자 목록을 불러오는데 실패했습니다.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserRemove = async (nickname) => {
    Alert.alert(
      "유저 퇴장",
      `${nickname}님을 퇴장시키시겠습니까?`,
      [
        {
          text: "취소",
          style: "cancel"
        },
        {
          text: "확인",
          onPress: async () => {
            try {
              const response = await axios.delete(`/api/member/${nickname}`);
              if (response.status === 200) {
                Alert.alert("성공", "유저가 퇴장되었습니다.");
                fetchUsers();
              }
            } catch (err) {
              console.error('Error removing user:', err);
              Alert.alert("오류", "유저 퇴장에 실패했습니다.");
            }
          }
        }
      ],
      { cancelable: true }
    );
  };

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

  const renderItem = ({ item }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfoContainer}>
        <Image 
          source={getProfileImage(item.characterId)}
          style={styles.profileImage}
        />
        <View style={styles.userInfo}>
          <Text style={styles.nickname}>{item.nickname}</Text>
          <Text style={styles.characterInfo}>캐릭터 ID: {item.characterId}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => handleUserRemove(item.nickname)}
      >
        <Text style={styles.removeButtonText}>퇴장</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#87CEEB" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>접속 중인 유저 ({users.length})</Text>
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item.nickname}
        style={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>접속 중인 유저가 없습니다.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  userItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  nickname: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000',
  },
  characterInfo: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 10,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#ff0000',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  }
});