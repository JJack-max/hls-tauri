# HLS Video Player

一个基于 Tauri + React + TypeScript 构建的现代化视频播放器，支持本地文件、M3U8 流和流媒体播放。

## 功能特性

- 🎥 **多种视频格式支持**：本地文件、M3U8 播放列表、流媒体
- 📱 **现代化界面**：深色主题，响应式设计
- 🎵 **完整播放控制**：播放/暂停、进度条、音量控制、全屏
- 📋 **播放列表管理**：支持添加、删除、切换视频
- 🔄 **HLS 流支持**：基于 hls.js 的流畅播放体验
- ⚡ **高性能**：基于 Tauri 的跨平台桌面应用

## 技术栈

- **前端**: React 19 + TypeScript + Vite
- **桌面应用**: Tauri 2.0
- **视频播放**: hls.js + HTML5 Video
- **UI 组件**: Lucide React 图标
- **样式**: CSS3 + Flexbox

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm tauri dev
```

### 构建应用

```bash
pnpm tauri build
```

## 使用说明

### 添加视频

1. 点击左侧播放列表底部的"添加视频"按钮
2. 选择视频类型：
   - **本地文件**：选择本地视频文件
   - **M3U8 流**：输入 M3U8 播放列表 URL
   - **流媒体**：输入其他流媒体 URL
3. 输入视频标题
4. 点击"添加视频"完成

### 播放控制

- **播放/暂停**：点击播放按钮或视频区域
- **进度控制**：拖拽进度条或点击进度条跳转
- **音量控制**：使用音量滑块或静音按钮
- **全屏播放**：点击全屏按钮

### 播放列表

- 点击左侧播放列表中的视频项切换播放
- 当前播放的视频会高亮显示
- 支持添加多个视频到播放列表

## 开发环境设置

推荐使用以下 IDE 和插件：

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
