import { useReducer, useEffect } from "react";
import "./App.scss";

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case ActionType.START:
      return {
        ...state,
        isActive: !state.isActive,
      };
    case ActionType.PAUSE:
      return {
        ...state,
        isActive: false,
      };
    case ActionType.RESET:
      return {
        ...defaultState,
      };
    case ActionType.UPDATE:
      return action.payload && action.payload.session === SessionType.WORK
        ? { ...state, currentTime: state.currentTime + action.payload.value }
        : action.payload && action.payload.session === SessionType.BREAK
        ? {
            ...state,
            currentBreakTime: state.currentBreakTime + action.payload.value,
          }
        : state;
    case ActionType.START_BREAK:
      return {
        ...defaultState,
        isActive: true,
        isBreak: true,
        initTime: state.initTime,
        initBreakTime: state.initBreakTime,
        currentTime: state.initTime,
        breakTime: state.initBreakTime,
      };
    case ActionType.RESTART:
      return {
        ...defaultState,
        isActive: true,
        initTime: state.initTime,
        initBreakTime: state.initBreakTime,
        currentTime: state.initTime,
        breakTime: state.initBreakTime,
      };

    case ActionType.UPDATE_DEFAULT:
      return !state.isActive &&
        action.payload &&
        action.payload.session === SessionType.WORK
        ? {
            ...state,
            initTime:
              state.initTime + action.payload.value < 60
                ? 60
                : state.initTime + action.payload.value >= 3600
                ? 3600
                : state.initTime + action.payload.value,
          }
        : !state.isActive &&
          action.payload &&
          action.payload.session === SessionType.BREAK
        ? {
            ...state,
            initBreakTime:
              state.initBreakTime + action.payload.value < 60
                ? 60
                : state.initBreakTime + action.payload.value >= 3600
                ? 3600
                : state.initBreakTime + action.payload.value,
          }
        : state;
    default:
      return state;
  }
};

export default function App() {
  const [state, dispatch] = useReducer(reducer, defaultState);
  const {
    isActive,
    isBreak,
    currentTime,
    currentBreakTime,
    initTime,
    initBreakTime,
  } = state;

  useEffect(() => {
    let interval: number;

    if (isActive) {
      interval = window.setInterval(() => {
        if (!isBreak) {
          dispatch({
            type: ActionType.UPDATE,
            payload: { value: -1, session: SessionType.WORK },
          });
        } else {
          dispatch({
            type: ActionType.UPDATE,
            payload: { value: -1, session: SessionType.BREAK },
          });
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isBreak]);

  useEffect(() => {
    if (currentTime < 0) {
      dispatch({ type: ActionType.START_BREAK });
      const audio = document.getElementById("beep") as HTMLAudioElement;
      audio.play();
    }
    if (currentBreakTime < 0) {
      dispatch({ type: ActionType.RESTART });
      const audio = document.getElementById("beep") as HTMLAudioElement;
      audio.play();
    }
  }, [currentTime, currentBreakTime]);

  useEffect(() => {
    initTime !== currentTime
      ? dispatch({
          type: ActionType.UPDATE,
          payload: { value: initTime - currentTime, session: SessionType.WORK },
        })
      : initBreakTime !== currentBreakTime
      ? dispatch({
          type: ActionType.UPDATE,
          payload: {
            value: initBreakTime - currentBreakTime,
            session: SessionType.BREAK,
          },
        })
      : "";
  }, [initTime, initBreakTime]);

  const handleReset = () => () => {
    const audio = document.getElementById("beep") as HTMLAudioElement;
    audio.pause();
    audio.currentTime = 0;
    dispatch({ type: ActionType.RESET });
  };

  return (
    <>
      <p id="timer-label">{!isBreak ? "Time To Work!" : "Take a break"}</p>
      <h1 id="time-left">
        {formatTime(!isBreak ? currentTime : currentBreakTime)}
      </h1>
      <button
        id="start_stop"
        onClick={() => dispatch({ type: ActionType.START })}
      >
        START
      </button>
      <button onClick={() => dispatch({ type: ActionType.PAUSE })}>
        PAUSE
      </button>
      <button id="reset" onClick={handleReset()}>
        RESET
      </button>
      <button
        id="session-increment"
        onClick={() =>
          dispatch({
            type: ActionType.UPDATE_DEFAULT,
            payload: { value: 60, session: SessionType.WORK },
          })
        }
      >
        +
      </button>
      <div id="session-label">
        SESSION
        <span id="session-length">{formatInitTime(state.initTime)}</span>
      </div>
      <button
        id="session-decrement"
        onClick={() =>
          dispatch({
            type: ActionType.UPDATE_DEFAULT,
            payload: { value: -60, session: SessionType.WORK },
          })
        }
      >
        -
      </button>
      <button
        id="break-increment"
        onClick={() =>
          dispatch({
            type: ActionType.UPDATE_DEFAULT,
            payload: { value: 60, session: SessionType.BREAK },
          })
        }
      >
        +
      </button>
      <div id="break-label">
        BREAK
        <span id="break-length">{formatInitTime(state.initBreakTime)}</span>
      </div>
      <button
        id="break-decrement"
        onClick={() =>
          dispatch({
            type: ActionType.UPDATE_DEFAULT,
            payload: { value: -60, session: SessionType.BREAK },
          })
        }
      >
        -
      </button>
      <audio
        id="beep"
        preload="auto"
        src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav"
      >
        Play
      </audio>
    </>
  );
}

const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, "0")} : ${seconds

    .toString()
    .padStart(2, "0")}`;
};

const formatInitTime = (time: number): number => {
  return time / 60;
};

const DEFAULT_TIME = 25; // minutes
const DEFAULT_BREAK_TIME = 5; // minutes

const defaultState = {
  isActive: false,
  isBreak: false,
  initTime: DEFAULT_TIME * 60,
  initBreakTime: DEFAULT_BREAK_TIME * 60,
  currentTime: DEFAULT_TIME * 60,
  currentBreakTime: DEFAULT_BREAK_TIME * 60,
};

interface State {
  isActive: boolean;
  isBreak: boolean;
  currentTime: number;
  currentBreakTime: number;
  initTime: number;
  initBreakTime: number;
}

interface Action {
  type: ActionType;
  payload?: { value: number; session: SessionType };
}

enum SessionType {
  WORK = "WORK",
  BREAK = "BREAK",
}

enum ActionType {
  UPDATE = "UPDATE",
  UPDATE_DEFAULT = "UPDATE_DEFAULT",
  START_BREAK = "START_BREAK",
  RESTART = "RESTART",
  START = "START",
  PAUSE = "PAUSE",
  RESET = "RESET",
}
