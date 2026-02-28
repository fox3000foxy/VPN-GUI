import { faGlobe, faUserSecret } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { nlPort, nlToken } from '../.tmp/auth_info.json';
import CountryList from './components/CountryList';
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

function App() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [torProcessId, setTorProcessId] = useState<number | null>(null);
  const [torRunning, setTorRunning] = useState(false);
  const [torProgress, setTorProgress] = useState(0);
  const [lastTorLog, setLastTorLog] = useState('');

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
  }, []);

  async function handleTorButton() {
    if (Neutralino && Neutralino.os) {
      if (!torRunning) {
        // Lancer Tor
        setLogs([]);
        try {
          const process = await Neutralino.os.spawnProcess('tor-expert-bundle\\start.bat');
          setTorProcessId(process.id);
          setTorRunning(true);
          // setLogs(prev => [...prev, `Processus Tor lancé avec ID: ${process.id}`]);
          Neutralino.events.on('spawnedProcess', (evt: { detail: { id: any; action: any; data: any } }) => {
            if (process.id === evt.detail.id) {
              switch (evt.detail.action) {
                case 'stdOut':
                  console.log(`Tor: ${evt.detail.data}`);
                  const treated = treatPercentages(evt.detail.data);
                  if (treated) {
                    // setLogs(prev => [...prev, `${treated.message} (${treated.percent}%)`]);
                    setTorProgress(treated.percent);
                    setLastTorLog(treated.message);
                  }
                  break;
                case 'stdErr':
                  setLogs(prev => [...prev, `Erreur: ${evt.detail.data}`]);
                  break;
                case 'exit':
                  // setLogs(prev => [...prev, `Processus Tor terminé (code: ${evt.detail.data})`]);
                  setTorRunning(false);
                  setTorProcessId(null);
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
          // setLogs(prev => [...prev, 'Processus Tor stoppé par l’utilisateur.']);
          setTorRunning(false);
          setTorProcessId(null);
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
    <div className='App'>
      <h1>
        <FontAwesomeIcon icon={faGlobe} style={{ marginRight: '8px' }} />
        Liste des pays
      </h1>
      {loading && <p>Chargement...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && <CountryList countries={countries} />}
      {torRunning && torProgress < 100 ? (
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: 16,
            flexDirection: 'row',
            gap: 8,
          }}>
          <meter value={torProgress} max='100' style={{ width: 260 }}></meter>
          <>{torProgress}%</>
          <span>{lastTorLog}</span>
        </span>
      ) : null}
      <button onClick={handleTorButton} style={{ marginTop: 16 }}>
        <span className='private-icon'>
          <FontAwesomeIcon icon={faUserSecret} />
        </span>
        {torRunning ? 'Arrêter TorGUI' : 'Lancer TorGUI'}
      </button>
      <div style={{ marginTop: 16, textAlign: 'left', maxWidth: 400 }}>
        {logs.map((log, idx) => (
          <div key={idx} style={{ fontSize: '0.95em' }}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
