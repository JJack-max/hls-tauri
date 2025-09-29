import React, { useRef, useEffect, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Search, Bell, Settings, User, Plus } from 'lucide-react';

interface VideoItem {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  url: string;
  type: 'local' | 'm3u8' | 'stream';
}

interface VideoPlayerProps {
  currentVideo: VideoItem | null;
  onVideoSelect: (video: VideoItem) => void;
  onAddVideo: () => void;
  playlist: VideoItem[];
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  currentVideo,
  onVideoSelect,
  onAddVideo,
  playlist
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // 初始化HLS播放器，使用代理处理跨域问题
  const initializeHls = useCallback(async (url: string) => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    // 对于外部URL，创建代理URL
    let finalUrl = url;
    if (url.startsWith('http')) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        finalUrl = await invoke<string>('create_proxy_url', { originalUrl: url });
        console.log('使用代理URL:', finalUrl);
      } catch (error) {
        console.error('创建代理URL失败，使用原始URL:', error);
      }
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      
      hls.loadSource(finalUrl);
      hls.attachMedia(videoRef.current!);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest parsed');
      });
      
      hls.on(Hls.Events.ERROR, (event: any, data: any) => {
        console.error('HLS error:', data);
        if (data.type === 'networkError') {
          console.log('Network error detected when loading HLS stream');
        }
      });
      
      hlsRef.current = hls;
    } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari原生支持HLS
      videoRef.current.src = finalUrl;
    }
  }, []);

  // 加载视频
  const loadVideo = useCallback((video: VideoItem) => {
    if (!videoRef.current) return;

    // 清理之前的HLS实例
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (video.type === 'm3u8' || video.type === 'stream') {
      // 对于外部视频源，使用代理处理跨域问题
      initializeHls(video.url);
    } else {
      // 本地文件
      videoRef.current.src = video.url;
    }
  }, [initializeHls]);

  // 当当前视频改变时加载新视频
  useEffect(() => {
    if (currentVideo) {
      loadVideo(currentVideo);
    }
  }, [currentVideo, loadVideo]);

  // 播放/暂停
  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // 时间更新
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // 视频加载完成
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // 进度条拖拽
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const newTime = parseFloat(e.target.value);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // 音量控制
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  // 静音切换
  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  // 全屏切换
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // 格式化时间
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // 清理资源
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="video-player-container">
      {/* 顶部导航栏 */}
      <div className="top-nav">
        <div className="nav-left">
          <div className="logo">★</div>
        </div>
        <div className="nav-right">
          <Search className="nav-icon" />
          <Bell className="nav-icon" />
          <Settings className="nav-icon" />
          <User className="nav-icon" />
        </div>
      </div>

      <div className="main-content">
        {/* 左侧播放列表 */}
        <div className="playlist-sidebar">
          <div className="playlist-header">
            <h2>播放列表</h2>
          </div>
          <div className="playlist-items">
            {playlist.map((video) => (
              <div
                key={video.id}
                className={`playlist-item ${currentVideo?.id === video.id ? 'active' : ''}`}
                onClick={() => onVideoSelect(video)}
              >
                <div className="video-thumbnail">
                  <img src={video.thumbnail} alt={video.title} />
                </div>
                <div className="video-info">
                  <h3 className="video-title">{video.title}</h3>
                  <span className="video-duration">{video.duration}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="add-video-btn" onClick={onAddVideo}>
            <Plus className="btn-icon" />
            添加视频
          </button>
        </div>

        {/* 右侧视频播放区域 */}
        <div className="video-main">
          {currentVideo ? (
            <>
              <h1 className="video-title-main">{currentVideo.title}</h1>
              <div className="video-container">
                <video
                  ref={videoRef}
                  className="video-element"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                >
                  您的浏览器不支持视频播放。
                </video>
                <div className="video-overlay">
                  <button className="play-overlay-btn" onClick={togglePlayPause}>
                    {isPlaying ? <Pause size={48} /> : <Play size={48} />}
                  </button>
                </div>
              </div>
              
              {/* 视频控制栏 */}
              <div className="video-controls">
                <button className="control-btn" onClick={togglePlayPause}>
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                
                <div className="time-display">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
                
                <div className="progress-container">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="progress-bar"
                  />
                </div>
                
                <div className="volume-container">
                  <button className="control-btn" onClick={toggleMute}>
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="volume-bar"
                  />
                </div>
                
                <button className="control-btn" onClick={toggleFullscreen}>
                  <Maximize size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="no-video">
              <h2>请选择一个视频开始播放</h2>
            </div>
          )}
        </div>
      </div>

      {/* 底部版权信息 */}
      <div className="footer">
        <span>Made with</span>
        <span className="v-logo">V</span>
      </div>
    </div>
  );
};

export default VideoPlayer;