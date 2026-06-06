import { defineConfig, presetIcons } from 'unocss';
// 核心修复：引入小程序专属 preset，抹平 WXSS 特殊字符编译冲突
import presetWeapp from 'unocss-preset-weapp';

export default defineConfig({
  presets: [
    // 移除默认的 presetUno，使用全面兼容小程序的 presetWeapp 替代
    presetWeapp(),
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