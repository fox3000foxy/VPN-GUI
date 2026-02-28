import { useEffect, useState } from 'react';
import { nlPort, nlToken } from '../.tmp/auth_info.json';
import CountryList from './components/CountryList';
import Footer from './components/Footer';
import Header from './components/Header';
import Logs from './components/Logs';
import SecurityIndicator from './components/SecurityIndicator';
import TorButton from './components/TorButton';
import TorProgress from './components/TorProgress';
import { fetchCountries } from './libs/countriesApi';
import { Country } from './types/Country';

function treatPercentages(log: string): { percent: number; message: string } | null {
  // Si la log n'a pas de pourcentage, on return null
  if (!/\d{1,3}%/.test(log)) {
    return null;
  }

  // Trouver le dernier pourcentage
  const percentageRegex = /(\d{1,3})%/g;
  const percentages = [...log.matchAll(percentageRegex)];
  if (percentages.length === 0) return null;
  const lastPercentage = percentages[percentages.length - 1][0];

  // Récupérer la partie après les deux points les plus à droite
  const lastColonIdx = log.lastIndexOf(':');
  if (lastColonIdx === -1) return { percent: parseInt(lastPercentage), message: '' };

  const afterColon = log.slice(lastColonIdx + 1).trim();

  // Retourner la partie après les deux points + le dernier pourcentage
  // return `${afterColon} ${lastPercentage}`;
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
    console.error('Erreur lors de la récupération de l’IP:', err);
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

  // Kill Tor process at startup
  useEffect(() => {
    async function killTorOnLoad() {
      if (Neutralino && Neutralino.os) {
        try {
          const processes = await Neutralino.os.getSpawnedProcesses();
          for (const proc of processes) {
            if (proc.id && proc.id !== 0) {
              // await Neutralino.os.updateSpawnedProcess(proc.id, '^C'); // Envoie Ctrl+C pour une terminaison propre
              await Neutralino.os.execCommand('taskkill /IM tor.exe /F');
              await Neutralino.os.execCommand('powershell -ExecutionPolicy Bypass -File proxy.ps1 -Disable');
              console.log(`Processus Tor avec PID ${proc.pid} tué au chargement.`);
            }
          }
          setTorProcessId(null);
          setTorRunning(false);

          // setLogs(prev => [...prev, 'Tous les processus Tor ont été stoppés au chargement.']);
        } catch (err) {
          console.error('Erreur lors du kill des processus Tor au chargement:', err);
          // setLogs(prev => [...prev, 'Erreur lors du kill des processus Tor au chargement.']);
        }
      }
    }
    killTorOnLoad();

    if (Neutralino) {
      try {
        window.NL_PORT = nlPort;
        window.NL_TOKEN = nlToken;
        window.NL_ARGS = [];
        Neutralino.init();
      } catch (err) {
        console.error("Erreur lors de l'initialisation de Neutralino:", err);
        setError("Erreur lors de l'initialisation de Neutralino. Assure-toi de lancer l'application via Neutralino.\n" + err);
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
        setError('Erreur lors du chargement des pays');
        setLoading(false);
      });
    console.log('Application démarrée');

    const fetchInitialIp = async () => {
      setIpLoading(true);
      const initialIp = await getIp();
      if (initialIp) {
        setIp(initialIp);
        setIpError(null);
      } else {
        setIpError('Impossible de récupérer votre IP au démarrage');
      }
      setIpLoading(false);
      setInitialIpFetched(initialIp || null);
    };
    fetchInitialIp();
  }, []);

  async function handleTorButton() {
    if (Neutralino && Neutralino.os) {
      if (!torRunning) {
        // Lancer Tor
        setLogs([]);
        try {
          setTorRunning(true);
          setTorProgress(0);
          setLastTorLog('Starting');
          const process = await Neutralino.os.spawnProcess('tor-expert-bundle\\start.bat');
          setTorProcessId(process.id);
          Neutralino.events.on('spawnedProcess', async (evt: { detail: { id: any; action: any; data: any } }) => {
            if (process.id === evt.detail.id) {
              switch (evt.detail.action) {
                case 'stdOut':
                  console.log(`Tor: ${evt.detail.data}`);
                  const treated = treatPercentages(evt.detail.data);
                  if (treated) {
                    if (treated.percent === 100) {
                      await Neutralino.os.execCommand('powershell -ExecutionPolicy Bypass -File proxy.ps1 -Enable -Host 127.0.0.1 -Port 9050');
                      // Fetch IP après activation du proxy
                      setIpLoading(true);
                      const newIp = await getIp();
                      if (newIp) {
                        setIp(newIp);
                        setIpError(null);
                      } else {
                        setIpError('Impossible de récupérer votre IP après activation de Tor');
                      }
                      setIpLoading(false);
                    }
                    setTorProgress(treated.percent);
                    setLastTorLog(treated.message);
                  }
                  break;
                case 'stdErr':
                  setLogs(prev => [...prev, `Erreur: ${evt.detail.data}`]);
                  break;
                case 'exit':
                  setTorRunning(false);
                  setTorProcessId(null);
                  setIp(initialIpFetched); // Revenir à l'IP initiale
                  setIpError(null);
                  break;
              }
            }
          });
        } catch (error: Error | any) {
          setError(`Échec du lancement de Tor : ${error.message}`);
        }
      } else if (torProcessId !== null) {
        // Stopper Tor
        try {
          await Neutralino.os.execCommand('taskkill /IM tor.exe /F');
          // Désactiver le proxy
          await Neutralino.os.execCommand('powershell -ExecutionPolicy Bypass -File proxy.ps1 -Disable');
          setTorRunning(false);
          setTorProcessId(null);
          setIp(initialIpFetched); // Revenir à l'IP initiale
          setIpError(null);
        } catch (error: Error | any) {
          setError(`Échec de l’arrêt de Tor : ${error.message}`);
          console.error('Erreur lors de l’arrêt de Tor:', error);
        }
      }
    } else {
      setError('Neutralino OS API non disponible. Lance l’application via Neutralino.');
    }
  }
  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-cyan-900 flex flex-col justify-center items-center'>
      <div className='w-full max-w-xl bg-white/5 backdrop-blur-md rounded-xl shadow-lg p-8 mt-12 mb-4 flex flex-col items-center'>
        <SecurityIndicator torRunning={torRunning} torProgress={torProgress} ip={ip} ipLoading={ipLoading} ipError={ipError} />
        <Header />
        {loading && <p className='text-gray-400'>Chargement...</p>}
        {error && <p className='text-red-500'>{error}</p>}
        {!loading && !error && <CountryList countries={countries} />}
        <TorProgress torRunning={torRunning} torProgress={torProgress} lastTorLog={lastTorLog} />
        <TorButton torRunning={torRunning} torProgress={torProgress} handleTorButton={handleTorButton} />
        <Logs logs={logs} />
      </div>
      <Footer />
    </div>
  );
}

export default App;
