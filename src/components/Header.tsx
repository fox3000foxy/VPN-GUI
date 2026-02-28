import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Header = () => (
  <header className="w-full flex flex-col items-center mb-2">
    <h1 className="text-3xl font-bold mb-2 flex items-center justify-center text-gray-100 drop-shadow">
      <FontAwesomeIcon icon={faGlobe} className="mr-3 text-cyan-400" />
      Country List
    </h1>
    <p className="mb-6 text-gray-300 text-lg">Select a country to use Tor with a secure local proxy.</p>
  </header>
);

export default Header;
