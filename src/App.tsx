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
import { useTor } from './hooks/useTor';
import { fetchCountries } from './libs/countriesApi';
import { getIp } from './libs/utils';
import { Country } from './types/Country';

function App() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialIpFetched, setInitialIpFetched] = useState<string | null>(null);
  const [restarting] = useState(false);

  const { torProcessId, torRunning, torProgress, lastTorLog, logs, ip, ipLoading, ipError, error, startTor, stopTor, setError, setIp, setIpError, setIpLoading } = useTor(initialIpFetched);

  // Kill Tor process at startup
  useEffect(() => {
    async function killTorOnLoad() {
      if (Neutralino && Neutralino.os) {
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
        console.error('Error during Neutralino initialization:', err);
        setError('Error during Neutralino initialization. Make sure to launch the app via Neutralino.\n' + err);
        setLoading(false);
        return;
      }
    }
    fetchCountries()
      .then(data => {
        setCountries(data);
        setLoading(false);
      })
      .catch(() => {
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
    if (!torRunning) return;
    await stopTor();
    await startTor();
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
        <div className='flex flex-row items-center w-full justify-center gap-4'>
          <TorButton torRunning={torRunning} torProgress={torProgress} handleTorButton={handleTorButton}/>
          <TorRestartButton onRestart={handleTorRestart} disabled={loading || !!error || !torRunning} />
        </div>
        <Logs logs={logs} />
      </div>
      <Footer />
    </div>
  );
}

export default App;
