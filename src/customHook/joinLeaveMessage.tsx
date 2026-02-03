import { messageType } from "../customHook/store/Slices/webSocketSlice.ts";

interface JoinLeaveMessageProps {
  sender: string;
  messageType: messageType;
  timestamp?: string;
}

export default function JoinLeaveMessage(Props: JoinLeaveMessageProps) {
  const isJoin = Props.messageType === messageType.JOIN;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '8px',
      }}
    >
      <div
        style={{
          backgroundColor: isJoin ? '#2d5016' : '#8b0000',
          color: '#f5e6c8',
          padding: '8px 16px',
          borderRadius: '4px',
          fontFamily: "'IM Fell English', serif",
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        }}
      >
        <span style={{ fontSize: '1.1rem' }}>
          {isJoin ? '⚔️' : '🏃'}
        </span>
        <span>
          <strong>{Props.sender}</strong>
          {isJoin ? ' has entered the realm!' : ' has fled the battlefield'}
        </span>
      </div>
    </div>
  );
}
