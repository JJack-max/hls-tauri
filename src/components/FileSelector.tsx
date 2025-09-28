import React, { useState } from 'react';
import { X, FileVideo, Link, Radio } from 'lucide-react';

interface FileSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: { url: string; type: 'local' | 'm3u8' | 'stream'; title: string }) => void;
}

const FileSelector: React.FC<FileSelectorProps> = ({ isOpen, onClose, onFileSelect }) => {
  const [selectedType, setSelectedType] = useState<'local' | 'm3u8' | 'stream'>('local');
  const [fileUrl, setFileUrl] = useState('');
  const [fileTitle, setFileTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fileUrl.trim() || !fileTitle.trim()) {
      alert('请输入文件URL和标题');
      return;
    }

    setIsLoading(true);
    
    try {
      // 这里可以添加URL验证逻辑
      onFileSelect({
        url: fileUrl.trim(),
        type: selectedType,
        title: fileTitle.trim()
      });
      
      // 重置表单
      setFileUrl('');
      setFileTitle('');
      onClose();
    } catch (error) {
      console.error('文件选择错误:', error);
      alert('文件选择失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      setFileTitle(file.name.replace(/\.[^/.]+$/, '')); // 移除文件扩展名
    }
  };

  if (!isOpen) return null;

  return (
    <div className="file-selector-overlay">
      <div className="file-selector-modal">
        <div className="file-selector-header">
          <h2>添加视频</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="file-selector-form">
          <div className="file-type-selector">
            <h3>选择视频类型</h3>
            <div className="type-options">
              <label className={`type-option ${selectedType === 'local' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="fileType"
                  value="local"
                  checked={selectedType === 'local'}
                  onChange={(e) => setSelectedType(e.target.value as 'local')}
                />
                <FileVideo size={20} />
                <span>本地文件</span>
              </label>
              
              <label className={`type-option ${selectedType === 'm3u8' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="fileType"
                  value="m3u8"
                  checked={selectedType === 'm3u8'}
                  onChange={(e) => setSelectedType(e.target.value as 'm3u8')}
                />
                <Link size={20} />
                <span>M3U8 流</span>
              </label>
              
              <label className={`type-option ${selectedType === 'stream' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="fileType"
                  value="stream"
                  checked={selectedType === 'stream'}
                  onChange={(e) => setSelectedType(e.target.value as 'stream')}
                />
                <Radio size={20} />
                <span>流媒体</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="fileTitle">视频标题</label>
            <input
              id="fileTitle"
              type="text"
              value={fileTitle}
              onChange={(e) => setFileTitle(e.target.value)}
              placeholder="请输入视频标题"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="fileUrl">
              {selectedType === 'local' ? '选择文件' : '文件URL'}
            </label>
            {selectedType === 'local' ? (
              <input
                id="fileUrl"
                type="file"
                accept="video/*"
                onChange={handleFileInput}
                required
              />
            ) : (
              <input
                id="fileUrl"
                type="url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder={
                  selectedType === 'm3u8' 
                    ? '请输入M3U8播放列表URL (例如: https://example.com/playlist.m3u8)'
                    : '请输入流媒体URL'
                }
                required
              />
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              取消
            </button>
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? '添加中...' : '添加视频'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FileSelector;
