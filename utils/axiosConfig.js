import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://gogolckh.ddns.net:10',
  //baseURL: 'http://192.168.219.186:5000',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default instance;