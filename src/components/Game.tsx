import Mainbgm from "../assets/audio/Mbgm.mp3";
import React, { useState, useEffect, useRef } from "react";
import "./Game.css";
import Menu from "./Menu.tsx";
import { useAppSelector } from "../customHook/store/hooks.ts";
import {
  selectWebSocket,
} from "../customHook/store/Slices/webSocketSlice.ts";
import JoinLeaveMessage from "../customHook/joinLeaveMessage.tsx";
import MedievalModal from "./common/MedievalModal.tsx";

import GameManual from "./common/GameManual.tsx";

// Medieval Title Banner
const TitleBanner: React.FC = () => (
  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
    <svg width="400" height="140" viewBox="0 0 400 140">
      {/* Banner shape */}
      <path
        d="M30 20 L370 20 L370 90 L200 120 L30 90 Z"
        fill="#8b0000"
        stroke="#5d2e0c"
        strokeWidth="4"
      />
      {/* Banner shadow */}
      <path
        d="M30 90 L200 120 L370 90 L370 95 L200 125 L30 95 Z"
        fill="#4a0000"
      />
      {/* Top rod */}
      <rect x="20" y="12" width="360" height="14" fill="#6b4423" rx="4" />
      {/* Poles */}
      <rect x="15" y="5" width="10" height="100" fill="#8b4513" />
      <rect x="375" y="5" width="10" height="100" fill="#8b4513" />
      {/* Pole caps */}
      <circle cx="20" cy="5" r="10" fill="#c9a227" />
      <circle cx="380" cy="5" r="10" fill="#c9a227" />
      {/* Title */}
      <text
        x="200"
        y="68"
        textAnchor="middle"
        fontFamily="Cinzel, serif"
        fontSize="42"
        fontWeight="700"
        fill="#f5e6c8"
      >
        UPBEAT
      </text>
      <text
        x="200"
        y="95"
        textAnchor="middle"
        fontFamily="IM Fell English, serif"
        fontSize="16"
        fill="#d4c090"
        fontStyle="italic"
      >
        Conquest of the Realm
      </text>
    </svg>
  </div>
);

// Settings Button Component
const SettingsButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      padding: '12px 24px',
      backgroundColor: '#6b4423',
      border: '3px solid #5d2e0c',
      borderRadius: '4px',
      cursor: 'pointer',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
      fontFamily: "'Cinzel', serif",
      fontSize: '1rem',
      fontWeight: 700,
      color: '#f5e6c8',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    }}
  >
    Settings
  </button>
);

// Manual Button Component
const ManualButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      padding: '12px 24px',
      backgroundColor: '#2d5016',
      border: '3px solid #1a3009',
      borderRadius: '4px',
      cursor: 'pointer',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
      fontFamily: "'Cinzel', serif",
      fontSize: '1rem',
      fontWeight: 700,
      color: '#f5e6c8',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    }}
  >
    Manual
  </button>
);

function Game() {
  const [volume, setVolume] = useState(0.02);
  const [showSettings, setShowSettings] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const webSocketState = useAppSelector(selectWebSocket);

  useEffect(() => {
    const audio = new Audio(Mainbgm);
    audio.volume = volume;
    audio.loop = true;
    audioRef.current = audio;

    audio.play().catch(() => {
      // Autoplay may be blocked
    });

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#d4c090',
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(139, 69, 19, 0.05) 2px,
            rgba(139, 69, 19, 0.05) 4px
          )
        `,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Settings Button */}
      <SettingsButton onClick={() => setShowSettings(true)} />
      
      {/* Manual Button */}
      <ManualButton onClick={() => setShowManual(true)} />

      {/* Title Banner */}
      <TitleBanner />

      {/* Join/Leave Messages */}
      <div
        style={{
          position: 'fixed',
          top: '80px',
          left: '20px',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxHeight: '200px',
          overflow: 'hidden',
        }}
      >
        {webSocketState.messages?.slice(-5).map((message, index) => (
          <JoinLeaveMessage
            sender={message.sender}
            messageType={message.type}
            key={index}
            timestamp={message.timestamp}
          />
        ))}
      </div>

      {/* Main Menu */}
      <Menu />

      {/* Settings Modal */}
      <MedievalModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Royal Settings"
        size="small"
      >
        <div style={{ padding: '16px 0' }}>
          <label
            style={{
              display: 'block',
              fontFamily: "'Cinzel', serif",
              fontSize: '1rem',
              fontWeight: 600,
              color: '#5d2e0c',
              marginBottom: '12px',
            }}
          >
            Minstrel Volume
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>🔈</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              style={{
                flex: 1,
                height: '8px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            />
            <span style={{ fontSize: '20px' }}>🔊</span>
          </div>
          <div
            style={{
              textAlign: 'center',
              marginTop: '8px',
              fontFamily: "'IM Fell English', serif",
              color: '#5d2e0c',
            }}
          >
            {Math.round(volume * 100)}%
          </div>
        </div>
      </MedievalModal>

      {/* Manual Modal */}
      <MedievalModal
        isOpen={showManual}
        onClose={() => setShowManual(false)}
        title="Royal Archive"
        size="medium"
      >
        <GameManual />
      </MedievalModal>
    </div>
  );
}

export const Component = Game;
