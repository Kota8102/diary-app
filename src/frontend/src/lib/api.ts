import Axios, { type InternalAxiosRequestConfig } from 'axios'
import { getJwtToken } from '../utils/apiToken'

const API_URL = process.env.VITE_API_ENDPOINT

// リクエストインターセプターを非同期関数として定義
const authRequestInterceptor = async (config: InternalAxiosRequestConfig) => {
  try {
    const token = await getJwtToken()

    // ヘッダーにAcceptを追加
    config.headers.Accept = 'application/json'

    // トークンがある場合、Authorizationヘッダーに追加
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  } catch (error) {
    console.error('Error in request interceptor:', error)
    return Promise.reject(error)
  }
}

// Axiosインスタンスを作成
export const api = Axios.create({
  baseURL: API_URL,
})

// リクエストインターセプターをAxiosインスタンスに追加
api.interceptors.request.use(authRequestInterceptor)
