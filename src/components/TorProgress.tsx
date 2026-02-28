interface TorProgressProps {
  torRunning: boolean;
  torProgress: number;
  lastTorLog: string;
}

const TorProgress = ({ torRunning, torProgress, lastTorLog }: TorProgressProps) => {
  if (!torRunning || torProgress >= 100) return null;
  return (
    <span className="flex items-center mt-4 flex-row gap-2">
      <meter value={torProgress} max="100" className="w-[260px]" />
      <span className="text-cyan-400 font-semibold">{torProgress}%</span>
      <span className="text-gray-300">{lastTorLog}</span>
    </span>
  );
};

export default TorProgress;
