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

  // Reset peer connection
  const resetPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      try { 
        peerConnectionRef.current.close(); 
      } catch (e) {
        console.warn('Error closing peer connection:', e);
      }
      peerConnectionRef.current = null;
    }
    pendingIceCandidatesRef.current = [];
    setIsConnected(false);
  }, []);

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

    // Debounce offers to prevent duplicate processing
    let offerTimeout = null;
    let lastOfferTime = 0;

    socket.on('webrtc-offer', async (data) => {
      console.log('📥 Streamer received offer:', data);
      if (!data || data.streamId !== streamId) {
        console.log('❌ Invalid offer data or wrong streamId');
        return;
      }

      // Debounce duplicate offers within 1 second
      const now = Date.now();
      if (now - lastOfferTime < 1000) {
        console.log('⚠️ Duplicate offer detected within 1s, ignoring');
        return;
      }
      lastOfferTime = now;

      // Clear previous timeout
      if (offerTimeout) {
        clearTimeout(offerTimeout);
      }

      // Process offer after short delay to debounce
      offerTimeout = setTimeout(async () => {
        try {
          console.log('✅ Processing offer for stream', streamId);

          // Tạo PC nếu chưa có
          if (!peerConnectionRef.current) {
            console.log('🔧 Creating new PC for streamer');
            peerConnectionRef.current = new RTCPeerConnection(rtcConfig);
            // Gửi ICE từ streamer về viewer
            peerConnectionRef.current.onicecandidate = (event) => {
              if (event.candidate) {
                console.log('🧊 Streamer ICE candidate generated');
                socket.emit('webrtc-ice-candidate', {
                  streamId,
                  candidate: event.candidate,
                  role: 'streamer'
                });
              }
            };
          }

          const pc = peerConnectionRef.current;

          // Kiểm tra trạng thái signaling state
          if (pc.signalingState !== 'stable') {
            console.warn('PC not in stable state, current state:', pc.signalingState, 'ignoring offer');
            return;
          }

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

          // Set remote description (offer)
          console.log('📥 Setting remote description (offer)...');
          await pc.setRemoteDescription({ type: 'offer', sdp: data.sdp });
          console.log('✅ Streamer set remote description (offer)');

          // Tạo và set local description (answer)
          console.log('📤 Creating answer...');
          const answer = await pc.createAnswer();
          console.log('📤 Setting local description (answer)...');
          await pc.setLocalDescription(answer);
          console.log('📤 Emitting answer to viewer...');
          socket.emit('webrtc-answer', { streamId, sdp: answer.sdp, type: answer.type });
          console.log('✅ Sent answer for stream', streamId);
        } catch (err) {
          console.error('Streamer handle offer failed:', err);
          setError('Streamer answer failed: ' + err.message);
          // Reset peer connection on error
          resetPeerConnection();
        }
      }, 100); // 100ms debounce delay
    });

    socket.on('webrtc-ice-candidate', async (data) => {
      try {
        if (!data || data.streamId !== streamId) return;
        if (!peerConnectionRef.current) return;
        if (!data.candidate) return;
        
        // Kiểm tra trạng thái signaling state trước khi add ICE
        const pc = peerConnectionRef.current;
        if (pc.signalingState === 'closed') {
          console.warn('PC is closed, ignoring ICE candidate');
          return;
        }
        
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        console.log('Streamer added ICE candidate');
      } catch (err) {
        console.error('Streamer add ICE failed:', err);
      }
    });
  }, [socket, rtcConfig, stream, resetPeerConnection]);

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
        socket.emit('join-stream', { streamId, isStreamer: true });
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
      // Determine if this is a streamer or viewer based on context
      const isStreamer = stream !== null; // If we have a stream, we're the streamer
      socket.emit('leave-stream', { streamId: currentStreamIdRef.current, isStreamer });
    }
    setIsConnected(false);
  }, [stream]);

  // Kết nối với stream (VIEWER)
  const connectToStream = useCallback(async (streamId) => {
    try {
      console.log('🔗 Starting connectToStream for:', streamId);
      
      if (!socket) {
        setError('Socket not connected');
        console.error('❌ No socket available');
        return;
      }
      
      // Tránh kết nối trùng lặp
      if (currentStreamIdRef.current === streamId && peerConnectionRef.current) {
        console.log('⚠️ Already connected to stream:', streamId);
        console.log('🔍 Current connection state:', peerConnectionRef.current.connectionState);
        console.log('🔍 Current signaling state:', peerConnectionRef.current.signalingState);
        return;
      }
      
      setError(null);
      
      // Nếu đã có kết nối trước đó, đóng lại trước khi tạo kết nối mới
      resetPeerConnection();
      
      currentStreamIdRef.current = streamId;
      console.log('📡 Emitting join-stream for:', streamId);
      socket.emit('join-stream', { streamId, isStreamer: false });

      // Tạo RTCPeerConnection mới
      console.log('🔧 Creating new RTCPeerConnection');
      const pc = new RTCPeerConnection(rtcConfig);
      peerConnectionRef.current = pc;

      // Theo dõi trạng thái kết nối để cập nhật UI
      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        console.log('🔗 PC connectionState:', state);
        if (state === 'connected') {
          console.log('✅ WebRTC connected!');
          setIsConnected(true);
        } else if (state === 'failed' || state === 'disconnected') {
          console.log('❌ WebRTC disconnected/failed');
          setIsConnected(false);
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('🧊 ICE candidate generated');
          socket.emit('webrtc-ice-candidate', {
            streamId,
            candidate: event.candidate,
            role: 'viewer'
          });
        }
      };

      pc.ontrack = (event) => {
        console.log('🎥 Viewer received track:', event);
        const [remoteStream] = event.streams;
        console.log('📺 Remote stream:', remoteStream);
        console.log('🎬 Video ref:', remoteVideoRef.current);
        
        if (remoteVideoRef.current && remoteStream) {
          console.log('✅ Setting video srcObject');
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play().then(() => {
            console.log('🎉 Video playing successfully!');
            setIsConnected(true);
          }).catch((err) => {
            console.error('❌ Video play failed:', err);
          });
        } else {
          console.warn('⚠️ No video ref or remote stream');
          console.log('Video ref exists:', !!remoteVideoRef.current);
          console.log('Remote stream exists:', !!remoteStream);
        }
      };

      // Nhận answer từ streamer
      socket.off('webrtc-answer');
      socket.on('webrtc-answer', async (data) => {
        try {
          console.log('📥 Received answer from streamer:', data);
          console.log('🔍 Current PC state:', peerConnectionRef.current?.signalingState);
          if (!data || data.streamId !== streamId) {
            console.log('❌ Invalid answer data or wrong streamId');
            return;
          }
          
          // Kiểm tra trạng thái signaling state
          if (pc.signalingState !== 'have-local-offer') {
            console.warn('⚠️ Unexpected signalingState for answer:', pc.signalingState);
            return;
          }
          
          // Chỉ set remote description nếu chưa có
          if (pc.remoteDescription) {
            console.warn('⚠️ Remote description already set. Skipping duplicate answer.');
            return;
          }
          
          console.log('📥 Setting remote description (answer)...');
          await pc.setRemoteDescription({ type: 'answer', sdp: data.sdp });
          console.log('✅ Viewer set remote description (answer)');

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
          setError('Failed to set remote description: ' + err.message);
          resetPeerConnection();
        }
      });

      // Nhận ICE từ streamer
      socket.off('webrtc-ice-candidate');
      socket.on('webrtc-ice-candidate', async (data) => {
        try {
          if (!data || data.streamId !== streamId) return;
          if (!data.candidate) return;
          
          // Kiểm tra trạng thái signaling state
          if (pc.signalingState === 'closed') {
            console.warn('PC is closed, ignoring ICE candidate');
            return;
          }
          
          // Nếu chưa có remoteDescription thì buffer lại
          if (!pc.remoteDescription) {
            pendingIceCandidatesRef.current.push(data.candidate);
            console.log('Buffered ICE candidate, waiting for remote description');
            return;
          }
          
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          console.log('Viewer added ICE candidate');
        } catch (err) {
          console.error('Viewer add ICE failed:', err);
        }
      });

      // Tạo offer và gửi lên streamer
      console.log('📤 Creating offer...');
      const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
      console.log('📤 Setting local description...');
      await pc.setLocalDescription(offer);
      console.log('📤 Emitting offer to streamer...');
      socket.emit('webrtc-offer', { streamId, sdp: offer.sdp, type: offer.type });
      console.log('✅ Viewer sent offer for stream', streamId);
    } catch (err) {
      console.error('Viewer connect failed:', err);
      setError('Failed to connect to stream: ' + err.message);
      setIsConnected(false);
    }
  }, [socket, rtcConfig, resetPeerConnection]);

  // Retry connection với delay
  const retryConnection = useCallback((streamKey, delay = 2000) => {
    console.log(`Retrying connection in ${delay}ms...`);
    setTimeout(() => {
      console.log('Retrying connection now...');
      connectToStream(streamKey);
    }, delay);
  }, [connectToStream]);

  // Cleanup
  const cleanup = useCallback(() => {
    stopStream();
    resetPeerConnection();
    
    // Leave stream room when cleaning up
    if (socket && currentStreamIdRef.current) {
      const isStreamer = stream !== null;
      socket.emit('leave-stream', { streamId: currentStreamIdRef.current, isStreamer });
    }
  }, [stopStream, resetPeerConnection, socket, stream]);

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
    resetPeerConnection,
    cleanup,
  };
};


