import { io, Socket } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';

class CallsSocketService {
  private socket: Socket | null = null;
  private currentToken: string | null = null;

  connect(token: string) {
    if (this.socket && this.currentToken === token && this.socket.connected) {
      return;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    this.currentToken = token;
    this.socket = io(`${API_BASE_URL}/calls`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentToken = null;
    }
  }

  invite(targetUid: string, callType: 'AUDIO' | 'VIDEO', callId: string) {
    this.socket?.emit('call:invite', { targetUid, callType, callId });
  }

  accept(targetUid: string, callId: string) {
    this.socket?.emit('call:accept', { targetUid, callId });
  }

  reject(targetUid: string, callId: string) {
    this.socket?.emit('call:reject', { targetUid, callId });
  }

  sendOffer(targetUid: string, callId: string, sdp: RTCSessionDescriptionInit) {
    this.socket?.emit('call:offer', { targetUid, callId, sdp });
  }

  sendAnswer(targetUid: string, callId: string, sdp: RTCSessionDescriptionInit) {
    this.socket?.emit('call:answer', { targetUid, callId, sdp });
  }

  sendIce(targetUid: string, callId: string, candidate: RTCIceCandidateInit) {
    this.socket?.emit('call:ice', { targetUid, callId, candidate });
  }

  end(targetUid: string, callId: string) {
    this.socket?.emit('call:end', { targetUid, callId });
  }

  onRinging(listener: (data: { callId: string; callerUid: string; callType: 'AUDIO' | 'VIDEO' }) => void) {
    this.socket?.on('call:ringing', listener);
    return () => { this.socket?.off('call:ringing', listener); };
  }

  onAccepted(listener: (data: { callId: string; responderUid: string }) => void) {
    this.socket?.on('call:accepted', listener);
    return () => { this.socket?.off('call:accepted', listener); };
  }

  onRejected(listener: (data: { callId: string }) => void) {
    this.socket?.on('call:rejected', listener);
    return () => { this.socket?.off('call:rejected', listener); };
  }

  onOffer(listener: (data: { callId: string; sdp: RTCSessionDescriptionInit; senderUid: string }) => void) {
    this.socket?.on('call:offer', listener);
    return () => { this.socket?.off('call:offer', listener); };
  }

  onAnswer(listener: (data: { callId: string; sdp: RTCSessionDescriptionInit; senderUid: string }) => void) {
    this.socket?.on('call:answer', listener);
    return () => { this.socket?.off('call:answer', listener); };
  }

  onIce(listener: (data: { callId: string; candidate: RTCIceCandidateInit; senderUid: string }) => void) {
    this.socket?.on('call:ice', listener);
    return () => { this.socket?.off('call:ice', listener); };
  }

  onEnded(listener: (data: { callId: string }) => void) {
    this.socket?.on('call:ended', listener);
    return () => { this.socket?.off('call:ended', listener); };
  }
}

export const callsSocket = new CallsSocketService();
