import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { projectApi, type ChatMessage, type Project } from '../api/projects';
import { Icon } from '../components/Icons';
import { useAuthStore } from '../store/authStore';

type Context = { project: Project };
interface SpeechResult { isFinal: boolean; 0: { transcript: string } }
interface SpeechEvent { resultIndex: number; results: ArrayLike<SpeechResult> }
interface SpeechRecognitionLike {
  lang: string; interimResults: boolean; continuous: boolean;
  onresult: ((event: SpeechEvent) => void) | null; onerror: ((event: { error: string }) => void) | null; onend: (() => void) | null;
  start(): void; stop(): void;
}
declare global { interface Window { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike } }

function newThreadId(key: string) {
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID(); sessionStorage.setItem(key, id); return id;
}

const tutorPrompts = [
  { title: 'Think in edge cases', copy: 'Help me find boundary conditions for this feature.', icon: 'activity' as const },
  { title: 'Understand the why', copy: 'Explain what makes a test assertion meaningful.', icon: 'sparkles' as const },
  { title: 'Review my approach', copy: 'How can I make my tests more maintainable?', icon: 'shield' as const },
];

export function AssistantWorkspacePage({ mode }: { mode: 'tutor' | 'voice' }) {
  const { project } = useOutletContext<Context>(); const { projectId = '' } = useParams();
  const threadKey = `testpilot:${projectId}:${mode}`;
  const [threadId] = useState(() => newThreadId(threadKey));
  const [messages, setMessages] = useState<ChatMessage[]>([]); const [composer, setComposer] = useState(''); const [sourceCode, setSourceCode] = useState('');
  const [loading, setLoading] = useState(false); const [historyLoading, setHistoryLoading] = useState(true); const [error, setError] = useState(''); const [listening, setListening] = useState(false); const [transcript, setTranscript] = useState(''); const [voiceError, setVoiceError] = useState('');
  const endRef = useRef<HTMLDivElement>(null); const recognitionRef = useRef<SpeechRecognitionLike | null>(null); const transcriptRef = useRef(''); const sendRef = useRef<(text: string, source: 'voice' | 'tutor') => Promise<void>>(async () => {});
  const isVoice = mode === 'voice';

  useEffect(() => {
    let alive = true;
    projectApi.tutorHistory(projectId, threadId).then((items) => { if (alive) setMessages(items); }).catch(() => { if (alive) setError('Conversation history could not be loaded.'); }).finally(() => { if (alive) setHistoryLoading(false); });
    return () => { alive = false; recognitionRef.current?.stop(); };
  }, [projectId, threadId]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [messages, loading, transcript]);

  async function sendMessage(text: string, source: 'voice' | 'tutor' = mode) {
    const clean = text.trim(); if (!clean || loading) return;
    setError(''); setVoiceError(''); setComposer(''); setTranscript(''); setLoading(true);
    const optimistic: ChatMessage = { role: 'user', content: clean, mode: source, createdAt: new Date().toISOString() };
    setMessages((items) => [...items, optimistic]);
    try {
      const answer = await projectApi.tutorReply(projectId, { threadId, mode: source, message: clean, sourceCode });
      setMessages((items) => [...items, { role: 'assistant', content: answer, mode: source, createdAt: new Date().toISOString() }]);
      if (source === 'voice' && 'speechSynthesis' in window) { window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(answer)); }
    } catch (reason) {
      const response = (reason as { response?: { data?: { error?: { message?: string } } } }).response;
      const detail = response?.data?.error?.message ?? 'Your message could not be sent. Please try again.';
      setMessages((items) => items.filter((item) => item !== optimistic)); setError(detail);
    } finally { setLoading(false); }
  }
  sendRef.current = sendMessage;

  function startVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setVoiceError('Voice input is not available in this browser. You can still type your question below.'); return; }
    const recognition = new SpeechRecognition(); recognition.lang = navigator.language || 'en-US'; recognition.interimResults = true; recognition.continuous = false; recognitionRef.current = recognition;
    transcriptRef.current = ''; setTranscript(''); setVoiceError(''); setListening(true);
    recognition.onresult = (event) => { let finalText = ''; let partial = ''; for (let index = event.resultIndex; index < event.results.length; index++) { const result = event.results[index]; if (result.isFinal) finalText += result[0].transcript; else partial += result[0].transcript; } if (finalText.trim()) transcriptRef.current += `${transcriptRef.current ? ' ' : ''}${finalText.trim()}`; setTranscript(`${transcriptRef.current} ${partial}`.trim()); };
    recognition.onerror = (event) => { setVoiceError(event.error === 'not-allowed' ? 'Microphone access was denied. Allow microphone access in your browser settings.' : 'Speech recognition ended unexpectedly. You can try again or type your message.'); setListening(false); };
    recognition.onend = () => { setListening(false); const finalText = transcriptRef.current.trim(); if (finalText) void sendRef.current(finalText, 'voice'); };
    try { recognition.start(); } catch { setListening(false); setVoiceError('Could not start microphone input. Please try again.'); }
  }
  function stopVoiceInput() { recognitionRef.current?.stop(); }
  function onComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void sendMessage(composer); } }
  function onSubmit(event: FormEvent) { event.preventDefault(); void sendMessage(composer); }
  const firstName = useAuthStore((state) => state.user?.name.split(' ')[0] ?? 'there');

  if (isVoice) return <div className="assistant-workspace voice-workspace"><section className="voice-main surface-card"><div className="voice-topline"><span className="card-overline">HANDS-FREE TESTING</span><span className="voice-ready"><i /> {listening ? 'Listening now' : 'Ready when you are'}</span></div><div className={`voice-orb-wrap ${listening ? 'is-listening' : ''}`}><div className="voice-orb-orbit orbit-one" /><div className="voice-orb-orbit orbit-two" /><button className={`voice-orb ${listening ? 'recording' : ''}`} onClick={listening ? stopVoiceInput : startVoiceInput} aria-label={listening ? 'Stop listening' : 'Start voice assistant'} aria-pressed={listening}><Icon name={listening ? 'close' : 'mic'} size={28} /></button></div><p className="voice-kicker">{listening ? 'I’m listening' : 'Talk through your tests'}</p><h2>{listening ? 'Tell me what you’re working on.' : 'Your testing copilot, in the flow.'}</h2><p className="voice-description">Ask about a test, think through edge cases, or get a concept explained. Your voice is transcribed in your browser; only the text you send is shared with TestPilot.</p>{voiceError && <p className="inline-error voice-error" role="alert">{voiceError}</p>}<div className="voice-transcript" aria-live="polite">{transcript || (listening ? 'Waiting for speech…' : 'Your live transcript will appear here')}</div><div className="voice-controls"><button className={`button-primary voice-start ${listening ? 'button-recording' : ''}`} onClick={listening ? stopVoiceInput : startVoiceInput}><Icon name={listening ? 'close' : 'mic'} size={16} /> {listening ? 'Finish speaking' : 'Start talking'}</button><span>or use the text composer below</span></div></section><section className="assistant-chat-panel surface-card"><div className="assistant-chat-heading"><div className="assistant-avatar voice-avatar"><Icon name="mic" size={17} /></div><div><strong>Voice conversation</strong><small>Project-aware · {project.projectName}</small></div><span className="chat-secure"><Icon name="shield" size={13} /> Private</span></div><div className="chat-messages voice-messages">{historyLoading ? <div className="chat-loading"><span className="skeleton" /><span className="skeleton" /></div> : messages.length ? messages.map((message, index) => <MessageBubble key={`${message.createdAt}-${index}`} message={message} />) : <div className="chat-welcome"><span className="assistant-avatar voice-avatar"><Icon name="mic" /></span><strong>Hi {firstName}, what are you testing?</strong><p>Tap the microphone to talk, or send a message below.</p></div>}{loading && <TypingIndicator />}<div ref={endRef} /></div>{error && <div className="chat-error" role="alert">{error}{error.includes('GROQ_API_KEY') && <small>Configure GROQ_API_KEY on the server to enable the AI assistant.</small>}</div>}<MessageComposer value={composer} onChange={setComposer} onKeyDown={onComposerKeyDown} onSubmit={onSubmit} disabled={loading} placeholder="Ask about your tests…" /></section></div>;

  return <div className="assistant-workspace tutor-workspace"><section className="tutor-overview"><div><p className="card-overline">YOUR PERSONAL TESTING COACH</p><h2>Learn the thinking behind great tests.</h2><p>Explore concepts, ask for guidance, and connect your questions to <strong>{project.projectName}</strong>.</p></div><div className="learning-stats"><div><span className="learning-stat-icon"><Icon name="sparkles" /></span><span><strong>On demand</strong><small>Learn at your pace</small></span></div><div><span className="learning-stat-icon blue"><Icon name="code" /></span><span><strong>Code-aware</strong><small>Project context ready</small></span></div></div></section>
    <section className="tutor-content-grid"><div className="tutor-chat surface-card"><div className="assistant-chat-heading"><div className="assistant-avatar tutor-avatar"><Icon name="sparkles" size={17} /></div><div><strong>TestPilot tutor</strong><small>Patient, practical test engineering help</small></div><span className="chat-secure"><Icon name="shield" size={13} /> Private</span></div><div className="chat-messages tutor-messages">{historyLoading ? <div className="chat-loading"><span className="skeleton" /><span className="skeleton" /></div> : messages.length ? messages.map((message, index) => <MessageBubble key={`${message.createdAt}-${index}`} message={message} />) : <div className="chat-welcome"><span className="assistant-avatar tutor-avatar"><Icon name="sparkles" /></span><strong>Hey {firstName} — let’s make testing click.</strong><p>Ask anything about test design, assertions, or the code you’re working with. I’ll explain the reasoning, not just give you an answer.</p></div>}{loading && <TypingIndicator />}<div ref={endRef} /></div>{error && <div className="chat-error" role="alert">{error}{error.includes('GROQ_API_KEY') && <small>Configure GROQ_API_KEY in the server environment to enable tutor responses.</small>}</div>}<MessageComposer value={composer} onChange={setComposer} onKeyDown={onComposerKeyDown} onSubmit={onSubmit} disabled={loading} placeholder="Ask your tutor anything…" /></div>
      <aside className="tutor-rail"><article className="surface-card tutor-prompts"><div className="rail-card-heading"><span className="rail-icon tutor-rail-icon"><Icon name="sparkles" size={16} /></span><span>Pick a starting point</span></div><p className="tutor-rail-intro">Not sure what to ask? Try one of these.</p>{tutorPrompts.map((prompt) => <button key={prompt.title} className="tutor-prompt-card" onClick={() => void sendMessage(prompt.copy)}><span className="prompt-icon"><Icon name={prompt.icon} size={16} /></span><span><strong>{prompt.title}</strong><small>{prompt.copy}</small></span><Icon name="chevron" size={15} className="prompt-chevron" /></button>)}</article><article className="surface-card tutor-context"><div className="rail-card-heading"><span className="rail-icon"><Icon name="code" size={16} /></span><span>Bring your code into context</span></div><p>Share a focused snippet with your question so your tutor can tailor the explanation.</p><label className="sr-only" htmlFor="tutor-context-code">Optional code context</label><textarea id="tutor-context-code" value={sourceCode} onChange={(event) => setSourceCode(event.target.value)} placeholder="Paste an optional code snippet…" rows={5} maxLength={20000} /><span className="context-privacy"><Icon name="shield" size={13} /> Sent only with your next message</span></article></aside>
    </section></div>;
}

