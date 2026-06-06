<template>
  <view class="page-base camera-page">
    <view class="header-section">
      <text class="text-3xl font-black text-white block">饮食热量评估</text>
      <text class="text-muted mt-1 block">拍照或上传食物，GLM-4V 为你精准测算</text>
    </view>

    <view class="bg-[#141414] rounded-2xl camera-preview-card">
      <view 
        v-if="!imagePath" 
        class="upload-placeholder"
        @click="chooseImage"
      >
        <view class="icon-circle">
          <text class="text-[#00FF66] text-3xl font-light">+</text>
        </view>
        <text class="text-gray-500 font-medium">点击拍摄或上传食物照片</text>
      </view>
      
      <image 
        v-else 
        :src="imagePath" 
        mode="aspectFit" 
        class="preview-image"
        @click="chooseImage"
      />
      <view v-if="imagePath" class="reselect-btn" @click="chooseImage">
        <text class="text-white text-xs">重新选择</text>
      </view>
    </view>

    <DarkSurface v-if="analysisResult" class="result-card">
      <view class="flex justify-between items-center mb-4 border-b border-[#222] pb-3">
        <text class="text-white font-bold text-lg">识别结果</text>
        <text class="text-[#00FF66] text-xs px-2 py-1 bg-[#00FF66]/10 rounded">AI 测算完成</text>
      </view>
      
      <view class="flex justify-between items-end mb-4">
        <view>
          <text class="text-gray-400 text-xs block mb-1">主要食物</text>
          <text class="text-white font-bold text-xl">{{ analysisResult.food_name || '未知食物' }}</text>
        </view>
        <view class="text-right">
          <text class="text-gray-400 text-xs block mb-1">预估热量</text>
          <view class="flex items-baseline">
            <text class="text-[#00FF66] font-black text-3xl">{{ analysisResult.calories_kcal || '--' }}</text>
            <text class="text-gray-500 text-sm ml-1">kcal</text>
          </view>
        </view>
      </view>
      
      <view class="flex gap-2 bg-[#000000] p-3 rounded-lg border border-[#222]">
        <view class="flex-1 text-center border-r border-[#222]">
          <text class="text-gray-500 text-[10px] block mb-1">预估重量</text>
          <text class="text-white text-sm font-bold">{{ analysisResult.estimated_weight_g || '-' }} g</text>
        </view>
        <view class="flex-1 text-center">
          <text class="text-gray-500 text-[10px] block mb-1">蛋白质</text>
          <text class="text-white text-sm font-bold">{{ analysisResult.protein_g || '-' }} g</text>
        </view>
      </view>
    </DarkSurface>

    <view class="footer-action">
      <FlatBtn :full="true" :disabled="!imagePath || isAnalyzing" @click="analyzeCalories">
        <text v-if="isAnalyzing">AI 视觉引擎分析中...</text>
        <text v-else>立即测算热量</text>
      </FlatBtn>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DarkSurface from '@/components/DarkSurface.vue';
import FlatBtn from '@/components/FlatBtn.vue';

const imagePath = ref('');
const isAnalyzing = ref(false);
const analysisResult = ref<any>(null);

const chooseImage = () => {
  if (isAnalyzing.value) return;
  
  uni.chooseMedia({
    count: 1,
    mediaType: ['image'],
    sourceType: ['album', 'camera'],
    sizeType: ['compressed'], 
    success: (res) => {
      imagePath.value = res.tempFiles[0].tempFilePath;
      analysisResult.value = null; 
    },
    fail: (err) => {
      console.log('取消选择图片', err);
    }
  });
};

const analyzeCalories = () => {
  if (!imagePath.value || isAnalyzing.value) return;
  
  isAnalyzing.value = true;
  uni.showLoading({ title: 'AI 识别中' });

  const BASE_AI_URL = 'http://121.37.230.81:8000';
  const token = uni.getStorageSync('token');

  uni.uploadFile({
    url: `${BASE_AI_URL}/api/ai/v1/coach/vision/calories`, 
    filePath: imagePath.value,
    name: 'file', 
    header: {
      'Authorization': `Bearer ${token}`
    },
    success: (uploadFileRes) => {
      uni.hideLoading();
      isAnalyzing.value = false;
      
      try {
        const resData = JSON.parse(uploadFileRes.data);
        
        if (resData.code === 0 || resData.code === 200 || !resData.code) {
          analysisResult.value = resData.data || resData;
          uni.showToast({ title: '测算完成', icon: 'success' });
        } else {
          uni.showToast({ title: resData.message || '识别失败', icon: 'none' });
        }
      } catch (e) {
        console.error('解析识别结果失败', e);
        uni.showToast({ title: '服务器返回数据异常', icon: 'none' });
      }
    },
    fail: (err) => {
      uni.hideLoading();
      isAnalyzing.value = false;
      console.error('上传图片失败', err);
      uni.showToast({ title: '网络连接失败', icon: 'none' });
    }
  });
};
</script>

<style scoped>
/* 修复核心一：把 min-height 改成了绝对的 height，并在外部容器锁死 overflow */
.camera-page {
  height: calc(100vh - var(--window-top));
  box-sizing: border-box;
  padding: 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  overflow: hidden; 
}

.header-section {
  margin-top: 10px;
  margin-bottom: 24px;
  flex-shrink: 0;
}

/* 修复核心二：加入了 min-height: 0，让图片框在卡片弹出时可以被压缩，不至于撑爆页面 */
.camera-preview-card {
  flex: 1;
  min-height: 0; 
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  margin-bottom: 24px;
  padding: 16px; 
}

.upload-placeholder {
  flex: 1; 
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #333333;
  border-radius: 12px;
  transition: background-color 0.2s;
}

.upload-placeholder:active {
  background-color: #222222;
}

.icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #111111;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.preview-image {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
}

.reselect-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 6px 12px;
  border-radius: 999px;
  backdrop-filter: blur(4px);
  border: 1px solid #333333;
}

/* 修复核心三：干掉绿色边框和阴影 */
.result-card {
  flex-shrink: 0;
  margin-bottom: 24px;
}

.footer-action {
  margin-top: auto;
  flex-shrink: 0;
}
</style>