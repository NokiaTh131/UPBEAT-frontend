import React, { useState } from "react";
import { newPlayer, setCurrentPlayer } from "../repositories";
import { Player } from "../model";
import { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import useWebSocket from "../customHook/useWebSocket.ts";
import { useDispatch } from "react-redux";
import { setUsername as sliceSetUsername } from "../customHook/store/Slices/usernameSlice.ts";

// Medieval Banner SVG Component
const MedievalBanner: React.FC = () => (
  <svg width="300" height="120" viewBox="0 0 300 120">
    {/* Banner background */}
    <path
      d="M20 10 L280 10 L280 80 L150 110 L20 80 Z"
      fill="#8b0000"
      stroke="#5d2e0c"
      strokeWidth="4"
    />
    {/* Banner shadow/depth */}
    <path
      d="M20 80 L150 110 L280 80 L280 85 L150 115 L20 85 Z"
      fill="#4a0000"
    />
    {/* Decorative top bar */}
    <rect x="10" y="5" width="280" height="12" fill="#6b4423" rx="3" />
    {/* Banner poles */}
    <rect x="8" y="0" width="8" height="95" fill="#8b4513" />
    <rect x="284" y="0" width="8" height="95" fill="#8b4513" />
    {/* Pole caps */}
    <circle cx="12" cy="0" r="8" fill="#c9a227" />
    <circle cx="288" cy="0" r="8" fill="#c9a227" />
    {/* Title text */}
    <text
      x="150"
      y="55"
      textAnchor="middle"
      fontFamily="Cinzel, serif"
      fontSize="36"
      fontWeight="700"
      fill="#f5e6c8"
      style={{ textShadow: '2px 2px 0 #4a0000' }}
    >
      UPBEAT
    </text>
    <text
      x="150"
      y="78"
      textAnchor="middle"
      fontFamily="IM Fell English, serif"
      fontSize="14"
      fill="#d4c090"
      fontStyle="italic"
    >
      Medieval Conquest
    </text>
  </svg>
);

function Hello() {
  const [error, setError] = React.useState<Error | null>(null);
  const [username, setUsername] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const { connect } = useWebSocket();

  const navigate = useNavigate();

  function handleSuccess(response: AxiosResponse<Player>) {
    setCurrentPlayer(response.data.name);
    setIsLoading(false);
    navigate("/game");
  }

  function handleError(error: Error) {
    setError(error);
    setIsLoading(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;
    
    setIsLoading(true);
    dispatch(sliceSetUsername(username));
    connect(username);
    newPlayer(username).then(handleSuccess).catch(handleError);
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
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
        padding: '20px',
      }}
    >
      {/* Banner */}
      <div style={{ marginBottom: '40px' }}>
        <MedievalBanner />
      </div>

      {/* Scroll Container */}
      <div
        style={{
          backgroundColor: '#f5e6c8',
          border: '4px solid #8b4513',
          borderRadius: '8px',
          padding: '32px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          position: 'relative',
        }}
      >
        {/* Top scroll roll */}
        <div
          style={{
            position: 'absolute',
            top: '-16px',
            left: '-8px',
            right: '-8px',
            height: '24px',
            backgroundColor: '#6b4423',
            borderRadius: '12px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
          }}
        />

        <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="username"
              style={{
                display: 'block',
                fontFamily: "'Cinzel', serif",
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#5d2e0c',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Enter Thy Name, Traveler
            </label>
            <input
              id="username"
              type="text"
              placeholder="Sir Lancelot..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontFamily: "'IM Fell English', serif",
                fontSize: '1.1rem',
                border: '3px solid #8b4513',
                borderRadius: '4px',
                backgroundColor: '#f5e6c8',
                color: '#2d2d2d',
                boxSizing: 'border-box',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            />
          </div>

          {error && (
            <div
              style={{
                backgroundColor: '#8b0000',
                color: '#f5e6c8',
                padding: '12px',
                borderRadius: '4px',
                marginBottom: '16px',
                fontFamily: "'IM Fell English', serif",
                textAlign: 'center',
              }}
            >
              A dark force prevents thy entry. Try again!
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !username.trim()}
            style={{
              width: '100%',
              padding: '14px 24px',
              fontFamily: "'Cinzel', serif",
              fontSize: '1.1rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              backgroundColor: '#c9a227',
              color: '#5d2e0c',
              border: '3px solid #5d2e0c',
              borderRadius: '4px',
              cursor: isLoading ? 'wait' : 'pointer',
              boxShadow: '0 4px 0 #5d2e0c, 0 6px 12px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.2s ease',
              opacity: isLoading || !username.trim() ? 0.7 : 1,
            }}
          >
            {isLoading ? 'Entering...' : 'Enter the Realm'}
          </button>
        </form>

        {/* Bottom scroll roll */}
        <div
          style={{
            position: 'absolute',
            bottom: '-16px',
            left: '-8px',
            right: '-8px',
            height: '24px',
            backgroundColor: '#6b4423',
            borderRadius: '12px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
          }}
        />
      </div>

      {/* Footer decoration */}
      <div
        style={{
          marginTop: '40px',
          fontFamily: "'IM Fell English', serif",
          color: '#5d2e0c',
          fontStyle: 'italic',
          textAlign: 'center',
        }}
      >
        A realm of strategy awaits thee...
      </div>
    </div>
  );
}

export const Component = Hello;
