import { useState, useEffect, useCallback, useRef } from "react";
import "./HexagonalGrid.css";
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
import HexTile, { TerrainType } from "./hex/HexTile";
import MedievalModal from "./common/MedievalModal";
import { useAppSelector } from "../customHook/store/hooks.ts";
import { selectUsername } from "../customHook/store/Slices/usernameSlice.ts";
import { selectWebSocket } from "../customHook/store/Slices/webSocketSlice.ts";

// Terrain assignment based on position (creates varied landscape)
const getTerrainForPosition = (row: number, col: number): TerrainType => {
  const hash = (row * 31 + col * 17) % 100;
  if (hash < 40) return 'grass';
  if (hash < 60) return 'forest';
  if (hash < 70) return 'mountain';
  if (hash < 80) return 'water';
  if (hash < 90) return 'desert';
  return 'swamp';
};

// Player colors for banners
const playerColors = [
  { name: 'Gold', hex: '#c9a227' },
  { name: 'Crimson', hex: '#8b0000' },
  { name: 'Royal Blue', hex: '#1a3a5c' },
  { name: 'Purple', hex: '#4b0082' },
  { name: 'Forest', hex: '#2d5016' },
  { name: 'Bronze', hex: '#cd7f32' },
  { name: 'Teal', hex: '#008080' },
  { name: 'Maroon', hex: '#800000' },
];

