import React, { useState, useEffect, useRef } from 'react';
import { GlassSurface, GlassButton } from '@nexa/ui';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, Shield } from 'lucide-react';

interface CallModalProps {
  isOpen: boolean;
  callType: 'AUDIO' | 'VIDEO';
  contactName: string;
  contactNumber: string;
  isIncoming: boolean;
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callDuration: number;
  callStatus: 'ringing' | 'connected' | 'ended';
}

export const CallModal: React.FC<CallModalProps> = ({
  isOpen,
  callType,
  contactName,
  contactNumber,
  isIncoming,
  onAccept,
  onReject,
  onEnd,
  localStream,
  remoteStream,
  callDuration,
  callStatus,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = isVideoDisabled;
      });
      setIsVideoDisabled(!isVideoDisabled);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl">
      <GlassSurface
        variant="card"
        className="max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-emerald-500/30 shadow-2xl shadow-emerald-950/60 text-center flex flex-col items-center relative overflow-hidden"
      >
        {/* Background mesh glow */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Criptografia Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-emerald-400 mb-6">
          <Shield className="w-3.5 h-3.5" />
          <span>Chamada WebRTC P2P Criptografada</span>
        </div>

        {/* Video feed or Avatar */}
        {callType === 'VIDEO' && callStatus === 'connected' ? (
          <div className="w-full h-64 rounded-2xl bg-slate-900 border border-white/10 relative overflow-hidden mb-6">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 right-3 w-28 h-20 rounded-xl bg-slate-950 border border-white/20 overflow-hidden shadow-lg">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            </div>
          </div>
        ) : (
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-300 font-bold text-3xl shadow-xl shadow-emerald-950/50 relative">
              {contactName.substring(0, 2).toUpperCase()}
              {callStatus === 'ringing' && (
                <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-30" />
              )}
            </div>
          </div>
        )}

        {/* Contact Info */}
        <h3 className="text-2xl font-bold font-display text-white mb-1">
          {contactName}
        </h3>
        <p className="font-mono text-xs text-emerald-400 mb-3">
          {contactNumber}
        </p>

        {/* Call Status / Timer */}
        <div className="text-sm font-mono text-slate-300 mb-8">
          {callStatus === 'ringing' ? (
            <span className="animate-pulse text-emerald-400 font-sans font-medium">
              {isIncoming ? 'Chamando...' : 'Tocando no destinatário...'}
            </span>
          ) : callStatus === 'connected' ? (
            <span className="text-emerald-300 font-semibold">{formatTimer(callDuration)}</span>
          ) : (
            <span className="text-slate-400">Chamada encerrada</span>
          )}
        </div>

        {/* Call Controls */}
        <div className="flex items-center justify-center gap-4 w-full">
          {isIncoming && callStatus === 'ringing' ? (
            <>
              <button
                type="button"
                onClick={onReject}
                className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-950/50 transition-transform active:scale-95"
                title="Recusar"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={onAccept}
                className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-950/50 transition-transform active:scale-95 animate-bounce"
                title="Atender"
              >
                <Phone className="w-6 h-6" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleMute}
                className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                  isMuted
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                    : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
                }`}
                title={isMuted ? 'Desmutar' : 'Mutar microfone'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {callType === 'VIDEO' && (
                <button
                  type="button"
                  onClick={toggleVideo}
                  className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                    isVideoDisabled
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                      : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
                  }`}
                  title={isVideoDisabled ? 'Ligar câmera' : 'Desligar câmera'}
                >
                  {isVideoDisabled ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
              )}

              <button
                type="button"
                onClick={onEnd}
                className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-950/50 transition-transform active:scale-95"
                title="Encerrar Chamada"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      </GlassSurface>
    </div>
  );
};
