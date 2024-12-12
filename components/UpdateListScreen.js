import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  Alert
} from 'react-native';
import axios from '../utils/axiosConfig';
import { LinearGradient } from 'expo-linear-gradient';

export default function UpdateListScreen({ navigation, route}) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [contentHeight] = useState(new Animated.Value(0));

  const handleDelete = (id) => {
    Alert.alert(
      "삭제 확인",
      "이 업데이트를 삭제하시겠습니까?",
      [
        {
          text: "취소",
          style: "cancel"
        },
        {
          text: "삭제", 
          onPress: async () => {
            try {
              await axios.delete(`/api/npc/deleteUpdate/${id}`);
              setSelectedUpdate(null);
              fetchUpdates();
              Alert.alert("성공", "업데이트가 삭제되었습니다.");
            } catch (error) {
              console.error('Error deleting update:', error);
              Alert.alert("오류", "삭제에 실패했습니다.");
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    if (route.params?.updatedItem && route.params?.updateType === 'edit') {
      // 수정된 아이템으로 현재 선택된 아이템 업데이트
      setSelectedUpdate(route.params.updatedItem);
      
      // updates 배열에서 해당 아이템 업데이트
      setUpdates(prevUpdates => 
        prevUpdates.map(update => 
          update.id === route.params.updatedItem.id ? route.params.updatedItem : update
        )
      );
      
      // 업데이트 내용 보이기
      Animated.timing(contentHeight, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false
      }).start();
      
      // 네비게이션 파라미터 초기화
      navigation.setParams({ updatedItem: null, updateType: null });
    }
  }, [route.params?.updatedItem]);

  useEffect(() => {
    fetchUpdates();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUpdates();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchUpdates = async () => {
    try {
      const response = await axios.get('/api/npc/getUpdates');
      setUpdates(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || '업데이트 내역을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = (update) => {
    if (selectedUpdate?.id === update.id) {
      
      Animated.timing(contentHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false
      }).start(() => setSelectedUpdate(null));
    } else {
      
      setSelectedUpdate(update);
      Animated.timing(contentHeight, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false
      }).start();
    }
  };

  const renderFAB = () => (
    <TouchableOpacity
      style={styles.fab}
      onPress={() => navigation.navigate('UpdateCreate')}
    >
      <Text style={styles.fabText}>+</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4c669f" />
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#192f6a', '#3b5998', '#4c669f']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        {updates.length === 0 ? (
          <Text style={styles.noUpdatesText}>업데이트 내역이 없습니다.</Text>
        ) : (
          !selectedUpdate ? (
            // 목록 보기
            updates.map((update, index) => (
              <View key={update.id || index} style={styles.updateContainer}>
                <TouchableOpacity
                  style={styles.updateTitle}
                  onPress={() => handleUpdateClick(update)}
                >
                  <Text style={styles.dateText}>{update.date}</Text>
                  <Text style={styles.titleText}>{update.title}</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            // 상세 내용 보기
            <View style={styles.updateContainer}>
              <TouchableOpacity
                style={[styles.updateTitle, styles.activeTitleContainer]}
                onPress={() => handleUpdateClick(selectedUpdate)}
              >
                <Text style={styles.dateText}>{selectedUpdate.date}</Text>
                <Text style={styles.titleText}>{selectedUpdate.title}</Text>
              </TouchableOpacity>
              <Animated.View
                style={[
                  styles.contentContainer,
                  {
                    maxHeight: contentHeight.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 500]
                    })
                  }
                ]}
              >
                <Text style={styles.contentText}>{selectedUpdate.content}</Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => navigation.navigate('UpdateCreate', { update: selectedUpdate })}
                  >
                    <Text style={styles.buttonText}>수정</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDelete(selectedUpdate.id)}
                  >
                    <Text style={styles.buttonText}>삭제</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          )
        )}
      </ScrollView>
      {!selectedUpdate && renderFAB()}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
  },
  noUpdatesText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
  },
  updateContainer: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  updateTitle: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 8,
  },
  activeTitleContainer: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dateText: {
    fontSize: 14,
    color: '#4c669f',
    marginBottom: 4,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  contentContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 16,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  contentText: {
    fontSize: 15,
    color: '#34495e',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e6bc4b',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
    padding: 12,
    borderRadius: 6,
    marginTop: 16,
    alignSelf: 'flex-end',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
  },
  editButton: {
    backgroundColor: '#e6bc4b',
    padding: 12,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
    padding: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});