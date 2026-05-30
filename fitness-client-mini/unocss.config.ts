import { defineConfig, presetIcons, presetUno } from 'unocss';

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons()
  ],
  shortcuts: {
    // 页面底层 (纯黑)
    'page-base': 'bg-[#000000] min-h-screen text-white',
    // 极暗灰卡片 (无边框无阴影)
    'surface-card': 'bg-[#141414] rounded-2xl p-5',
    // 运动绿强调文字
    'text-accent': 'text-[#00FF66] font-medium',
    // 核心主按钮 (绿底黑字)
    'btn-primary': 'bg-[#00FF66] text-black rounded-lg py-3.5 flex justify-center items-center font-bold active:opacity-70 transition-opacity',
    // 次要辅助文本
    'text-muted': 'text-[#666666] text-sm'
  }
});