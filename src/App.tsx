import { useEffect, useState } from 'react';
// import { nlPort, nlToken } from '../.tmp/auth_info.json';
import CountryList from './components/CountryList';
import Footer from './components/Footer';
import Header from './components/Header';
import Logs from './components/Logs';
import SecurityIndicator from './components/SecurityIndicator';
import TorButton from './components/TorButton';
import TorProgress from './components/TorProgress';
import TorRestartButton from './components/TorRestartButton';
import { fetchCountries } from './libs/countriesApi';
import { Country } from './types/Country';

function treatPercentages(log: string): { percent: number; message: string } | null {
  // If the log doesn't have a percentage, return null
  if (!/\d{1,3}%/.test(log)) {
    return null;
  }

  // Find the last percentage
  const percentageRegex = /(\d{1,3})%/g;
  const percentages = [...log.matchAll(percentageRegex)];
  if (percentages.length === 0) return null;
  const lastPercentage = percentages[percentages.length - 1][0];

  // Get the part after the rightmost colon
  const lastColonIdx = log.lastIndexOf(':');
  if (lastColonIdx === -1) return { percent: parseInt(lastPercentage), message: '' };

  const afterColon = log.slice(lastColonIdx + 1).trim();

  // Return the part after the colon + the last percentage
  return {
    percent: parseInt(lastPercentage),
    message: afterColon,
  };
}

async function getIp() {
  try {
    const res = await fetch('http://ip-api.com/json');
    const data = await res.json();
    return data.query || null;
  } catch (err) {
    console.error('Error while fetching IP:', err);
    return null;
  }
}

