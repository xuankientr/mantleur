import { useState, useRef, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';

export const useWebRTC = () => {
  const { socket } = useSocket();
  const [stream, setStream] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null); // RTCPeerConnection
  const currentStreamIdRef = useRef(null);
  const pendingIceCandidatesRef = useRef([]); // Buffer ICE trước khi có remoteDescription

  const turnUrl = import.meta.env.VITE_TURN_URL;
  const turnUsername = import.meta.env.VITE_TURN_USERNAME;
  const turnCredential = import.meta.env.VITE_TURN_CREDENTIAL;

  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      ...(turnUrl && turnUsername && turnCredential
        ? [{ urls: turnUrl.split(',').map(u => u.trim()), username: turnUsername, credential: turnCredential }]
        : []),
    ],
  };

  // Test camera/microphone access
  const testMediaAccess = useCallback(async () => {
    try {
      console.log('Testing media access...');
      const testStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      // Stop test stream
      testStream.getTracks().forEach(track => track.stop());
      console.log('Media access test successful');
      return true;
    } catch (err) {
      console.error('Media access test failed:', err);
      setError('Camera/microphone access test failed: ' + err.message);
      return false;
    }
  }, []);

  // STREAMER: nhận offer và trả answer, xử lý ICE từ viewer
  const attachStreamerSignalingHandlers = useCallback((streamId) => {
    if (!socket) return;

    // Tránh gắn nhiều lần
    socket.off('webrtc-offer');
    socket.off('webrtc-ice-candidate');

    socket.on('webrtc-offer', async (data) => {
      try {
        if (!data || data.streamId !== streamId) return;
        console.log('Received offer for stream', streamId);

        // Tạo PC nếu chưa có
        if (!peerConnectionRef.current) {
          peerConnectionRef.current = new RTCPeerConnection(rtcConfig);
          // Gửi ICE từ streamer về viewer
          peerConnectionRef.current.onicecandidate = (event) => {
            if (event.candidate) {
              socket.emit('webrtc-ice-candidate', {
                streamId,
                candidate: event.candidate,
                role: 'streamer'
              });
            }
          };
        }

        const pc = peerConnectionRef.current;

        // Gắn track local (camera/mic) cho streamer
        if (stream) {
          const senders = pc.getSenders();
          const existingTracks = senders.map(s => s.track).filter(Boolean);
          stream.getTracks().forEach((track) => {
            if (!existingTracks.includes(track)) {
              pc.addTrack(track, stream);
            }
          });
        }

        await pc.setRemoteDescription({ type: 'offer', sdp: data.sdp });
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc-answer', { streamId, sdp: answer.sdp, type: answer.type });
        console.log('Sent answer for stream', streamId);
      } catch (err) {
        console.error('Streamer handle offer failed:', err);
        setError('Streamer answer failed: ' + err.message);
      }
    });

    socket.on('webrtc-ice-candidate', async (data) => {
      try {
        if (!data || data.streamId !== streamId) return;
        if (!peerConnectionRef.current) return;
        if (!data.candidate) return;
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (err) {
        console.error('Streamer add ICE failed:', err);
      }
    });
  }, [socket, rtcConfig, stream]);

  // Bắt đầu stream (STREAMER)
  const startStream = useCallback(async (streamId) => {
    try {
      setError(null);

      // Lấy camera và microphone với fallback options
      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            frameRate: { ideal: 30, max: 60 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
      } catch (err) {
        console.warn('High quality stream failed, trying basic stream...', err);
        // Fallback to basic stream
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
      }

      console.log('Media stream obtained:', mediaStream);
      setStream(mediaStream);
      currentStreamIdRef.current = streamId;

      // Hiển thị video local
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
        localVideoRef.current.play().catch(e => console.log('Video play error:', e));
        console.log('Video element updated');
      } else {
        console.warn('localVideoRef is null');
      }

      // Khởi tạo PeerConnection cho streamer và add tracks ngay
      if (!peerConnectionRef.current) {
        peerConnectionRef.current = new RTCPeerConnection(rtcConfig);
        // Gửi ICE từ streamer về viewer
        peerConnectionRef.current.onicecandidate = (event) => {
          if (event.candidate && socket) {
            socket.emit('webrtc-ice-candidate', {
              streamId,
              candidate: event.candidate,
              role: 'streamer'
            });
          }
        };
      }

      const pc = peerConnectionRef.current;
      if (pc && mediaStream) {
        const existingTracks = pc.getSenders().map(s => s.track).filter(Boolean);
        mediaStream.getTracks().forEach((track) => {
          if (!existingTracks.includes(track)) {
            pc.addTrack(track, mediaStream);
          }
        });
      }

      // Join phòng signaling theo streamId và gắn handler answer/ICE
      if (socket) {
        socket.emit('join-stream', streamId);
        attachStreamerSignalingHandlers(streamId);
      }

      setIsConnected(true);
      return mediaStream;
    } catch (err) {
      console.error('Failed to start stream:', err);
      let errorMessage = 'Failed to start stream: ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Camera/microphone access denied. Please allow access and try again.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera/microphone found. Please check your devices.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera/microphone is being used by another application.';
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
      throw err;
    }
  }, [socket, attachStreamerSignalingHandlers]);

  // Dừng stream
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (peerConnectionRef.current) {
      try { peerConnectionRef.current.close(); } catch {}
      peerConnectionRef.current = null;
    }
    if (socket && currentStreamIdRef.current) {
      socket.emit('leave-stream', currentStreamIdRef.current);
    }
    setIsConnected(false);
  }, [stream]);

  // Kết nối với stream (VIEWER)
  const connectToStream = useCallback(async (streamId) => {
    try {
      if (!socket) {
        setError('Socket not connected');
        return;
      }
      setError(null);
      currentStreamIdRef.current = streamId;
      socket.emit('join-stream', streamId);

      // Nếu đã có kết nối trước đó, đóng lại trước khi tạo kết nối mới
      if (peerConnectionRef.current) {
        try { peerConnectionRef.current.close(); } catch {}
        peerConnectionRef.current = null;
      }

      // Tạo RTCPeerConnection mới
      const pc = new RTCPeerConnection(rtcConfig);
      peerConnectionRef.current = pc;

      // Theo dõi trạng thái kết nối để cập nhật UI
      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        console.log('PC connectionState:', state);
        if (state === 'connected') {
          setIsConnected(true);
        } else if (state === 'failed' || state === 'disconnected') {
          setIsConnected(false);
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc-ice-candidate', {
            streamId,
            candidate: event.candidate,
            role: 'viewer'
          });
        }
      };

      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (remoteVideoRef.current && remoteStream) {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play().catch(() => {});
          setIsConnected(true);
        }
      };

      // Nhận answer từ streamer
      socket.off('webrtc-answer');
      socket.on('webrtc-answer', async (data) => {
        try {
          if (!data || data.streamId !== streamId) return;
          // Chỉ set remote description nếu đang ở trạng thái hợp lệ
          if (pc.currentRemoteDescription) {
            console.warn('Remote description already set. Skipping duplicate answer.');
            return;
          }
          if (pc.signalingState !== 'have-local-offer') {
            console.warn('Unexpected signalingState for answer:', pc.signalingState);
            return;
          }
          await pc.setRemoteDescription({ type: 'answer', sdp: data.sdp });
          console.log('Viewer set remote description (answer)');

          // Sau khi có remoteDescription, add các ICE đã buffer
          if (pendingIceCandidatesRef.current.length) {
            console.log('Adding buffered ICE candidates:', pendingIceCandidatesRef.current.length);
            for (const candidate of pendingIceCandidatesRef.current) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
              } catch (e) {
                console.error('Failed to add buffered ICE:', e);
              }
            }
            pendingIceCandidatesRef.current = [];
          }
        } catch (err) {
          console.error('Viewer setRemoteDescription failed:', err);
        }
      });

      // Nhận ICE từ streamer
      socket.off('webrtc-ice-candidate');
      socket.on('webrtc-ice-candidate', async (data) => {
        try {
          if (!data || data.streamId !== streamId) return;
          if (!data.candidate) return;
          // Nếu chưa có remoteDescription thì buffer lại
          if (!pc.remoteDescription) {
            pendingIceCandidatesRef.current.push(data.candidate);
            return;
          }
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (err) {
          console.error('Viewer add ICE failed:', err);
        }
      });

      // Tạo offer và gửi lên streamer
      const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
      await pc.setLocalDescription(offer);
      socket.emit('webrtc-offer', { streamId, sdp: offer.sdp, type: offer.type });
      console.log('Viewer sent offer for stream', streamId);
    } catch (err) {
      console.error('Viewer connect failed:', err);
      setError('Failed to connect to stream: ' + err.message);
      setIsConnected(false);
    }
  }, [socket, rtcConfig]);

  // Retry connection với delay
  const retryConnection = useCallback((streamKey, delay = 2000) => {
    console.log(`Retrying connection in ${delay}ms...`);
    setTimeout(() => {
      console.log('Retrying connection now...');
      connectToStream(streamKey);
    }, delay);
  }, []);

  // Cleanup
  const cleanup = useCallback(() => {
    stopStream();
    if (peerConnectionRef.current) {
      try { peerConnectionRef.current.close(); } catch {}
      peerConnectionRef.current = null;
    }
  }, [stopStream]);

  return {
    stream,
    isConnected,
    error,
    localVideoRef,
    remoteVideoRef,
    startStream,
    stopStream,
    connectToStream,
    retryConnection,
    testMediaAccess,
    cleanup,
  };
};

