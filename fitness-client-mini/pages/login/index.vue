<template>
  <view class="page-base flex flex-col items-center justify-center px-6">
    <view class="mt-40 mb-20 flex flex-col items-center">
      <view class="text-4xl font-black tracking-widest text-white mb-2">AI COACH</view>
      <view class="text-muted tracking-wide">极简·专注·科学</view>
    </view>

    <view class="w-full mt-10">
      <FlatBtn :full="true" :disabled="isLoading" @click="handleWechatLogin">
        <text v-if="isLoading">登录中...</text>
        <text v-else>微信快捷登录</text>
      </FlatBtn>
      <view class="text-center mt-6">
        <text class="text-[#333333] text-xs">登录即代表同意用户服务协议与隐私政策</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { http } from '../../api/request';
import { useUserStore } from '../../store/userStore';
import FlatBtn from '../../components/FlatBtn.vue';

const isLoading = ref(false);
const userStore = useUserStore();

const handleWechatLogin = () => {
  if (isLoading.value) return;
  isLoading.value = true;

  uni.login({
    provider: 'weixin',
    success: async (loginRes) => {
      if (loginRes.code) {
        try {
          // 1. 发送 code 到 Spring Boot 后端换取 Token
          const res = await http.post('/api/v1/auth/login/wechat', {
            code: loginRes.code
          });
          
          // 2. 将 token 存入本地缓存
          const token = res.accessToken || res.token || (res as any);
          uni.setStorageSync('token', token);
          
          // 3. 触发 Pinia 状态树，拉取该用户的最新身体画像数据
          await userStore.fetchUserProfile();
          
          uni.showToast({
            title: '登录成功',
            icon: 'success'
          });

          // 4. 智能路由分发：如果画像中存在 TDEE，说明是老用户，直接进首页；否则去填写身体数据
          if (userStore.profile && userStore.profile.tdee) {
            uni.reLaunch({ url: '/pages/index/index' });
          } else {
            uni.reLaunch({ url: '/pages/profile/index' });
          }
          
        } catch (error) {
          console.error('登录业务失败:', error);
          uni.showToast({
            title: '登录失败，请重试',
            icon: 'none'
          });
        } finally {
          isLoading.value = false;
        }
      } else {
        uni.showToast({ title: '获取微信凭证失败', icon: 'none' });
        isLoading.value = false;
      }
    },
    fail: (err) => {
      console.error('uni.login 失败:', err);
      uni.showToast({ title: '微信授权失败', icon: 'none' });
      isLoading.value = false;
    }
  });
};
</script>