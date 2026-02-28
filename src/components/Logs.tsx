interface LogsProps {
  logs: string[];
}

const Logs = ({ logs }: LogsProps) => (
  <div className="mt-6 text-left w-full max-w-md">
    {logs.map((log, idx) => (
      <div key={idx} className="text-[0.95em] text-gray-300">
        {log}
      </div>
    ))}
  </div>
);

export default Logs;
