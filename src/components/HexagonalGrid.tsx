// HexagonalGrid.jsx
import React, { useState, useEffect } from "react";
import "./HexagonalGrid.css"; // Create a CSS file for styling if needed
import { Player, ApiResponse } from "../model";
import {
  getPlayer,
  getCurLand,
  getLand,
  setConstructionPlan,
  getCurConstructionPlan,
  setCurConstructionPlan,
  Parse,
  playerReady,
} from "../repositories";
import { useNavigate } from "react-router-dom";
import home from "../assets/home.png";
import castle from "../assets/castle.png";
import "./NotificationModal.css";
import useWebSocket from "../customHook/useWebSocket.ts";
import { useAppSelector } from "../customHook/store/hooks.ts";
import { selectUsername } from "../customHook/store/Slices/usernameSlice.ts";
import { selectWebSocket } from "../customHook/store/Slices/webSocketSlice.ts";
import ChatBox from "../customHook/ChatBox.tsx";

function HexagonalGrid() {
  const [zoomLevel, setZoomLevel] = useState(100); // Default zoom level is 100%
  const [player, setPlayer] = React.useState<Player | null>(null);
  const [landed, setLand] = React.useState<ApiResponse | null>(null);
  const [error, setError] = React.useState<Error | null>(null);
  const [constructionPlanText, setConstructionPlanText] =
    useState("Please enter");
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [editTimer, setEditTimer] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [isInfo, setIsinfo] = useState(false);
  const username = useAppSelector(selectUsername);
  const webSocketState = useAppSelector(selectWebSocket);
  const [timeout, setTimeout] = useState(false);
  const [disBut, setDisbut] = useState(false);
  const [disyesBut, setyesDisbut] = useState(false);
  const [disTextBut, setTextDisbut] = useState(true);
  const [isLoading, setLoading] = useState(false);
  const [websocketMessage, setWebsocketMessage] = useState("");
  const [showChatBox, setShowChatBox] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [isFirsttime, setIsFirstTime] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (showNotification) {
      // Start countdown if isInfo is true
      setCountdown2(init_plan_min * 60 + init_plan_sec);
      setShowCountdown(true);
      const interval = setInterval(() => {
        setCountdown2((prevCountdown) => {
          if (prevCountdown > 0) {
            return prevCountdown - 1;
          } else {
            setyesDisbut(true);
            clearInterval(interval);
            setShowCountdown(false);
            return 0;
          }
        });
      }, 1000);
      // Clear the interval on component unmount
      return () => clearInterval(interval);
    }
  }, [showNotification]);

  useEffect(() => {
    if (!disTextBut) {
      setShowNotification(true);
    }
  }, [disTextBut]);

  useEffect(() => {
    setShowTextEditor(true);
  }, []);

  useEffect(() => {
    return () => {
      if (editTimer) {
        clearInterval(editTimer);
      }
    };
  }, [editTimer, showTextEditor]);

  React.useEffect(() => {
    const name = username;
    if (!name) return navigate("/");
    getPlayer(name)
      .then((response) => {
        setPlayer(response.data);
        const storedConstructionPlan = getCurConstructionPlan(name);
        setConstructionPlanText(
          storedConstructionPlan ||
            response.data?.constructionplan ||
            "Please input your construction plan"
        );
      })
      .catch(setError);
  }, []);

  React.useEffect(() => {
    const landd = getCurLand();
    if (!landd) return navigate("/");
    getLand()
      .then((response) => {
        setLand(response.data);
        getPlayer(username);
      })
      .catch(setError);
  }, []);

  React.useEffect(() => {
    if (!webSocketState.messages || webSocketState.messages.length === 0) return;

    const name = username;
    if (!name) {
      navigate("/");
      return;
    }

    getPlayer(name)
      .then((response) => {
        setPlayer(response.data);
      })
      .catch(setError);

    const landd = getCurLand();
    if (!landd) {
      navigate("/");
      return;
    }

    getLand()
      .then((response) => setLand(response.data))
      .catch(setError);
  }, [webSocketState.messages, username, navigate]);

  React.useEffect(() => {
    if (!webSocketState.messages || webSocketState.messages.length === 0) return;

    const name = username;
    if (!name) {
      navigate("/");
      return;
    }

    const lastMessage =
      webSocketState.messages[webSocketState.messages.length - 1];

    if (lastMessage.content === name) {
      setTextDisbut(false);
    } else {
      setTextDisbut(true);
    }

    // Find the last message from GM to display
    const lastGMMessage = [...webSocketState.messages]
      .reverse()
      .find((m) => m.sender === "GM");
    if (lastGMMessage) {
      setWebsocketMessage(lastGMMessage.content);
    }
  }, [webSocketState.messages, username, navigate]);

  const [countdown, setCountdown] = useState(0);
  const [countdown2, setCountdown2] = useState(0);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if the pressed key is 'Z' or 'X'
      if (event.key === "z" || event.key === "Z") {
        setZoomLevel((prevZoom) => prevZoom + 10); // Increase zoom level by 10%
      } else if (event.key === "x" || event.key === "X") {
        setZoomLevel((prevZoom) => Math.max(10, prevZoom - 10)); // Decrease zoom level by 10%, but keep it at least 10%
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSaveConstructionPlan = async () => {
    setDisbut(true);
    setLoading(true);

    try {
      await setConstructionPlan(username, constructionPlanText);
      await setCurConstructionPlan(username, constructionPlanText);

      if (!isFirsttime) {
        await Parse(username);
        alert(username + " do parse");
      } else {
        setIsFirstTime(false);
        alert(username + " just arrive");
      }

      setShowTextEditor(false);
      setDisbut(false);
      setLoading(false);
      playerReady();
      setShowNotification(false);
    } catch (error) {
      alert(error + " Please press save again.");
      setDisbut(false);
    }
  };

  if (!player || !player.bindings || !landed) {
    return null; // or some loading state
  }

  const { rows, cols } = player.bindings;
  const graph = landed?.map.adjacencyMatrix;
  const { plan_rev_min, plan_rev_sec, init_plan_min, init_plan_sec } = landed;

  const handleDebugButtonClick = () => {
    setShowChatBox(!showChatBox);
  };

  const handleOpenTextEditor = () => {
    if (timeout) {
      handleSaveConstructionPlan();
      return;
    }
    if (!showTextEditor) {
      const remainingTime = countdown || plan_rev_min * 60 + plan_rev_sec;
      setCountdown(remainingTime);
      setShowTextEditor(true);
      if (editTimer) {
        clearInterval(editTimer);
      }
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown > 0) {
            return prevCountdown - 1;
          } else {
            // Clear the interval when countdown reaches 0
            setShowTextEditor(false);
            clearInterval(timer);
            handleSaveConstructionPlan();
            setTimeout(true);
            return 0;
          }
        });
      }, 1000);

      // Save the timer reference to state
      setEditTimer(timer);
    }
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  const generateHexagons = () => {
    const hexagons = [];

    const handleClick = (event, playerID, deposit) => {
      event.target.classList.add("highlighted");
      setNotificationMessage(
        `Deposit of ${playerID}: ${Number(Math.abs(deposit)).toFixed(2)}`
      );
      setIsinfo(true);
    };

    for (let row = 1; row <= rows; row++) {
      for (let column = 1; column <= cols; column++) {
        const isEvenColumn = column % 2 === 0;
        const cell = graph[row - 1]?.[column - 1];
        if (!cell) {
          continue;
        }
        const { player_Id, deposit, p, citycenter } = cell;
        const classNames = `hex ${isEvenColumn ? "even-column" : ""}`;
        hexagons.push(
          <div
            key={`hex-${row}-${column}`}
            className={classNames}
            data-row={row}
            data-column={column}
            onClick={(event) => handleClick(event, p.name, deposit)}
          >
            {player_Id !== 0 && (
              <img
                src={citycenter ? castle : home}
                alt={`House for Player ${player_Id}`}
                className={citycenter ? "castle-image" : "house-image"}
                style={{ filter: `hue-rotate(${player_Id * 30}deg)` }}
              />
            )}
          </div>
        );
      }
    }

    return hexagons;
  };

  return (
    <div>
      {showCountdown && (
        <div className="countdown-container">
          <p className="countdown-text">{`Time remaining: ${formatTime(
            countdown2
          )}`}</p>
        </div>
      )}
      {showChatBox && <ChatBox />}
      {websocketMessage && (
        <div className="websocket-message-container">
          <div className="websocket-message">{websocketMessage}</div>
        </div>
      )}
      {showTextEditor && (
        <div className="time-text">
          {`Time remaining: ${formatTime(countdown)}`}
        </div>
      )}
      <div className="hello-text">
        {player.name}: {player.budget} Turn : {player.bindings.t}
        <img
          src={castle}
          className="castle-forshow"
          style={{ filter: `hue-rotate(${player.id * 30}deg)` }}
        />
      </div>
      <div
        className="hex-grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          zoom: `${zoomLevel}%`,
        }}
      >
        {generateHexagons()}
      </div>
      {showTextEditor && (
        <div className="text-editor-overlay">
          <div className="text-editor">
            <textarea
              className="text-edit-con"
              value={constructionPlanText}
              onChange={(e) => setConstructionPlanText(e.target.value)}
            />
            <button
              onClick={handleSaveConstructionPlan}
              disabled={disBut ? true : false}
            >
              Save Construction Plan
            </button>
          </div>
        </div>
      )}
      {<div className="loader"></div>}
      {showNotification && (
        <div className="notification-modal">
          <div className="notification-content">
            <p>do you want to change plan?</p>
            <button
              onClick={() => {
                setShowNotification(false);
                handleOpenTextEditor();
              }}
              disabled={disyesBut ? true : false}
            >
              Yes
            </button>
            <button
              onClick={() => {
                handleSaveConstructionPlan();
              }}
            >
              No
            </button>
          </div>
        </div>
      )}
      {<div className="loader"></div>}
      {isInfo && (
        <div className="notification-modal">
          <div className="notification-content">
            <p>{notificationMessage}</p>
            <button
              onClick={() => {
                setIsinfo(false);
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
      <button className="debug-button" onClick={handleDebugButtonClick}>
        Debug
      </button>
    </div>
  );
}

export const Component = HexagonalGrid;
