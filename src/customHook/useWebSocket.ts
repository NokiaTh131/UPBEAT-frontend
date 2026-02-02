import Stomp from "stompjs";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import SockJS from "sockjs-client/dist/sockjs";
import { useAppDispatch, useAppSelector } from "../customHook/store/hooks.ts";
import {
  setIsConnected,
  appendMessage,
  setStompClient,
} from "../customHook/store/Slices/webSocketSlice.ts";
import { selectWebSocket } from "../customHook/store/Slices/webSocketSlice.ts";

function useWebSocket() {
  const dispatch = useAppDispatch();
  const webSocket = useAppSelector(selectWebSocket);

  function connect(username: string) {
    try {
      const socket: WebSocket = new SockJS(import.meta.env.VITE_SOCKET);
      const stompClient: Stomp.Client = Stomp.over(socket);
      stompClient.connect(
        {},
        () => onConnected(stompClient, username),
        onError
      );
    } catch (e) {
      // Connection error handled silently
    }
  }

  function sendMessage(message: string, username: string) {
    if (webSocket.stompClient && webSocket.stompClient.connected) {
      const chatMessage = {
        sender: username,
        content: message,
        timestamp: new Date().toLocaleTimeString(),
        type: "CHAT",
      };
      webSocket.stompClient.send(
        "/app/menu.sendMessage",
        {},
        JSON.stringify(chatMessage)
      );
    }
  }

  const onConnected = (stompClient: Stomp.Client, username: string) => {
    stompClient.subscribe("/topic/menupublic", onMessageReceived);
    stompClient.subscribe("/topic/mainmenupublic", onMessageReceived);
    stompClient.send(
      "/app/menu.addUser",
      {},
      JSON.stringify({
        sender: username,
        type: "JOIN",
        timestamp: new Date().toLocaleTimeString(),
      })
    );
    dispatch(setIsConnected(true));
    dispatch(setStompClient(stompClient));
  };
  const onMessageReceived = (payload: Stomp.Message) => {
    dispatch(appendMessage(JSON.parse(payload.body)));
  };
  return { connect, sendMessage };
}

export default useWebSocket;

const onError = (_err: Stomp.Message) => {
  // WebSocket error handled silently
};
