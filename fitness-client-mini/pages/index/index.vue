<template>
  <view class="page-base p-5 flex flex-col min-h-screen pb-10">
    <view class="mt-8 mb-6">
      <view class="flex items-baseline gap-2">
        <text class="text-3xl font-black text-white block tracking-wide">HELLO,</text>
        <text class="text-2xl font-bold text-[#00FF66] tracking-widest">挑战者</text>
      </view>
      <text class="text-muted mt-2 block">今天是变得更强的绝佳时机。</text>
    </view>

    <DarkSurface class="mb-8 relative overflow-hidden">
      <view class="absolute top-[-20px] right-[-20px] w-24 h-24 bg-[#00FF66] opacity-5 rounded-full"></view>
      
      <view class="flex justify-between items-end mb-6 relative z-10">
        <text class="text-gray-400 text-sm">今日推荐消耗基线 (TDEE)</text>
        <view class="flex items-baseline">
          <text class="text-accent text-4xl font-black tracking-tighter">{{ profile?.tdee || '---' }}</text>
          <text class="text-gray-500 text-sm ml-1 font-medium">kcal</text>
        </view>
      </view>
      
      <view class="flex justify-between border-t border-[#222] pt-5 relative z-10">
        <view class="flex flex-col">
          <text class="text-xs text-gray-500 mb-1">当前体重</text>
          <text class="text-white font-bold text-lg">{{ profile?.weightKg || '--' }} <text class="text-xs font-normal text-gray-400">kg</text></text>
        </view>
        <view class="flex flex-col text-center">
          <text class="text-xs text-gray-500 mb-1">当前身高</text>
          <text class="text-white font-bold text-lg">{{ profile?.heightCm || '--' }} <text class="text-xs font-normal text-gray-400">cm</text></text>
        </view>
        <view class="flex flex-col text-right">
          <text class="text-xs text-gray-500 mb-1">当前阶段</text>
          <text class="text-white font-bold text-lg">{{ goalText }}</text>
        </view>
      </view>
    </DarkSurface>

    <view class="flex-1 flex flex-col gap-4">
      
      <view class="action-card" @click="goToChat">
        <view>
          <text class="text-white font-bold text-xl block mb-1">定制专属方案</text>
          <text class="text-gray-500 text-sm">基于 RAG 知识库与你的基线</text>
        </view>
      </view>

      <view class="action-card" @click="goToCamera">
        <view>
          <text class="text-white font-bold text-xl block mb-1">拍饮食算热量</text>
          <text class="text-gray-500 text-sm">GLM-4V 视觉引擎精准识别</text>
        </view>
      </view>
      
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/userStore';
import DarkSurface from '@/components/DarkSurface.vue';

const userStore = useUserStore();
const profile = computed(() => userStore.profile);

const goalText = computed(() => {
  const map: Record<string, string> = {
    'FAT_LOSS': '减脂',
    'SHAPING': '塑形',
    'MUSCLE_GAIN': '增肌'
  };
  return profile.value?.goal ? map[profile.value.goal] : '未知';
});

onShow(async () => {
  if (!userStore.isLoaded) {
    try {
      await userStore.fetchUserProfile();
      if (userStore.profile && !userStore.profile.tdee) {
        uni.reLaunch({ url: '/pages/profile/index' });
      }
    } catch (error) {
      console.log('首页拉取用户信息失败，等待 request.ts 统一拦截');
    }
  }
});

const goToChat = () => {
  uni.navigateTo({ url: '/pages/chat/index' });
};

const goToCamera = () => {
  uni.navigateTo({ url: '/pages/camera/index' });
};
</script>

<style scoped>
/* 核心修复：用纯正 CSS 彻底解决边框不渲染的问题 */
.action-card {
  background-color: #141414;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* 增加明显的暗灰色边框 */
  border: 1px solid #333333; 
  transition: all 0.2s ease;
}

.action-card:active {
  opacity: 0.8;
  /* 点击时给予运动绿色的边框反馈 */
  border-color: rgba(0, 255, 102, 0.5); 
  transform: scale(0.98);
}

.camera-icon-wrapper {
  border: 1px solid #333333;
}
</style>