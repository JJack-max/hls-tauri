import { useState, useEffect } from "react";
import VideoPlayer from "./components/VideoPlayer";
import FileSelector from "./components/FileSelector";
import "./App.css";

interface VideoItem {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  url: string;
  type: 'local' | 'm3u8' | 'stream';
}

function App() {
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const [playlist, setPlaylist] = useState<VideoItem[]>([
    {
      id: '1',
      title: '探索深海奥秘:珊瑚礁生态系统',
      duration: '04:15',
      thumbnail: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=200&h=120&fit=crop',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'stream'
    },
    {
      id: '2',
      title: '未来城市景观:智能交通',
      duration: '03:30',
      thumbnail: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=200&h=120&fit=crop',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      type: 'stream'
    },
    {
      id: '3',
      title: '古代文明遗迹:金字塔建筑',
      duration: '05:00',
      thumbnail: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=200&h=120&fit=crop',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      type: 'stream'
    },
    {
      id: '4',
      title: '太空探索新纪元:火星登陆',
      duration: '06:20',
      thumbnail: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=200&h=120&fit=crop',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      type: 'stream'
    },
    {
      id: '5',
      title: '健康生活指南:均衡饮食',
      duration: '02:45',
      thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=200&h=120&fit=crop',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      type: 'stream'
    }
  ]);
  const [isFileSelectorOpen, setIsFileSelectorOpen] = useState(false);

  const handleVideoSelect = (video: VideoItem) => {
    setCurrentVideo(video);
  };

  const handleAddVideo = () => {
    setIsFileSelectorOpen(true);
  };

  const handleFileSelect = (file: { url: string; type: 'local' | 'm3u8' | 'stream'; title: string }) => {
    const newVideo: VideoItem = {
      id: Date.now().toString(),
      title: file.title,
      duration: '00:00', // 实际应用中可以从视频元数据获取
      thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=200&h=120&fit=crop', // 默认缩略图
      url: file.url,
      type: file.type
    };
    
    setPlaylist(prev => [...prev, newVideo]);
    setCurrentVideo(newVideo);
  };

  // 测试代理功能
  useEffect(() => {
    const testProxy = async () => {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const testUrl = 'https://example.com/test.m3u8';
        const proxyUrl = await invoke<string>('create_proxy_url', { originalUrl: testUrl });
        console.log('代理URL创建成功:', proxyUrl);
      } catch (error) {
        console.error('代理测试失败:', error);
      }
    };

    // 只在开发环境中测试
    if (import.meta.env.DEV) {
      testProxy();
    }
  }, []);

  return (
    <div className="app">
      <VideoPlayer
        currentVideo={currentVideo}
        onVideoSelect={handleVideoSelect}
        onAddVideo={handleAddVideo}
        playlist={playlist}
      />
      <FileSelector
        isOpen={isFileSelectorOpen}
        onClose={() => setIsFileSelectorOpen(false)}
        onFileSelect={handleFileSelect}
      />
    </div>
  );
}

export default App;