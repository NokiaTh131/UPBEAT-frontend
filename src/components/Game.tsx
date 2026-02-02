import Bg from "../assets/main.png";
import Title from "../assets/title.png";
import Earth from "../assets/earth.png";
import Mainbgm from "../assets/Mbgm.mp3";
import sett from "../assets/setting.png";
import nsett from "../assets/setting2.png";

import React, { useState, useEffect } from "react";
import "./Game.css";
import "./Menu.css";
import Menu from "./Menu.tsx";
import { useAppSelector } from "../customHook/store/hooks.ts";
import { selectUsername } from "../customHook/store/Slices/usernameSlice.ts";
import {
  selectWebSocket,
  messageType,
} from "../customHook/store/Slices/webSocketSlice.ts";
import useWebSocket from "../customHook/useWebSocket.ts";
import "./NotificationModal.css";
import JoinLeaveMessage from "../customHook/joinLeaveMessage.tsx";
import { Link } from "react-router-dom";

function Game() {
  const [volume, setVolume] = useState(0.02);
  const [showNotification, setShowNotification] = useState(false);
  const popped = false;
  const username = useAppSelector(selectUsername);
  const webSocketState = useAppSelector(selectWebSocket);
  const { connect } = useWebSocket();
  const [settImage, setSettImage] = useState(sett);
  const [poppeded, pop] = React.useState(false);
  const [settHighlighted, setSettHighlighted] = useState(false);

  useEffect(() => {
    const audio = new Audio(Mainbgm);
    audio.volume = volume;

    if (!popped) {
      audio.play();
    } else {
      audio.pause();
      audio.currentTime = 0;
    }

    return () => {
      // Cleanup
      audio.pause();
      audio.currentTime = 0;
    };
  }, [popped, volume]);

  const handleVolumeChange = (event) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
  };

  const handleSettClick = () => {
    setSettImage(nsett);
    pop(true);
  };

  const handleSettRelease = () => {
    setShowNotification(true);
    setSettImage(sett);
    pop(false);
  };

  return (
    <div className="game">
      <div style={{ position: "relative" }}>
        <img
          src={Bg}
          style={{ width: "1280px", height: "auto" }}
          alt="Background"
        />
        <div
          style={{
            position: "absolute",
            top: "29%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 9500, // Set a high z-index to ensure it appears on top
          }}
        >
          <div>
            <img
              src={settImage}
              alt="Settings"
              onMouseEnter={() => setSettHighlighted(true)}
              onMouseLeave={() => setSettHighlighted(false)}
              className={settHighlighted ? "highlighted" : ""}
              onClick={() => setShowNotification(true)}
              style={{ cursor: "pointer" }}
            />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          {showNotification && (
            <div className="notification-modal">
              <div className="notification-content">
                <div
                  style={{
                    position: "absolute",
                    bottom: "50%",
                    left: "50%",
                    transform: "translate(-50%, 50%)",
                  }}
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    style={{ width: "200px" }} // Adjust the width as needed
                  />
                </div>
                <p>Volume mixer</p>
                <button
                  onClick={() => {
                    setShowNotification(false);
                  }}
                  style={{ marginTop: "50px" }}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          <img
            src={Title}
            alt="Title"
            style={{
              position: "absolute",
              top: "12%", // Adjust the top value as needed
              left: "50%",
              transform: "translate(-50%, -50%) scale(1)",
              animation: "pulsateInfinitely 2s ease-in-out infinite",
              width: "30%",
            }}
          />

          <style>
            {`
      @keyframes pulsateInfinitely {
        0%, 100% {
          transform: translate(-50%, -50%) scale(1);
        }
        50% {
          transform: translate(-50%, -50%) scale(1.1);
        }
      }
    `}
          </style>
          <img
            src={Earth}
            alt="Earth"
            style={{
              position: "absolute",
              bottom: "30%", // Adjust the top value as needed
              transform: "translate(-50%, -50%)",
              width: "700px", // Adjust the size as needed
              height: "auto",
              animation: "spin 30s linear infinite", // 10s duration, linear timing, infinite loop
            }}
          />

          {/* CSS Keyframes for the Spin Animation */}
          <style>
            {`
            @keyframes spin {
            from {
            transform: rotate(0deg);
            }
            to {
            transform: rotate(360deg);
            }
            }
        `}
          </style>
          <div className="centered-container">
            {webSocketState.messages?.map((message, index) => {
              return (
                <JoinLeaveMessage
                  sender={message.sender}
                  messageType={message.type}
                  key={index}
                  timestamp={message.timestamp}
                />
              );
            })}
          </div>
          <Menu />
        </div>
      </div>
    </div>
  );
}

export const Component = Game;
