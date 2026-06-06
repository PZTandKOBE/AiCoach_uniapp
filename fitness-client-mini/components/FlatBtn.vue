<template>
  <button 
    class="btn-primary border-none m-0" 
    :class="[full ? 'w-full' : 'px-8', disabled ? 'opacity-50 pointer-events-none' : '']"
    @click="handleClick"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
const props = defineProps({
  full: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click']);

const handleClick = () => {
  if (!props.disabled) {
    emit('click');
  }
};
</script>

<style scoped>
/* 清除小程序原生 button 的默认边框线 */
button::after {
  border: none;
}
</style>