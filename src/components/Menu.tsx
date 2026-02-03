import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import startsfx from "../assets/audio/enter.mp3";
import { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import { ApiResponse, Player } from "../model";
import { newLand, setCurLand, StartGame, getPlayers, deletePlayer } from "../repositories";
import useWebSocket from "../customHook/useWebSocket.ts";
import { useAppSelector } from "../customHook/store/hooks.ts";
import { selectWebSocket } from "../customHook/store/Slices/webSocketSlice.ts";
import MedievalModal from "./common/MedievalModal";
import { selectUsername } from "../customHook/store/Slices/usernameSlice.ts";

function Menu() {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { sendMessage } = useWebSocket();
  const navigate = useNavigate();
  const webSocketState = useAppSelector(selectWebSocket);
  const currentUsername = useAppSelector(selectUsername);
  const [landed, setLanded] = useState(false);
  const [connectedPlayers, setConnectedPlayers] = useState<Player[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Poll for connected players
  useEffect(() => {
    const fetchPlayers = () => {
      getPlayers()
        .then((response) => setConnectedPlayers(response.data))
        .catch(console.error);
    };

    fetchPlayers();
    const interval = setInterval(fetchPlayers, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    newLand().then(handleSuccess);
  }, [landed]);

  useEffect(() => {
    const shouldNavigate = webSocketState.messages?.some(
      (message) => message.content === "Start"
    );
    if (shouldNavigate) {
      navigate("/map");
    }
  }, [webSocketState.messages, navigate]);

  function handleSuccess(response: AxiosResponse<ApiResponse>) {
    setCurLand(response.data.players);
  }

  const playClickSound = () => {
    const audio = new Audio(startsfx);
    audio.play();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    setIsPressed(true);
    playClickSound();
    
    setTimeout(() => {
      setIsPressed(false);
      setShowConfirmation(true);
    }, 200);
  };

  const handleConfirmStart = () => {
    sendMessage("Start", "Start");
    StartGame();
    setShowConfirmation(false);
    setLanded(true);
  };

  const handleKick = async (name: string) => {
    try {
      await deletePlayer(name);
      // Refresh list immediately
      const response = await getPlayers();
      setConnectedPlayers(response.data);
    } catch (error) {
      console.error("Failed to banish lord:", error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        marginTop: "40px",
      }}
    >
      {/* Main Start Button */}
      <Link
        to="/map"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsPressed(false);
        }}
        style={{ textDecoration: "none" }}
      >
        <div
          style={{
            position: "relative",
            cursor: "pointer",
          }}
        >
          {/* Shield-shaped button */}
          <svg
            width="200"
            height="240"
            viewBox="0 0 200 240"
            style={{
              filter: isHovered
                ? "drop-shadow(0 0 20px rgba(201, 162, 39, 0.6))"
                : "drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4))",
              transform: isPressed
                ? "scale(0.95)"
                : isHovered
                ? "scale(1.05)"
                : "scale(1)",
              transition: "all 0.2s ease",
            }}
          >
            {/* Shield background */}
            <path
              d="M100 10 L185 40 L185 120 Q185 200 100 230 Q15 200 15 120 L15 40 Z"
              fill="#8b0000"
              stroke="#c9a227"
              strokeWidth="6"
            />
            {/* Inner shield border */}
            <path
              d="M100 25 L170 50 L170 115 Q170 185 100 210 Q30 185 30 115 L30 50 Z"
              fill="none"
              stroke="#c9a227"
              strokeWidth="2"
            />
            {/* Decorative top */}
            <ellipse cx="100" cy="10" rx="30" ry="8" fill="#c9a227" />
            
            {/* Sword icon */}
            <g transform="translate(100, 85)">
              {/* Blade */}
              <rect x="-4" y="-50" width="8" height="70" fill="#e8e8e8" />
              <polygon points="0,-60 -4,-50 4,-50" fill="#e8e8e8" />
              {/* Guard */}
              <rect x="-25" y="18" width="50" height="8" fill="#c9a227" rx="2" />
              {/* Handle */}
              <rect x="-5" y="26" width="10" height="25" fill="#6b4423" />
              {/* Pommel */}
              <circle cx="0" cy="55" r="8" fill="#c9a227" />
            </g>

            {/* Text */}
            <text
              x="100"
              y="175"
              textAnchor="middle"
              fontFamily="Cinzel, serif"
              fontSize="22"
              fontWeight="700"
              fill="#f5e6c8"
            >
              BEGIN
            </text>
            <text
              x="100"
              y="195"
              textAnchor="middle"
              fontFamily="Cinzel, serif"
              fontSize="16"
              fontWeight="600"
              fill="#d4c090"
            >
              CONQUEST
            </text>
          </svg>
        </div>
      </Link>

      {/* Instruction text */}
      <div
        style={{
          fontFamily: "'IM Fell English', serif",
          fontSize: "1rem",
          color: "#5d2e0c",
          fontStyle: "italic",
          textAlign: "center",
          maxWidth: "300px",
        }}
      >
        Click the shield to begin thy conquest of the realm
      </div>

      {/* Waiting Room / Player List */}
      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          backgroundColor: "#e8d4a8",
          border: "3px solid #8b4513",
          borderRadius: "8px",
          width: "300px",
          textAlign: "center",
          boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
        }}
      >
        <h3
          style={{
            fontFamily: "'Cinzel', serif",
            color: "#5d2e0c",
            margin: "0 0 15px 0",
            borderBottom: "2px solid #8b4513",
            paddingBottom: "10px",
            fontSize: "1.2rem",
            fontWeight: "700",
          }}
        >
          Gathering of Lords
        </h3>
        <div
          style={{
            maxHeight: "150px",
            overflowY: "auto",
            fontFamily: "'IM Fell English', serif",
            fontSize: "1.1rem",
            color: "#2d2d2d",
            scrollbarWidth: "thin",
            scrollbarColor: "#8b4513 #e8d4a8",
          }}
        >
          {connectedPlayers.length === 0 ? (
            <div style={{ fontStyle: "italic", color: "#6b4423" }}>
              The hall is empty...
            </div>
          ) : (
            connectedPlayers.map((p, i) => (
              <div
                key={i}
                style={{
                  padding: "6px 0",
                  borderBottom:
                    i < connectedPlayers.length - 1 ? "1px dashed #c9a227" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "0.8em", color: "#8b0000" }}>⚜</span>
                  {p.name}
                  <span style={{ fontSize: "0.8em", color: "#8b0000" }}>⚜</span>
                </div>
                <button
                  onClick={() => handleKick(p.name)}
                  title={p.name === currentUsername ? "Flee the Realm" : "Banish Lord"}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#8b0000",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                    padding: "0 5px",
                    lineHeight: "1",
                  }}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
        <div
          style={{
            marginTop: "15px",
            fontSize: "0.9rem",
            color: "#6b4423",
            fontFamily: "'Cinzel', serif",
            borderTop: "2px solid #8b4513",
            paddingTop: "10px",
          }}
        >
          {connectedPlayers.length} {connectedPlayers.length === 1 ? "Lord" : "Lords"} Awaiting
        </div>
      </div>

      {/* Start Game Confirmation Modal */}
      <MedievalModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        title="Declare War?"
        size="small"
      >
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <p
            style={{
              fontFamily: "'IM Fell English', serif",
              fontSize: '1.1rem',
              color: '#5d2e0c',
              marginBottom: '24px',
            }}
          >
            Are you certain you wish to begin the conquest with {connectedPlayers.length} {connectedPlayers.length === 1 ? "lord" : "lords"}?
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button
              onClick={handleConfirmStart}
              style={{
                padding: '12px 32px',
                fontFamily: "'Cinzel', serif",
                fontWeight: 700,
                backgroundColor: '#2d5016',
                color: '#f5e6c8',
                border: '3px solid #1a3009',
                borderRadius: '4px',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              Aye
            </button>
            <button
              onClick={() => setShowConfirmation(false)}
              style={{
                padding: '12px 32px',
                fontFamily: "'Cinzel', serif",
                fontWeight: 700,
                backgroundColor: '#8b0000',
                color: '#f5e6c8',
                border: '3px solid #4a0000',
                borderRadius: '4px',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              Nay
            </button>
          </div>
        </div>
      </MedievalModal>
    </div>
  );
}

export default Menu;
