import { faRedo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface TorRestartButtonProps {
  onRestart: () => void;
  disabled?: boolean;
}

const TorRestartButton = ({ onRestart, disabled }: TorRestartButtonProps) => {
  return (
    <button
      onClick={onRestart}
      className={`mt-6 px-5 py-2 rounded-lg bg-gray-700 text-white flex items-center gap-2 hover:bg-gray-600 transition-colors shadow-md font-semibold ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      disabled={disabled}
      title="Restart Tor with new country"
      style={{ width: "auto", marginTop: 24 }}
    >
      <span className="text-white text-xl align-middle">
        <FontAwesomeIcon icon={faRedo} />
      </span>
      {/* Redémarrer */}
    </button>
  );
};

export default TorRestartButton;
