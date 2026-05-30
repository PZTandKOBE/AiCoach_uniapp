// src/api/request.ts

// 定义后端接口基础路径 (请根据你 Spring Boot 实际的本地调试端口或线上域名进行修改)
const BASE_URL = 'http://localhost:8080'; 

// 定义与 Spring Boot 后端约定的统一返回结构
export interface Result<T = any> {
  code: number;
  message: string;
  data: T;
}

/**
 * 核心网络请求封装
 * @param url 接口路径 (例如: /api/v1/auth/login/wechat)
 * @param method 请求方法
 * @param data 请求参数
 * @param header 自定义请求头
 */
export const request = <T = any>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any,
  header: any = {}
): Promise<T> => {
  return new Promise((resolve, reject) => {
    // 从本地缓存同步获取 Token 凭证
    let token = '';
    try {
      token = uni.getStorageSync('token') || '';
    } catch (e) {
      console.error('获取 token 失败', e);
    }

    // 组装默认请求头
    const defaultHeader: Record<string, string> = {
      'Content-Type': 'application/json',
      ...header
    };

    // 如果存在 token，严格按照 JWT 规范注入 Authorization 头
    if (token) {
      defaultHeader['Authorization'] = `Bearer ${token}`;
    }

    uni.request({
      url: BASE_URL + url,
      method,
      data,
      header: defaultHeader,
      success: (res: any) => {
        const statusCode = res.statusCode;
        
        // 1. 处理 HTTP 层面错误：401 鉴权失败 (Token 过期或未携带)
        if (statusCode === 401) {
          uni.showToast({
            title: '登录状态已失效，请重新登录',
            icon: 'none'
          });
          uni.removeStorageSync('token');
          // 强制路由推回登录/首页进行静默授权
          uni.reLaunch({ url: '/pages/index/index' }); 
          reject(new Error('Unauthorized'));
          return;
        }

        // 2. 处理其他非 200 系列的严重网络层异常
        if (statusCode < 200 || statusCode >= 300) {
          uni.showToast({
            title: `服务器异常 [${statusCode}]`,
            icon: 'none'
          });
          reject(new Error(`HTTP Error: ${statusCode}`));
          return;
        }

        // 3. 解析 Spring Boot 业务层数据结果 Result<T>
        const result = res.data as Result<T>;
        
        // 假设 code === 0 为业务成功标志 (需与后端 Result 结构严格对齐)
        if (result.code === 0) {
          // 直接剥离外壳，把最核心的 data 抛给前端业务层
          resolve(result.data);
        } else {
          // 业务校验失败 (例如参数错误、余额不足等)
          uni.showToast({
            title: result.message || '系统繁忙，请稍后再试',
            icon: 'none'
          });
          reject(new Error(result.message || 'Business Error'));
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '网络连接失败，请检查网络',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
};

// 导出语义化的快捷请求方法，方便页面调用
export const http = {
  get: <T = any>(url: string, data?: any) => request<T>(url, 'GET', data),
  post: <T = any>(url: string, data?: any, header?: any) => request<T>(url, 'POST', data, header),
  put: <T = any>(url: string, data?: any) => request<T>(url, 'PUT', data),
  delete: <T = any>(url: string, data?: any) => request<T>(url, 'DELETE', data)
};