function MessageBubble({ message }: { message: ChatMessage }) {
  return <article className={`chat-message ${message.role === 'user' ? 'message-user' : 'message-assistant'}`}><span className={`message-avatar ${message.role === 'user' ? 'user-message-avatar' : 'assistant-message-avatar'}`}>{message.role === 'user' ? 'Y' : '✦'}</span><div className="message-content"><div className="message-meta"><strong>{message.role === 'user' ? 'You' : 'TestPilot'}</strong><span>{new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(message.createdAt))}</span></div><p>{message.content}</p></div></article>;
}
function TypingIndicator() { return <div className="typing-indicator" aria-label="TestPilot is responding"><i /><i /><i /></div>; }
function MessageComposer({ value, onChange, onKeyDown, onSubmit, disabled, placeholder }: { value: string; onChange: (value: string) => void; onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void; onSubmit: (event: FormEvent) => void; disabled: boolean; placeholder: string }) {
  return <form className="message-composer" onSubmit={onSubmit}><label className="sr-only" htmlFor="assistant-message">Message the assistant</label><textarea id="assistant-message" value={value} onChange={(event) => onChange(event.target.value)} onKeyDown={onKeyDown} rows={1} maxLength={8000} placeholder={placeholder} disabled={disabled} /><div className="composer-footer"><span>Enter to send · Shift + Enter for a new line</span><button type="submit" aria-label="Send message" className="send-button" disabled={disabled || !value.trim()}><Icon name="send" size={16} /></button></div></form>;
}
