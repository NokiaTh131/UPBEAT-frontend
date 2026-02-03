interface ChatProps {
  content: string;
  isMe: boolean;
}

export default function Chat(Props: ChatProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: Props.isMe ? 'flex-end' : 'flex-start',
        marginBottom: '8px',
      }}
    >
      <div
        style={{
          backgroundColor: Props.isMe ? '#2d5016' : '#8b4513',
          color: '#f5e6c8',
          padding: '8px 12px',
          borderRadius: '8px',
          maxWidth: '80%',
          fontFamily: "'IM Fell English', serif",
          fontSize: '0.95rem',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        }}
      >
        <p style={{ margin: 0, wordBreak: 'break-word' }}>{Props.content}</p>
      </div>
    </div>
  );
}
