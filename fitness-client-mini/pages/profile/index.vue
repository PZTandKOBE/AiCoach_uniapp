<template>
  <view class="page-base p-5 pb-10">
    <view class="mt-8 mb-8">
      <view class="text-3xl font-black text-white mb-2">建立健康基线</view>
      <view class="text-muted">完善身体数据，AI 将为你计算专属 TDEE 与方案</view>
    </view>

    <DarkSurface class="mb-5">
      <view class="text-white font-bold mb-4">生理指标</view>
      
      <view class="flex items-center justify-between mb-6">
        <text class="text-sm text-gray-400">性别</text>
        <view class="flex gap-3">
          <view 
            class="px-5 py-2 rounded-lg text-sm font-medium transition-colors border border-[#333]"
            :class="formData.gender === 'MALE' ? 'bg-[#00FF66] text-black border-transparent' : 'text-gray-400'"
            @click="formData.gender = 'MALE'"
          >男生</view>
          <view 
            class="px-5 py-2 rounded-lg text-sm font-medium transition-colors border border-[#333]"
            :class="formData.gender === 'FEMALE' ? 'bg-[#00FF66] text-black border-transparent' : 'text-gray-400'"
            @click="formData.gender = 'FEMALE'"
          >女生</view>
        </view>
      </view>

      <view class="flex items-center justify-between mb-6 border-b border-[#333] pb-2">
        <text class="text-sm text-gray-400">年龄 (岁)</text>
        <input 
          type="number" 
          v-model.number="formData.age" 
          placeholder="请输入" 
          placeholder-class="text-gray-600"
          class="text-right text-white font-medium text-lg caret-[#00FF66]"
        />
      </view>

      <view class="flex items-center justify-between mb-6 border-b border-[#333] pb-2">
        <text class="text-sm text-gray-400">身高 (cm)</text>
        <input 
          type="digit" 
          v-model.number="formData.heightCm" 
          placeholder="请输入" 
          placeholder-class="text-gray-600"
          class="text-right text-white font-medium text-lg caret-[#00FF66]"
        />
      </view>

      <view class="flex items-center justify-between border-b border-[#333] pb-2">
        <text class="text-sm text-gray-400">体重 (kg)</text>
        <input 
          type="digit" 
          v-model.number="formData.weightKg" 
          placeholder="请输入" 
          placeholder-class="text-gray-600"
          class="text-right text-white font-medium text-lg caret-[#00FF66]"
        />
      </view>
    </DarkSurface>

    <DarkSurface class="mb-10">
      <view class="text-white font-bold mb-4">健身目标</view>
      
      <view class="flex gap-3 mb-8">
        <view 
          v-for="goal in goals" :key="goal.value"
          class="flex-1 py-3 rounded-lg text-center text-sm font-medium transition-colors border border-[#333]"
          :class="formData.goal === goal.value ? 'bg-[#00FF66] text-black border-transparent' : 'text-gray-400'"
          @click="formData.goal = goal.value"
        >
          {{ goal.label }}
        </view>
      </view>

      <view class="text-white font-bold mb-4">饮食忌口/偏好</view>
      <input 
        type="text" 
        v-model="formData.preference" 
        placeholder="例如：乳糖不耐受、不吃香菜 (选填)" 
        placeholder-class="text-gray-600"
        class="w-full bg-[#000000] border border-[#333] rounded-lg p-3 text-white text-sm caret-[#00FF66]"
      />
    </DarkSurface>

    <FlatBtn :full="true" :disabled="isLoading" @click="handleSubmit">
      <text v-if="isLoading">计算中...</text>
      <text v-else>生成专属基线</text>
    </FlatBtn>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useUserStore } from '@/store/userStore';
import DarkSurface from '@/components/DarkSurface.vue';
import FlatBtn from '@/components/FlatBtn.vue';

const userStore = useUserStore();
const isLoading = ref(false);

// 严格对齐后端 UserProfileReq
const formData = reactive({
  gender: 'MALE',
  age: '' as number | '',
  heightCm: '' as number | '',
  weightKg: '' as number | '',
  goal: 'FAT_LOSS',
  preference: ''
});

// 目标枚举
const goals = [
  { label: '减脂', value: 'FAT_LOSS' },
  { label: '塑形', value: 'SHAPING' },
  { label: '增肌', value: 'MUSCLE_GAIN' }
];

const handleSubmit = async () => {
  // 基础校验
  if (!formData.age || !formData.heightCm || !formData.weightKg) {
    uni.showToast({ title: '请填写完整的生理指标', icon: 'none' });
    return;
  }

  if (isLoading.value) return;
  isLoading.value = true;

  try {
    // 提交到后端，Spring Boot 会计算 TDEE 并返回最新数据，更新 Pinia
    await userStore.updateUserProfile({
      gender: formData.gender,
      age: Number(formData.age),
      heightCm: Number(formData.heightCm),
      weightKg: Number(formData.weightKg),
      goal: formData.goal,
      preference: formData.preference
    });

    uni.showToast({ title: '基线建立成功', icon: 'success' });
    
    // 延迟跳转，让用户看清成功提示
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/index/index' });
    }, 1000);

  } catch (error) {
    console.error('保存基线失败:', error);
    // request.ts 里已经处理了 Toast，这里只需要放开 loading
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* 去除数字输入框默认的上下箭头 (针对部分小程序环境) */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>