function App() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [torProcessId, setTorProcessId] = useState<number | null>(null);
  const [torRunning, setTorRunning] = useState(false);
  const [torProgress, setTorProgress] = useState(0);
  const [lastTorLog, setLastTorLog] = useState('');
  const [ip, setIp] = useState<string | null>(null);
  const [ipLoading, setIpLoading] = useState(false);
  const [ipError, setIpError] = useState<string | null>(null);
  const [initialIpFetched, setInitialIpFetched] = useState<string | null>(null);
  const [restarting, setRestarting] = useState(false);

  // Kill Tor process at startup
  useEffect(() => {
    async function killTorOnLoad() {
      if (Neutralino && Neutralino.os) {
        // try {
        //   const processes = await Neutralino.os.getSpawnedProcesses();
        //   for (const proc of processes) {
        //     // if (proc.id && proc.id !== 0) {
        //       // await Neutralino.os.updateSpawnedProcess(proc.id, '^C'); // Sends Ctrl+C for a clean termination

        //       console.log(`Tor process with PID ${proc.pid} killed on load.`);
        //     // }
        //   }
        //   setTorProcessId(null);
        //   setTorRunning(false);

        //   // setLogs(prev => [...prev, 'All Tor processes stopped on load.']);
        // } catch (err) {
        //   console.error('Error while killing Tor processes on load:', err);
        //   // setLogs(prev => [...prev, 'Error while killing Tor processes on load.']);
        // }
        await Neutralino.os.execCommand('powershell -ExecutionPolicy Bypass -File proxy.ps1 -Disable');
        await Neutralino.os.execCommand('taskkill /IM tor.exe /F');
      }
    }
    killTorOnLoad();

    if (Neutralino) {
      try {
        // window.NL_PORT = nlPort;
        // window.NL_TOKEN = nlToken;
        window.NL_ARGS = [];
        Neutralino.init();
      } catch (err) {
        console.error("Error during Neutralino initialization:", err);
        setError("Error during Neutralino initialization. Make sure to launch the app via Neutralino.\n" + err);
        setLoading(false);
        return;
      }
    }
    fetchCountries()
      .then(data => {
        setCountries(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Error while loading countries');
        setLoading(false);
      });
    console.log('Application started');

    const fetchInitialIp = async () => {
      setIpLoading(true);
      const initialIp = await getIp();
      if (initialIp) {
        setIp(initialIp);
        setIpError(null);
      } else {
        setIpError('Unable to fetch your IP at startup');
      }
      setIpLoading(false);
      setInitialIpFetched(initialIp || null);
    };
    fetchInitialIp();
  }, []);

  async function handleTorRestart() {
    console.log('Restarting Tor with the new country selection...');
    if(!torRunning) return;
    await stopTor();
    await startTor();
  }

  async function startTor() {
    console.log('Starting Tor with the current country selection... Please wait...');
    // Start Tor
    setLogs([]);
    try {
      setTorRunning(true);
      setTorProgress(0);
      setLastTorLog('Starting');
      const process = await Neutralino.os.spawnProcess('tor-expert-bundle\\tor.exe -f tor-expert-bundle\\torcc --ExitNodes {' + localStorage.getItem('selectedCountry') + '}');
      setTorProcessId(process.id);
      Neutralino.events.on('spawnedProcess', async (evt: { detail: { id: any; action: any; data: any } }) => {
        if (process.id === evt.detail.id) {
          switch (evt.detail.action) {
            case 'stdOut':
              console.log(`Tor: ${evt.detail.data}`);
              const treated = treatPercentages(evt.detail.data);
              if (treated) {
                if (treated.percent === 100) {
                  await Neutralino.os.execCommand('powershell -ExecutionPolicy Bypass -File proxy.ps1 -Enable');
                  // Fetch IP after proxy activation
                  setIpLoading(true);
                  const newIp = await getIp();
                  if (newIp) {
                    setIp(newIp);
                    setIpError(null);
                  } else {
                    setIpError('Unable to fetch your IP after Tor activation');
                  }
                  setIpLoading(false);
                }
                setTorProgress(treated.percent);
                setLastTorLog(treated.message);
              }
              break;
            case 'stdErr':
              setLogs(prev => [...prev, `Error: ${evt.detail.data}`]);
              break;
            case 'exit':
              setTorRunning(false);
              setTorProcessId(null);
              setIp(initialIpFetched); // Revert to initial IP
              setIpError(null);
              break;
          }
        }
      });
    } catch (error: Error | any) {
      setError(`Failed to start Tor: ${error.message}`);
    }
  }

  async function stopTor() {
    // Stop Tor
    try {
      await Neutralino.os.execCommand('taskkill /IM tor.exe /F');
      // Disable proxy
      await Neutralino.os.execCommand('powershell -ExecutionPolicy Bypass -File proxy.ps1 -Disable');
      setTorRunning(false);
      setTorProcessId(null);
      setIp(initialIpFetched); // Revert to initial IP
      setIpError(null);
    } catch (error: Error | any) {
      setError(`Failed to stop Tor: ${error.message}`);
      console.error('Error while stopping Tor:', error);
    }
  }

  async function handleTorButton() {
    console.log(torRunning ? 'Stopping Tor...' : 'Starting Tor...');
    if (Neutralino && Neutralino.os) {
      if (!torRunning || restarting) {
        startTor();
      } else if (torProcessId !== null) {
        stopTor();
      }
    } else {
      setError('Neutralino OS API not available. Please launch the app via Neutralino.');
    }
  }
  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-cyan-900 flex flex-col justify-center items-center'>
      <div className='w-full max-w-xl bg-white/5 backdrop-blur-md rounded-xl shadow-lg p-8 mt-12 mb-4 flex flex-col items-center'>
        <SecurityIndicator torRunning={torRunning} torProgress={torProgress} ip={ip} ipLoading={ipLoading} ipError={ipError} />
        <Header />
        {loading && <p className='text-gray-400'>Loading...</p>}
        {error && <p className='text-red-500'>{error}</p>}
        {!loading && !error && <CountryList onRestart={handleTorRestart} countries={countries} />}
        <TorProgress torRunning={torRunning} torProgress={torProgress} lastTorLog={lastTorLog} />
        <div className="flex flex-row items-center w-full justify-center gap-4">
          <TorButton
            torRunning={torRunning}
            torProgress={torProgress}
            handleTorButton={handleTorButton}
            className="h-12 w-full"
          />
          <TorRestartButton
            onRestart={handleTorRestart}
            disabled={loading || !!error || !torRunning}
            className="h-12"
          />
        </div>
        <Logs logs={logs} />
      </div>
      <Footer />
    </div>
  );
}

export default App;