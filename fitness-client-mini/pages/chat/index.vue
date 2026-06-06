<template>
  <view class="page-base flex flex-col h-screen overflow-hidden relative">
    <view class="pt-12 pb-4 px-5 bg-[#000000] z-20 shrink-0 border-b border-[#222]">
      <view class="text-white font-bold text-lg text-center">AI 智能教练</view>
    </view>

    <scroll-view 
      scroll-y 
      class="flex-1 w-full box-border" 
      :scroll-into-view="scrollToId"
      scroll-with-animation
    >
      <view class="px-4 pt-4 pb-32"> 
        <view 
          v-for="(msg, index) in messages" 
          :key="index"
          :id="'msg-' + index"
          class="mb-6 flex flex-col"
          :class="msg.role === 'user' ? 'items-end' : 'items-start'"
        >
          <view class="text-xs text-gray-500 mb-1 px-1">
            {{ msg.role === 'user' ? '我' : 'AI Coach' }}
          </view>
          
          <view 
            class="px-4 py-3 max-w-[85%] text-[15px] leading-relaxed break-words shadow-sm"
            :class="msg.role === 'user' ? 'bg-[#00FF66] text-black rounded-2xl rounded-tr-sm font-medium' : 'bg-[#141414] text-white rounded-2xl rounded-tl-sm'"
          >
            <text v-if="msg.content === '' && isGenerating && msg.role === 'ai'" class="animate-pulse font-black text-[#00FF66]">▌</text>
            <text v-else>{{ msg.content }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="chat-footer">
      <textarea 
        v-model="inputText"
        :disabled="isGenerating"
        placeholder="输入你的健身或饮食需求..." 
        placeholder-class="text-gray-600"
        class="chat-input"
        :auto-height="true"
        :cursor-spacing="20"
        :show-confirm-bar="false"
      />
      <view 
        @click="sendMessage"
        class="send-btn"
        :class="inputText.trim() && !isGenerating ? 'active' : 'disabled'"
      >
        <text class="text-black font-black text-xl">↑</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { useUserStore } from '@/store/userStore';

const userStore = useUserStore();
const profile = userStore.profile;

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const messages = ref<Message[]>([
  { role: 'ai', content: '你好！我是你的专属 AI 教练。我已读取了你的身体基线数据。今天想调整训练计划，还是定制饮食方案？' }
]);
const inputText = ref('');
const isGenerating = ref(false);
const scrollToId = ref('');

const scrollToBottom = async () => {
  await nextTick();
  setTimeout(() => {
    scrollToId.value = 'msg-' + (messages.value.length - 1);
  }, 50);
};

const decodeUTF8 = (buffer: ArrayBuffer): string => {
  try {
    return new TextDecoder('utf-8').decode(buffer);
  } catch (e) {
    const arr = new Uint8Array(buffer);
    let str = '';
    for (let i = 0; i < arr.length; i++) {
      str += String.fromCharCode(arr[i]);
    }
    return decodeURIComponent(escape(str));
  }
};

const sendMessage = () => {
  const text = inputText.value.trim();
  if (!text || isGenerating.value) return;

  messages.value.push({ role: 'user', content: text });
  inputText.value = '';
  
  messages.value.push({ role: 'ai', content: '' });
  const aiMessageIndex = messages.value.length - 1;
  isGenerating.value = true;
  scrollToBottom();

  const BASE_AI_URL = 'http://121.37.230.81:8000'; 
  const token = uni.getStorageSync('token');

  const requestTask = uni.request({
    url: `${BASE_AI_URL}/api/ai/v1/coach/generate/stream`,
    method: 'POST',
    enableChunked: true,
    header: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    data: {
      user_id: profile?.userId || 'unknown',
      task_type: 'general',
      prompt: text,
      profile_data: profile 
    },
    success: () => {
      isGenerating.value = false;
    },
    fail: (err) => {
      console.error('SSE 请求失败', err);
      messages.value[aiMessageIndex].content = '网络连接异常，请重试。';
      isGenerating.value = false;
    }
  });

  let streamBuffer = ''; 

  requestTask.onChunkReceived((res) => {
    const chunkText = decodeUTF8(res.data);
    streamBuffer += chunkText;

    const lines = streamBuffer.split('\n');
    streamBuffer = lines.pop() || '';

    lines.forEach(line => {
      const trimLine = line.trim();
      if (trimLine.startsWith('data:')) {
        const jsonStr = trimLine.replace('data:', '').trim();
        if (jsonStr === '[DONE]') {
          isGenerating.value = false;
          return;
        }
        try {
          const dataObj = JSON.parse(jsonStr);
          if (dataObj.chunk) {
            messages.value[aiMessageIndex].content += dataObj.chunk;
            scrollToBottom();
          }
        } catch (e) {
          // 忽略不完整的 JSON 块
        }
      }
    });
  });
};
</script>

<style scoped>
/* 隐藏原生滚动条 */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}

/* 核心修复：纯原生 CSS 接管底部输入栏 */
.chat-footer {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  box-sizing: border-box;
  background-color: #000000;
  border-top: 1px solid #222222;
  padding: 12px 16px;
  /* 完美兼容小程序底部安全区 */
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  display: flex;
  align-items: flex-end;
  gap: 12px;
  z-index: 999;
}

.chat-input {
  flex: 1;
  background-color: #141414;
  color: #ffffff;
  padding: 12px;
  border-radius: 12px;
  min-height: 20px;
  max-height: 100px;
  box-sizing: border-box;
  font-size: 15px;
}

.send-btn {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.send-btn.active {
  background-color: #00FF66;
}

.send-btn.disabled {
  background-color: #222222;
  pointer-events: none;
}
</style>