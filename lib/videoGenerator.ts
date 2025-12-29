// Client-side video generator using Canvas API and MediaRecorder
// Creates a video with text overlays on a background video

export interface VideoGenerationOptions {
  question: string;
  answer: string;
  backgroundVideoUrl: string;
  reelId: string;
}

export async function generateReelVideo(options: VideoGenerationOptions): Promise<{
  videoUrl: string;
  thumbnailUrl: string;
}> {
  const { question, answer, backgroundVideoUrl, reelId } = options;

  return new Promise((resolve, reject) => {
    try {
      // Create canvas for rendering
      const canvas = document.createElement('canvas');
      canvas.width = 1080; // Instagram Reel width
      canvas.height = 1920; // Instagram Reel height
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Create video element for background
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.playsInline = true;
      video.muted = true;
      video.preload = 'auto';

      let mediaRecorder: MediaRecorder | null = null;
      const chunks: Blob[] = [];
      let animationFrameId: number;
      let frameCount = 0;
      const totalFrames = 180; // 6 seconds at 30 fps
      const questionFrames = 90; // 3 seconds at 30 fps

      // Function to draw a frame
      const drawFrame = () => {
        frameCount++;
        const showQuestion = frameCount <= questionFrames;
        const text = showQuestion ? question : answer;
        const label = showQuestion ? 'ÎNTREBARE' : 'RĂSPUNS';

        // Draw background - try video first, fallback to gradient
        try {
          if (video.readyState >= 2) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          } else {
            // Gradient background fallback
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
        } catch (e) {
          // Gradient background fallback
          const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
          gradient.addColorStop(0, '#667eea');
          gradient.addColorStop(1, '#764ba2');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Add overlay for better text readability
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw text background box
        ctx.fillStyle = 'rgba(102, 126, 234, 0.95)';
        const textPadding = 60;
        const textWidth = canvas.width - (textPadding * 2);
        const textHeight = 400;
        const textY = (canvas.height - textHeight) / 2;
        const cornerRadius = 20;
        
        // Rounded rectangle
        ctx.beginPath();
        ctx.roundRect(textPadding, textY, textWidth, textHeight, cornerRadius);
        ctx.fill();

        // Draw label
        ctx.fillStyle = 'white';
        ctx.font = 'bold 56px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(label, canvas.width / 2, textY + 40);

        // Draw text (wrap if needed)
        ctx.fillStyle = 'white';
        ctx.font = 'bold 42px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';
        const maxWidth = textWidth - 80;

        words.forEach((word) => {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        });
        if (currentLine) lines.push(currentLine);

        // Draw lines
        const lineHeight = 60;
        const startY = textY + 120;
        lines.forEach((line, index) => {
          ctx.fillText(line, canvas.width / 2, startY + (index * lineHeight));
        });

        if (frameCount < totalFrames) {
          animationFrameId = requestAnimationFrame(drawFrame);
        } else {
          if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
          cancelAnimationFrame(animationFrameId);
        }
      };

      // Video ready handler
      const startRecording = () => {
        // Start recording
        const stream = canvas.captureStream(30); // 30 fps
        const options: MediaRecorderOptions = {
          mimeType: 'video/webm;codecs=vp9',
        };
        
        // Fallback to other codecs if vp9 not supported
        if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
          options.mimeType = 'video/webm;codecs=vp8';
        }
        if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
          options.mimeType = 'video/webm';
        }

        mediaRecorder = new MediaRecorder(stream, options);

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          if (chunks.length === 0) {
            reject(new Error('No video data recorded'));
            return;
          }

          const blob = new Blob(chunks, { type: mediaRecorder?.mimeType || 'video/webm' });
          const videoUrl = URL.createObjectURL(blob);
          
          // Create thumbnail from canvas
          canvas.toBlob((thumbnailBlob) => {
            if (thumbnailBlob) {
              const thumbnailUrl = URL.createObjectURL(thumbnailBlob);
              resolve({ videoUrl, thumbnailUrl });
            } else {
              resolve({ videoUrl, thumbnailUrl: videoUrl });
            }
          }, 'image/jpeg', 0.8);
        };

        // Start recording and drawing
        mediaRecorder.start();
        frameCount = 0;
        drawFrame();
      };

      // Try to load background video, but don't wait for it
      video.onloadeddata = () => {
        video.currentTime = 0;
        video.play();
      };

      video.onerror = () => {
        // Continue without background video - use gradient instead
        console.warn('Background video failed to load, using gradient');
      };

      video.src = backgroundVideoUrl;
      video.load();

      // Start recording after a short delay to ensure everything is ready
      setTimeout(() => {
        startRecording();
      }, 500);
    } catch (error) {
      reject(error);
    }
  });
}

