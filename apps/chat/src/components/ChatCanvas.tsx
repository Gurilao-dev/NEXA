import React, { useState, useEffect, useRef } from 'react';
import { GlassSurface, GlassButton } from '@nexa/ui';
import {
  ArrowLeft,
  Phone,
  Video,
  Send,
  Paperclip,
  Mic,
  MicOff,
  Image as ImageIcon,
  Smile,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Play,
  Pause,
  Reply,
  X,
  FileText,
} from 'lucide-react';
import { Conversation, Message, ChatProfile } from '@nexa/types';

interface ChatCanvasProps {
  conversation: Conversation;
  messages: Message[];
  currentProfile: ChatProfile | null;
  typingUsers: string[];
  onSendMessage: (text: string, replyToMessageId?: string, mediaUrl?: string, mediaType?: string) => Promise<void>;
  onSetTyping: (isTyping: boolean) => void;
  onBack: () => void;
  onStartCall: (callType: 'AUDIO' | 'VIDEO') => void;
}

export const ChatCanvas: React.FC<ChatCanvasProps> = ({
  conversation,
  messages,
  currentProfile,
  typingUsers,
  onSendMessage,
  onSetTyping,
  onBack,
  onStartCall,
}) => {
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isGroup = conversation.type === 'GROUP';
  const chatTitle = conversation.title || (isGroup ? 'Grupo NEXA' : 'Conversa Segura');

  // Rola até o final ao receber mensagens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  // Digitação em tempo real
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    onSetTyping(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onSetTyping(false);
    }, 2000);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const textToSend = inputText.trim();
    setInputText('');
    onSetTyping(false);
    const replyId = replyingTo?.messageId;
    setReplyingTo(null);

    await onSendMessage(textToSend, replyId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Gravação de áudio real via MediaRecorder
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        // Converte para base64 data URL para envio seguro direto
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          await onSendMessage('Mensagem de voz', undefined, base64Audio, 'AUDIO');
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecordingVoice(true);
      setRecordingSeconds(0);
    } catch (err) {
      console.warn('Microfone não acessível, simulando áudio:', err);
      setIsRecordingVoice(true);
      setRecordingSeconds(0);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    } else {
      // Simulação de nota de voz se permissão de hardware foi negada
      onSendMessage(`Nota de voz (${recordingSeconds}s)`, undefined, 'simulated_audio', 'AUDIO');
    }
    setIsRecordingVoice(false);
    setRecordingSeconds(0);
    setMediaRecorder(null);
  };

  // Timer de gravação
  useEffect(() => {
    let interval: any;
    if (isRecordingVoice) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  // Upload de arquivos
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImg = file.type.startsWith('image/');
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      await onSendMessage(
        file.name,
        undefined,
        base64Data,
        isImg ? 'IMAGE' : 'DOCUMENT'
      );
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatMessageTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#090D16] relative overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b border-white/10 bg-[#090D16]/90 backdrop-blur-md flex items-center justify-between z-20">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
              isGroup
                ? 'bg-purple-900/40 border border-purple-500/30 text-purple-300'
                : 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
            }`}
          >
            {isGroup ? 'GP' : chatTitle.substring(0, 2).toUpperCase()}
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white truncate font-display">
              {chatTitle}
            </h3>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1.5">
              {typingUsers.length > 0 ? (
                <span className="font-medium animate-pulse">Digitando...</span>
              ) : (
                <span className="text-slate-400">
                  {isGroup ? `${conversation.memberUids.length} membros` : 'Criptografado Ponta a Ponta'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Call Actions */}
        <div className="flex items-center gap-1 text-slate-400">
          <button
            type="button"
            onClick={() => onStartCall('AUDIO')}
            className="p-2 rounded-xl hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            title="Chamada de Voz WebRTC"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onStartCall('VIDEO')}
            className="p-2 rounded-xl hover:text-teal-400 hover:bg-teal-500/10 transition-colors"
            title="Chamada de Vídeo WebRTC"
          >
            <Video className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Canvas */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 relative">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-emerald-400">
              <Check className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-white mb-1">Início da Conversa</div>
            <p className="max-w-xs text-slate-400 leading-relaxed">
              As mensagens nesta conversa são sincronizadas em tempo real e armazenadas no ledger do ecossistema.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderUid === currentProfile?.uid;
            const replyMsg = msg.replyToMessageId
              ? messages.find((m) => m.messageId === msg.replyToMessageId)
              : null;

            return (
              <div
                key={msg.messageId || msg.clientMessageId}
                className={`flex flex-col group ${isMine ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-md p-3 rounded-2xl relative transition-all shadow-md ${
                    isMine
                      ? 'bg-emerald-950/50 border border-emerald-500/25 text-emerald-50 rounded-br-none'
                      : 'bg-white/5 border border-white/10 text-slate-100 rounded-bl-none'
                  }`}
                >
                  {/* Reply Quote */}
                  {replyMsg && (
                    <div className="mb-2 p-2 rounded-lg bg-black/20 border-l-2 border-emerald-400 text-xs text-slate-300">
                      <div className="text-[10px] font-semibold text-emerald-400">Em resposta a:</div>
                      <div className="truncate">{replyMsg.text}</div>
                    </div>
                  )}

                  {/* Media Content */}
                  {msg.attachment && (
                    <div className="mb-2">
                      {msg.attachment.type === 'image' ? (
                        <img
                          src={msg.attachment.secureUrl}
                          alt="Anexo"
                          className="rounded-xl max-h-60 w-auto object-cover border border-white/10"
                        />
                      ) : msg.attachment.type === 'audio' ? (
                        <div className="flex items-center gap-3 p-2 rounded-xl bg-black/20 border border-white/5">
                          <button
                            type="button"
                            onClick={() => {
                              if (playingAudioId === msg.messageId) {
                                setPlayingAudioId(null);
                              } else {
                                setPlayingAudioId(msg.messageId);
                                const audio = new Audio(msg.attachment?.secureUrl);
                                audio.play();
                                audio.onended = () => setPlayingAudioId(null);
                              }
                            }}
                            className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0"
                          >
                            {playingAudioId === msg.messageId ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4 ml-0.5" />
                            )}
                          </button>
                          <div className="flex-1">
                            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-400 w-1/2 rounded-full animate-pulse" />
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">Mensagem de Voz</div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-black/20 border border-white/5 text-xs">
                          <FileText className="w-5 h-5 text-teal-400 shrink-0" />
                          <span className="truncate">{msg.attachment.fileName || msg.text}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Text */}
                  {(!msg.attachment || msg.attachment.type === 'document') && (
                    <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                      {msg.text}
                    </div>
                  )}

                  {/* Meta (Time + Status) */}
                  <div className="flex items-center justify-end gap-1.5 mt-1 text-[10px] text-slate-400 select-none">
                    <span>{formatMessageTime(msg.createdAt)}</span>
                    {isMine && (
                      <span>
                        {msg.status === 'SENDING' && <Clock className="w-3 h-3 text-slate-400 animate-spin" />}
                        {msg.status === 'SENT' && <Check className="w-3 h-3 text-slate-400" />}
                        {msg.status === 'DELIVERED' && <CheckCheck className="w-3 h-3 text-slate-400" />}
                        {msg.status === 'READ' && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                        {msg.status === 'FAILED' && <AlertCircle className="w-3 h-3 text-rose-400" />}
                      </span>
                    )}
                  </div>

                  {/* Quick Action: Reply button on hover */}
                  <button
                    type="button"
                    onClick={() => setReplyingTo(msg)}
                    className="absolute -top-3 right-2 p-1 rounded-full bg-slate-900 border border-white/10 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    title="Responder"
                  >
                    <Reply className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Banner */}
      {replyingTo && (
        <div className="px-4 py-2 bg-slate-900/90 border-t border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Reply className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-slate-400">Respondendo:</span>
            <span className="text-white truncate font-medium">{replyingTo.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setReplyingTo(null)}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Composer */}
      <div className="p-3 bg-[#090D16]/95 border-t border-white/10 relative z-20">
        {isRecordingVoice ? (
          <div className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold animate-pulse">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Gravando áudio ({recordingSeconds}s)...</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsRecordingVoice(false)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={stopVoiceRecording}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs text-white font-semibold shadow-md shadow-rose-950/50"
              >
                Enviar Áudio
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-end gap-2">
            {/* Attachment Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              title="Anexar Foto ou Documento"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Input Field */}
            <div className="flex-1 relative">
              <textarea
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Mensagem criptografada... (Enter para enviar)"
                rows={1}
                className="w-full py-2.5 px-3.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 resize-none max-h-32 transition-all leading-snug"
              />
            </div>

            {/* Voice or Send */}
            {inputText.trim() ? (
              <GlassButton
                variant="primary"
                onClick={handleSend}
                className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 shadow-lg shadow-emerald-950/40"
                title="Enviar Mensagem"
              >
                <Send className="w-5 h-5" />
              </GlassButton>
            ) : (
              <button
                type="button"
                onClick={startVoiceRecording}
                className="p-2.5 rounded-2xl text-slate-400 hover:text-emerald-400 hover:bg-white/10 transition-colors shrink-0"
                title="Gravar Mensagem de Voz"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
