/**
 * NEXA Ecosystem — Tipos de Chamadas WebRTC 1:1
 */

export type CallType = 'AUDIO' | 'VIDEO';

export type CallState = 
  | 'IDLE'
  | 'INVITED'
  | 'RINGING'
  | 'ACCEPTED'
  | 'CONNECTED'
  | 'ENDED'
  | 'MISSED'
  | 'REJECTED'
  | 'FAILED';

export interface CallSession {
  callId: string;
  callerUid: string;
  targetUid: string;
  callType: CallType;
  state: CallState;
  durationSeconds?: number;
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
}