function HexagonalGrid() {
  // Zoom and pan state
  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const [player, setPlayer] = useState<Player | null>(null);
  const [landed, setLand] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [constructionPlanText, setConstructionPlanText] = useState("Please enter");
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [editTimer, setEditTimer] = useState<NodeJS.Timeout | null>(null);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [showCellInfo, setShowCellInfo] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ playerId: number; deposit: number } | null>(null);
  const username = useAppSelector(selectUsername);
  const webSocketState = useAppSelector(selectWebSocket);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isYesDisabled, setIsYesDisabled] = useState(false);
  const [isTextDisabled, setIsTextDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [websocketMessage, setWebsocketMessage] = useState("");
  const [showCountdown, setShowCountdown] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [countdown2, setCountdown2] = useState(0);
  const [isEditorFolded, setIsEditorFolded] = useState(false);

  const navigate = useNavigate();

  // Countdown effect for plan submission
  useEffect(() => {
    if (showNotification && landed) {
      const { init_plan_min, init_plan_sec } = landed;
      setCountdown2(init_plan_min * 60 + init_plan_sec);
      setShowCountdown(true);
      const interval = setInterval(() => {
        setCountdown2((prev) => {
          if (prev > 0) return prev - 1;
          setIsYesDisabled(true);
          clearInterval(interval);
          setShowCountdown(false);
          return 0;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showNotification, landed]);

  useEffect(() => {
    if (!isTextDisabled) {
      setShowNotification(true);
    }
  }, [isTextDisabled]);

  useEffect(() => {
    setShowTextEditor(true);
  }, []);

  useEffect(() => {
    return () => {
      if (editTimer) clearInterval(editTimer);
    };
  }, [editTimer, showTextEditor]);

  // Fetch player data
  useEffect(() => {
    const name = username;
    if (!name) {
      navigate("/");
      return;
    }
    getPlayer(name)
      .then((response) => {
        setPlayer(response.data);
        const storedPlan = getCurConstructionPlan(name);
        setConstructionPlanText(
          storedPlan || response.data?.constructionplan || "Please input your construction plan"
        );
      })
      .catch(setError);
  }, [username, navigate]);

  // Fetch land data
  useEffect(() => {
    const landd = getCurLand();
    if (!landd) {
      navigate("/");
      return;
    }
    getLand()
      .then((response) => {
        setLand(response.data);
        getPlayer(username);
      })
      .catch(setError);
  }, [username, navigate]);

  // WebSocket messages handler
  useEffect(() => {
    if (!webSocketState.messages || webSocketState.messages.length === 0) return;
    const name = username;
    if (!name) {
      navigate("/");
      return;
    }

    getPlayer(name)
      .then((response) => setPlayer(response.data))
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

  // Handle turn notifications
  useEffect(() => {
    if (!webSocketState.messages || webSocketState.messages.length === 0) return;
    const name = username;
    if (!name) {
      navigate("/");
      return;
    }

    const lastMessage = webSocketState.messages[webSocketState.messages.length - 1];
    if (lastMessage.content === name) {
      setIsTextDisabled(false);
    } else {
      setIsTextDisabled(true);
    }

    const lastGMMessage = [...webSocketState.messages].reverse().find((m) => m.sender === "GM");
    if (lastGMMessage) {
      setWebsocketMessage(lastGMMessage.content);
    }
  }, [webSocketState.messages, username, navigate]);

  // Wheel zoom handler - zoom towards mouse position
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();

    // Mouse position relative to container
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate zoom
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(scale * zoomFactor, 0.2), 3);

    // Adjust pan to zoom towards mouse position
    const scaleChange = newScale / scale;
    const newPanX = mouseX - (mouseX - panOffset.x) * scaleChange;
    const newPanY = mouseY - (mouseY - panOffset.y) * scaleChange;

    setScale(newScale);
    setPanOffset({ x: newPanX, y: newPanY });
  }, [scale, panOffset]);

  // Mouse drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start drag on left mouse button and not on interactive elements
    if (e.button !== 0) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    e.preventDefault();
  }, [panOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Attach wheel event listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Center grid initially when data loads
  useEffect(() => {
    if (!player?.bindings || !containerRef.current) return;

    const container = containerRef.current;
    const { rows, cols } = player.bindings;

    // Calculate grid dimensions
    const hexWidth = 70;
    const hexHeight = hexWidth * 0.866;
    const gridWidth = cols * hexWidth * 0.75 + hexWidth * 0.25;
    const gridHeight = rows * hexHeight + hexHeight * 0.5;

    // Center the grid in the container
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const initialX = (containerWidth - gridWidth) / 2;
    const initialY = (containerHeight - gridHeight) / 2;

    setPanOffset({ x: Math.max(50, initialX), y: Math.max(100, initialY) });
  }, [player?.bindings]);

  const handleSaveConstructionPlan = async () => {
    setIsButtonDisabled(true);
    setIsLoading(true);

    try {
      await setConstructionPlan(username, constructionPlanText);
      await setCurConstructionPlan(username, constructionPlanText);

      if (!isFirstTime) {
        await Parse(username);
      } else {
        setIsFirstTime(false);
      }

      setShowTextEditor(false);
      setIsButtonDisabled(false);
      setIsLoading(false);
      playerReady();
      setShowNotification(false);
    } catch (err) {
      setIsButtonDisabled(false);
      setIsLoading(false);
    }
  };

  const handleOpenTextEditor = useCallback(() => {
    if (timeoutReached) {
      handleSaveConstructionPlan();
      return;
    }
    if (!showTextEditor && landed) {
      const { plan_rev_min, plan_rev_sec } = landed;
      const remainingTime = countdown || plan_rev_min * 60 + plan_rev_sec;
      setCountdown(remainingTime);
      setShowTextEditor(true);
      if (editTimer) clearInterval(editTimer);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev > 0) return prev - 1;
          setShowTextEditor(false);
          clearInterval(timer);
          handleSaveConstructionPlan();
          setTimeoutReached(true);
          return 0;
        });
      }, 1000);
      setEditTimer(timer);
    }
  }, [timeoutReached, showTextEditor, landed, countdown, editTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleCellClick = (playerId: number, deposit: number, playerName: string) => {
    setSelectedCell({ playerId, deposit });
    setNotificationMessage(`Territory of ${playerName}: ${Math.abs(deposit).toFixed(2)} resources`);
    setShowCellInfo(true);
  };

  if (!player || !player.bindings || !landed) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#d4c090',
          fontFamily: "'Cinzel', serif",
          fontSize: '1.5rem',
          color: '#5d2e0c',
        }}
      >
        Loading thy realm...
      </div>
    );
  }

  const { rows, cols } = player.bindings;
  const graph = landed?.map.adjacencyMatrix;
  const playerColor = playerColors[(player.id - 1) % playerColors.length];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#d4c090',
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(139, 69, 19, 0.03) 2px,
            rgba(139, 69, 19, 0.03) 4px
          )
        `,
        position: 'relative',
      }}
    >
      {/* Countdown Banner */}
      {showCountdown && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#8b0000',
            color: '#f5e6c8',
            padding: '12px 32px',
            borderRadius: '8px',
            border: '3px solid #c9a227',
            fontFamily: "'Cinzel', serif",
            fontSize: '1.2rem',
            fontWeight: 700,
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          }}
        >
          Time Remaining: {formatTime(countdown2)}
        </div>
      )}

      {/* WebSocket Message Banner */}
      {websocketMessage && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#f5e6c8',
            color: '#5d2e0c',
            padding: '16px 32px',
            border: '4px solid #8b4513',
            borderRadius: '8px',
            fontFamily: "'Cinzel', serif",
            fontSize: '1.5rem',
            fontWeight: 700,
            zIndex: 999,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            maxWidth: '80%',
            textAlign: 'center',
          }}
        >
          {websocketMessage}
        </div>
      )}

      {/* Timer Display */}
      {showTextEditor && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            backgroundColor: '#6b4423',
            color: '#f5e6c8',
            padding: '8px 16px',
            borderRadius: '4px',
            fontFamily: "'Cinzel', serif",
            fontSize: '1rem',
            zIndex: 1000,
          }}
        >
          Edit Time: {formatTime(countdown)}
        </div>
      )}

      {/* Player Info Panel */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#e8d4a8',
          border: '3px solid #8b4513',
          borderRadius: '8px',
          padding: '16px',
          minWidth: '200px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#5d2e0c',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '16px',
              height: '16px',
              backgroundColor: playerColor.hex,
              border: '2px solid #5d2e0c',
              borderRadius: '2px',
            }}
          />
          {player.name}
        </div>
        <div
          style={{
            fontFamily: "'IM Fell English', serif",
            fontSize: '1rem',
            color: '#5d2e0c',
          }}
        >
          Treasury: <strong>{Math.round(player.budget)}</strong> gold
        </div>
        <div
          style={{
            fontFamily: "'IM Fell English', serif",
            fontSize: '0.9rem',
            color: '#6b4423',
            marginTop: '4px',
          }}
        >
          Turn: {player.bindings.t}
        </div>
      </div>

      {/* Hex Grid - Even-Q Offset Coordinate System for Flat-Top Hexes */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        <div
          style={{
            position: 'absolute',
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            willChange: 'transform',
          }}
        >
          {Array.from({ length: rows }).map((_, rowIdx) =>
            Array.from({ length: cols }).map((_, colIdx) => {
              const cell = graph[rowIdx]?.[colIdx];
              if (!cell) return null;

              const { player_Id, deposit, p, citycenter } = cell;
              const terrain = getTerrainForPosition(rowIdx, colIdx);

              // Flat-top hex dimensions
              const hexWidth = 70;
              const hexHeight = hexWidth * 0.866; // sqrt(3)/2

              // Even-Q offset: odd columns shift UP
              // (Achieved by shifting even columns DOWN)
              const isEvenColumn = colIdx % 2 === 0;

              // Calculate position
              const x = colIdx * hexWidth * 0.75;
              const y = rowIdx * hexHeight + (isEvenColumn ? hexHeight * 0.5 : 0);

              return (
                <div
                  key={`hex-${rowIdx}-${colIdx}`}
                  style={{
                    position: 'absolute',
                    left: `${x}px`,
                    top: `${y}px`,
                  }}
                >
                  <HexTile
                    terrain={terrain}
                    size={hexWidth}
                    playerId={player_Id}
                    isOwned={player_Id > 0}
                    isCityCenter={citycenter}
                    deposit={deposit}
                    onClick={() => handleCellClick(player_Id, deposit, p.name)}
                  />
                </div>
              );
            })
          )}
          {/* Spacer to give the container proper dimensions */}
          <div
            style={{
              width: `${cols * 70 * 0.75 + 70 * 0.25}px`,
              height: `${rows * 70 * 0.866 + 70 * 0.866 * 0.5}px`,
            }}
          />
        </div>
      </div>

      {/* Construction Plan Editor - Bottom Right with Fold/Unfold */}
      {showTextEditor && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: isEditorFolded ? '300px' : '700px',
            backgroundColor: '#e8d4a8',
            border: '3px solid #8b4513',
            borderRadius: '8px',
            zIndex: 1000,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            overflow: 'hidden',
          }}
        >
          {/* Header with fold/unfold toggle */}
          <div
            onClick={() => setIsEditorFolded(!isEditorFolded)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              backgroundColor: '#6b4423',
              cursor: 'pointer',
            }}
          >
            <h3
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '1rem',
                color: '#f5e6c8',
                margin: 0,
              }}
            >
              Construction Decree
            </h3>
            <span style={{ color: '#f5e6c8', fontSize: '1.2rem' }}>
              {isEditorFolded ? '+' : '-'}
            </span>
          </div>

          {/* Collapsible content */}
          {!isEditorFolded && (
            <div style={{ padding: '16px' }}>
              <textarea
                value={constructionPlanText}
                onChange={(e) => setConstructionPlanText(e.target.value)}
                style={{
                  width: '100%',
                  height: '530px',
                  padding: '12px',
                  fontFamily: "'Courier New', monospace",
                  fontSize: '0.9rem',
                  border: '2px solid #444',
                  borderRadius: '4px',
                  backgroundColor: '#1a1a1a',
                  color: '#ffffff',
                  boxSizing: 'border-box',
                  resize: 'none',
                }}
              />
              <button
                onClick={handleSaveConstructionPlan}
                disabled={isButtonDisabled}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  padding: '10px',
                  fontFamily: "'Cinzel', serif",
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  backgroundColor: isButtonDisabled ? '#6b6b6b' : '#c9a227',
                  color: '#2d2d2d',
                  border: '2px solid #5d2e0c',
                  borderRadius: '4px',
                  cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                {isLoading ? 'Sending...' : 'Issue Decree'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Turn Notification Modal - Non-closable but foldable, lower z-index */}
      <MedievalModal
        isOpen={showNotification}
        title="Thy Turn Approaches!"
        size="small"
        closable={false}
        foldable={true}
        zIndex={9000}
        position="bottom-left"
        showBackdrop={false}
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
            Dost thou wish to revise thy construction plans?
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button
              onClick={() => {
                setShowNotification(false);
                handleOpenTextEditor();
              }}
              disabled={isYesDisabled}
              style={{
                padding: '12px 32px',
                fontFamily: "'Cinzel', serif",
                fontWeight: 700,
                backgroundColor: isYesDisabled ? '#6b6b6b' : '#2d5016',
                color: '#f5e6c8',
                border: '3px solid #1a3009',
                borderRadius: '4px',
                cursor: isYesDisabled ? 'not-allowed' : 'pointer',
                textTransform: 'uppercase',
              }}
            >
              Aye
            </button>
            <button
              onClick={handleSaveConstructionPlan}
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

      {/* Cell Info Modal - Closable, higher z-index, appears on top */}
      <MedievalModal
        isOpen={showCellInfo}
        onClose={() => setShowCellInfo(false)}
        title="Territory Information"
        size="small"
        closable={true}
        foldable={false}
        zIndex={10000}
        position="center"
        showBackdrop={true}
      >
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <p
            style={{
              fontFamily: "'IM Fell English', serif",
              fontSize: '1.2rem',
              color: '#5d2e0c',
            }}
          >
            {notificationMessage}
          </p>
        </div>
      </MedievalModal>

      {/* Zoom Controls Info */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          backgroundColor: '#6b4423',
          color: '#f5e6c8',
          padding: '8px 12px',
          borderRadius: '4px',
          fontFamily: "'IM Fell English', serif",
          fontSize: '0.9rem',
          zIndex: 999,
        }}
      >
        Scroll: Zoom | Drag: Pan | {Math.round(scale * 100)}%
      </div>
    </div>
  );
}

export const Component = HexagonalGrid;
