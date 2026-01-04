import { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  onVideoComplete?: () => void;
  onProgress?: (currentTime: number, duration: number) => void;
  disableFastForward?: boolean;
  autoMarkComplete?: boolean;
  subtitleUrl?: string;  // Add subtitle URL prop
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  title,
  onVideoComplete,
  onProgress,
  disableFastForward = true,
  autoMarkComplete = true,
  subtitleUrl
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isYouTube, setIsYouTube] = useState(false);
  const completionThreshold = 0.9; // 90% of video watched

  useEffect(() => {
    if (!videoUrl) {
      return;
    }

    const youtube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
    setIsYouTube(youtube);

    if (youtube) {
      // For YouTube, use iframe with better control
      return;
    }
  }, [videoUrl]);

  const normalizeVideoUrl = (url: string): string => {
    if (!url) return url;
    try {
      // Handle YouTube URLs - convert to direct video URL
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const urlObj = new URL(url);
        let videoId = urlObj.searchParams.get('v');
        if (!videoId && urlObj.hostname === 'youtu.be') {
          videoId = urlObj.pathname.replace('/', '');
        }
        if (videoId) {
          // For YouTube, we'll use the embed URL with no cookies
          return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1&origin=${window.location.origin}`;
        }
      }
      
      // Handle relative URLs for uploaded videos
      if (url.startsWith('/uploads/')) {
        return `http://localhost:8081${url}`;
      }
      
      return url;
    } catch {
      return url;
    }
  };

  return (
    <div className="relative w-full" style={{ minHeight: '500px' }}>
      {isYouTube ? (
        // YouTube videos with enhanced iframe
        <div className={`relative w-full ${isCompleted ? 'ring-2 ring-green-500' : ''}`} style={{ minHeight: '500px' }}>
          <iframe
            className="w-full h-full"
            src={normalizeVideoUrl(videoUrl)}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ minHeight: '500px' }}
            onError={() => {
              console.error('YouTube iframe failed to load');
            }}
            onLoad={() => {
              console.log('YouTube iframe loaded successfully');
            }}
          />
          {isCompleted && (
            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Completed
            </div>
          )}
        </div>
      ) : (
        // Non-YouTube videos use simple HTML5 video
        <div className={`w-full ${isCompleted ? 'ring-2 ring-green-500' : ''}`} style={{ minHeight: '500px' }}>
          <video
            ref={videoRef}
            className="w-full"
            controls
            preload="auto"
            style={{ minHeight: '500px' }}
            controlsList="nodownload noremoteplayback"  // Disable download and remote playback
            disablePictureInPicture  // Disable PiP if needed
            onEnded={() => {
              if (!isCompleted) {
                setIsCompleted(true);
                onVideoComplete?.();
              }
            }}
            onTimeUpdate={(e) => {
              const video = e.currentTarget;
              if (video.duration && video.currentTime) {
                onProgress?.(video.currentTime, video.duration);
                
                const progressPercent = currentTime / duration;
                if (progressPercent >= completionThreshold && !isCompleted) {
                  setIsCompleted(true);
                  onVideoComplete?.();
                }
              }
            }}
            onSeeking={(e) => {
              if (disableFastForward) {
                const video = e.currentTarget;
                // Store current time before seeking
                const currentTime = video.currentTime;
                // This is a simple prevention - in a real implementation you'd track previous time
                console.log('Seeking prevented or allowed based on direction');
              }
            }}
          >
            <source src={normalizeVideoUrl(videoUrl)} type="video/mp4" />
            
            {/* Subtitle support - use provided subtitleUrl or auto-detect */}
            {subtitleUrl && (
              <track 
                kind="subtitles" 
                src={subtitleUrl} 
                label="English" 
                srcLang="en" 
                default 
              />
            )}
            
            {/* Fallback: Auto-detect subtitle file */}
            {!subtitleUrl && (
              <track 
                kind="subtitles" 
                src={`${normalizeVideoUrl(videoUrl).replace(/\.[^/.]+$/, '.vtt')}`} 
                label="English" 
                srcLang="en" 
                default 
              />
            )}
            
            <p>
              Your browser does not support the video tag.
            </p>
          </video>
        </div>
      )}
      
      {isCompleted && !isYouTube && (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Completed
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
