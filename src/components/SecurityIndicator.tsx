
interface SecurityIndicatorProps {
  torRunning: boolean;
  torProgress: number;
  ip: string | null;
  ipLoading: boolean;
  ipError: string | null;
}

const SecurityIndicator = ({ torRunning, torProgress, ip, ipLoading, ipError }: SecurityIndicatorProps) => {
  return (
    <div className="w-full flex flex-col items-center mb-4">
      <div className={`px-4 py-2 rounded-lg font-semibold text-lg flex items-center gap-2 ${torRunning && torProgress === 100 ? 'bg-green-700 text-white' : 'bg-red-700 text-white'}`}>
        {torRunning && torProgress === 100 ? 'Vous êtes en sécurité' : 'Vous n’êtes pas protégé'}
      </div>
      <div className="mt-2 text-gray-300 text-sm">
        {ipLoading ? 'Chargement de votre IP...' : ipError ? ipError : ip ? `Votre IP : ${ip}` : ''}
      </div>
    </div>
  );
};

export default SecurityIndicator;
