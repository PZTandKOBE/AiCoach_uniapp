import { defineConfig } from 'vite';
import uniImport from '@dcloudio/vite-plugin-uni';
import UnoCSS from 'unocss/vite';

// 核心防御性代码：抹平不同 Node.js 环境下 CJS 与 ESM 模块默认导出的解包差异
// 如果它被包装成了一个对象 { default: [Function] }，我们就取 default；否则直接把它当函数用。
const uni = (uniImport as any).default || uniImport;

export default defineConfig({
  plugins: [
    uni(),
    UnoCSS()
  ]
});