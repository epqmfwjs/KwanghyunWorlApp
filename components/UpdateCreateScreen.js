import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from '../utils/axiosConfig';

export default function UpdateCreateScreen({ navigation, route  }) {
  const updateToEdit = route.params?.update;
  const [title, setTitle] = useState(updateToEdit?.title || '');
  const [content, setContent] = useState(updateToEdit?.content || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('알림', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      if (updateToEdit) {
        // 수정 모드
        const response = await axios.put(`/api/npc/updateUpdate/${updateToEdit.id}`, {
          title: title.trim(),
          content: content.trim()
        });
        Alert.alert('성공', '업데이트가 수정되었습니다.');
        // 수정된 데이터를 가지고 돌아가기
        navigation.navigate('UpdateList', { 
          updatedItem: response.data,
          updateType: 'edit'
        });
      } else {
        // 새로운 등록
        await axios.post('/api/npc/setUpdate', {
          title: title.trim(),
          content: content.trim()
        });
        Alert.alert('성공', '업데이트가 등록되었습니다.');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('오류', updateToEdit ? '수정에 실패했습니다.' : '등록에 실패했습니다.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#192f6a', '#3b5998', '#4c669f']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>제목</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="업데이트 제목을 입력하세요"
            placeholderTextColor="#666"
          />

          <Text style={styles.label}>내용</Text>
          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="업데이트 내용을 입력하세요"
            placeholderTextColor="#666"
            multiline
            numberOfLines={10}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? '처리 중...' : updateToEdit ? '수정하기' : '등록하기'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  contentInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    minHeight: 200,
  },
  submitButton: {
    backgroundColor: '#e6bc4b',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#666',
  },
  submitButtonText: {
    color: '#66666',
    fontSize: 16,
    fontWeight: '600',
  },
});