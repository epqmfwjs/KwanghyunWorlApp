import { Linking, Alert } from 'react-native';

export const MoveSite = async () => {
  const url = 'https://gogolckh.ddns.net:10';
  
  try {
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`URL을 열 수 없습니다: ${url}`);
    }
  } catch (error) {
    Alert.alert(`오류가 발생했습니다: ${error.message}`);
  }
};

export default MoveSite;