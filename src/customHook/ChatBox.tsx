import Chat from "./Chat.tsx";
import useWebSocket from "../customHook/useWebSocket.ts";
import { useState } from "react";
import { useAppSelector } from "../customHook/store/hooks.ts";
import { selectUsername } from "../customHook/store/Slices/usernameSlice.ts";
import {
  selectWebSocket,
  messageType,
} from "../customHook/store/Slices/webSocketSlice.ts";
import JoinLeaveMessage from "./joinLeaveMessage.tsx";

export default function ChatBox() {
  const { sendMessage } = useWebSocket();
  const [typedMessage, setTypedMessage] = useState<string>("");
  const username = useAppSelector(selectUsername);
  const webSocketState = useAppSelector(selectWebSocket);

  return (
    <div
      style={{
        backgroundColor: '#e8d4a8',
        border: '3px solid #8b4513',
        borderRadius: '8px',
        padding: '16px',
        width: '350px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: '2px solid #8b4513',
          paddingBottom: '12px',
          marginBottom: '12px',
        }}
      >
        <h3
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '1.2rem',
            fontWeight: 700,
            color: '#5d2e0c',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>📜</span>
          Royal Herald
        </h3>
      </div>

      {/* Messages */}
      <div
        style={{
          maxHeight: '300px',
          overflowY: 'auto',
          marginBottom: '12px',
        }}
      >
        {webSocketState.messages?.map((message, index) => {
          return message.type === messageType.JOIN ||
            message.type === messageType.LEAVE ? (
            <JoinLeaveMessage
              sender={message.sender}
              messageType={message.type}
              key={index}
            />
          ) : (
            <Chat
              key={index}
              content={message.content}
              isMe={username === message.sender}
            />
          );
        })}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(typedMessage, username);
          setTypedMessage("");
        }}
        style={{
          display: 'flex',
          gap: '8px',
        }}
      >
        <input
          type="text"
          placeholder="Send a message..."
          required
          value={typedMessage}
          onChange={(e) => setTypedMessage(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 12px',
            fontFamily: "'IM Fell English', serif",
            fontSize: '1rem',
            border: '2px solid #8b4513',
            borderRadius: '4px',
            backgroundColor: '#f5e6c8',
            color: '#2d2d2d',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 16px',
            fontFamily: "'Cinzel', serif",
            fontWeight: 600,
            backgroundColor: '#2d5016',
            color: '#f5e6c8',
            border: '2px solid #1a3009',
            borderRadius: '4px',
            cursor: 'pointer',
            textTransform: 'uppercase',
            fontSize: '0.85rem',
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
