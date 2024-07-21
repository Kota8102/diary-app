import Axios, { InternalAxiosRequestConfig } from "axios";

import { getJwtToken } from '../lib/fetcher';

const API_URL = process.env.VITE_API_ENDPOINT;

// リクエストインターセプターを定義
const authRequestInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = getJwtToken(); // JWTトークンを取得

  // ヘッダーにAcceptを追加
  config.headers.Accept = 'application/json';

  // トークンがある場合、Authorizationヘッダーに追加
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

// Axiosインスタンスを作成
export const api = Axios.create({
  baseURL: API_URL, // ベースURLを設定
});

// リクエストインターセプターをAxiosインスタンスに追加
api.interceptors.request.use(authRequestInterceptor);
