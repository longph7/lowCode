import axios from 'axios';
import type { AxiosError, AxiosInstance } from 'axios';

/**
 * API 客户端配置
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 请求拦截器
 */
apiClient.interceptors.request.use(
  (config) => {
    // 添加认证 token（如果需要）
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    console.log('[API] Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 */
apiClient.interceptors.response.use(
  (response) => {
    console.log('[API] Response:', response.status, response.config.url);
    return response.data;
  },
  (error: AxiosError) => {
    console.error('[API] Response error:', error);

    // 处理不同的错误状态码
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          console.error('[API] Bad Request:', data);
          break;
        case 401:
          console.error('[API] Unauthorized');
          // 可以跳转到登录页
          break;
        case 403:
          console.error('[API] Forbidden');
          break;
        case 404:
          console.error('[API] Not Found');
          break;
        case 429:
          console.error('[API] Too Many Requests');
          break;
        case 500:
          console.error('[API] Internal Server Error');
          break;
        default:
          console.error('[API] Unknown error:', status);
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('[API] No response received:', error.request);
    } else {
      // 请求设置错误
      console.error('[API] Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * 获取 API 基础 URL
 */
export function getAPIBaseURL(): string {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
}

/**
 * 检查 AI 功能是否启用
 */
export function isAIEnabled(): boolean {
  return import.meta.env.VITE_ENABLE_AI === 'true';
}

/**
 * 检查导出功能是否启用
 */
export function isExportEnabled(): boolean {
  return import.meta.env.VITE_ENABLE_EXPORT === 'true';
}

/**
 * 获取最大重试次数
 */
export function getMaxRetryCount(): number {
  return parseInt(import.meta.env.VITE_MAX_RETRY_COUNT || '3', 10);
}

/**
 * 获取 SSE 超时时间
 */
export function getSSETimeout(): number {
  return parseInt(import.meta.env.VITE_SSE_TIMEOUT || '30000', 10);
}

export default apiClient;
