// src/store/userStore.ts
import { defineStore } from 'pinia';
// 引入我们刚才封装好的网络请求工具
import { http } from '../api/request';

// 严格对齐 Spring Boot 接口文档中的 UserProfile 数据结构
export interface UserProfile {
  id?: number;
  userId?: string;
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  goal: string;
  preference: string;
  tdee?: number; // 基础代谢率 (由后端计算后返回)
  createTime?: string;
  updateTime?: string;
}

export const useUserStore = defineStore('userStore', {
  state: () => ({
    // 用户的核心身体画像缓存
    profile: null as UserProfile | null,
    // 标记是否已经从服务器同步过，避免频繁发送冗余请求
    isLoaded: false
  }),

  actions: {
    /**
     * 获取最新用户画像 (拉取 Spring Boot 后端并缓存至本地)
     */
    async fetchUserProfile() {
      try {
        // 调用我们封装的 http.get，这里的 data 已经是剥离了 Result 外壳的纯业务数据
        const data = await http.get<UserProfile>('/api/v1/user/profile/info');
        this.profile = data;
        this.isLoaded = true;
        return data;
      } catch (error) {
        console.error('拉取用户画像缓存失败:', error);
        throw error;
      }
    },

    /**
     * 更新用户身体数据与偏好 (向后端提交，并用返回的最新数据刷新缓存)
     */
    async updateUserProfile(updateData: Partial<UserProfile>) {
      try {
        // 提交更新。根据你的后端逻辑，Spring Boot 收到更新后会重新计算 TDEE 并清空 Redis，
        // 然后将计算后的最新完整画像返回给我们。
        const data = await http.post<UserProfile>('/api/v1/user/profile/update', updateData);
        // 直接用包含了最新 TDEE 的数据覆盖本地状态
        this.profile = data; 
        return data;
      } catch (error) {
        console.error('更新用户画像失败:', error);
        throw error;
      }
    },

    /**
     * 清除本地画像缓存 (通常在用户退出登录，或者 401 鉴权失效被强制踢回首页时调用)
     */
    clearProfile() {
      this.profile = null;
      this.isLoaded = false;
    }
  }
});