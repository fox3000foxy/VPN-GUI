import { faUserSecret } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';

export interface TorButtonProps {
  torRunning: boolean;
  torProgress: number;
  handleTorButton: () => Promise<void>;
  className?: string;
}

const TorButton = ({ torRunning, torProgress, handleTorButton, className }: TorButtonProps) => {
  const [text, setText] = useState('Start FoxyProxies');
  const disabled = torRunning && torProgress < 100;

  useEffect(() => {
    if (torRunning) {
      if (torProgress < 100) {
        setText('Starting...');
      } else {
        setText('Stop FoxyProxies');
      }
    } else {
      setText('Start FoxyProxies');
    }
  }, [torRunning, torProgress]);
  return (
    <button onClick={handleTorButton} className={`mt-6 px-5 py-2 rounded-lg bg-cyan-700 text-white flex items-center gap-2 hover:bg-cyan-600 transition-colors shadow-md font-semibold ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={disabled}>
      <span className='text-white text-xl align-middle'>
        <FontAwesomeIcon icon={faUserSecret} />
      </span>
      {text}
    </button>
  );
};

export default TorButton;
