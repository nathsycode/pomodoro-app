import { FC } from "react";
import resetButtonSVG from "../assets/restart-button.svg";
import playButtonSVG from "../assets/play-button.svg";
import pauseButtonSVG from "../assets/pause-button.svg";

interface ChildProps {
  handleReset: () => void;
  handleStart: () => void;
  isActive: boolean;
}

const Controls: FC<ChildProps> = ({ handleReset, handleStart, isActive }) => {
  return (
    <div className="controls">
      <img
        id="start_stop"
        onClick={handleStart}
        src={isActive ? pauseButtonSVG : playButtonSVG}
        alt="Reset Button"
        className="logo logo--reset"
      />
      <img
        id="reset"
        onClick={handleReset}
        src={resetButtonSVG}
        alt="Reset Button"
        className="logo logo--reset"
      />
    </div>
  );
};

export default Controls;
