import React, { useState } from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import "./Menu.css";
import start from "../assets/start.png";
import nstart from "../assets/start2.png";
import startsfx from "../assets/enter.mp3";
import { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import { ApiResponse } from "../model";
import { newLand, setCurLand, StartGame } from "../repositories";
import useWebSocket from "../customHook/useWebSocket.ts";
import { useAppSelector } from "../customHook/store/hooks.ts";
import { selectWebSocket } from "../customHook/store/Slices/webSocketSlice.ts";

function Menu() {
  const [startImage, setStartImage] = useState(start);
  const [popped, pop] = React.useState(false);
  const [landed, setland] = React.useState(false);
  const { sendMessage } = useWebSocket();
  const navigate = useNavigate();
  const webSocketState = useAppSelector(selectWebSocket);
  const [startHighlighted, setStartHighlighted] = useState(false);

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

  useEffect(() => {
    if (!popped) return;
    const audio = new Audio(startsfx);
    audio.play();
  }, [popped]);

  const handleMouseIn = () => {
    setStartImage(nstart);
    pop(true);
    sendMessage("Start", "Start");
    StartGame();
  };

  const handleMouseOut = () => {
    setStartImage(start);
    pop(false);
    setland(true);
  };

  return (
    <div
      className="menu"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Link
        to="/map"
        onMouseDown={handleMouseIn}
        onMouseUp={handleMouseOut}
        onMouseLeave={handleMouseOut}
      >
        <img
          src={startImage}
          alt="Start"
          onMouseEnter={() => setStartHighlighted(true)}
          onMouseLeave={() => setStartHighlighted(false)}
          className={startHighlighted ? "highlighted" : ""}
          onClick={handleMouseIn}
          onMouseUp={handleMouseOut}
        />
      </Link>
    </div>
  );
}

export default Menu;
