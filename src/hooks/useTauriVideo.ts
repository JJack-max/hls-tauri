import { useCallback } from 'react';

// Custom hook for handling video loading with Tauri HTTP plugin
export const useTauriVideo = () => {
  // Function to check if a URL is external
  const isExternalUrl = useCallback((url: string): boolean => {
    return url.startsWith('http://') || url.startsWith('https://');
  }, []);

  // Function to fetch video content using Tauri HTTP plugin
  const fetchVideoWithTauri = useCallback(async (url: string): Promise<ArrayBuffer | null> => {
    try {
      // Dynamically import the Tauri HTTP plugin
      const { fetch } = await import('@tauri-apps/plugin-http');
      
      // Fetch the video content
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'video/*, application/vnd.apple.mpegurl, application/x-mpegURL',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        return arrayBuffer;
      } else {
        console.error(`Failed to fetch video: ${response.status} ${response.statusText}`);
        return null;
      }
    } catch (error) {
      console.error('Error fetching video with Tauri HTTP plugin:', error);
      return null;
    }
  }, []);

  // Function to create a blob URL from video data
  const createVideoBlobUrl = useCallback((arrayBuffer: ArrayBuffer, mimeType: string): string => {
    const blob = new Blob([arrayBuffer], { type: mimeType });
    return URL.createObjectURL(blob);
  }, []);

  return {
    isExternalUrl,
    fetchVideoWithTauri,
    createVideoBlobUrl
  };
};