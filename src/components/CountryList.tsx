import React from 'react';
import { CountryListProps } from '../types/Country';

const CountryList: React.FC<CountryListProps> = ({ countries, onRestart }) => {
  const [country, setCountry] = React.useState<string>(() => {
    return localStorage.getItem('selectedCountry') || '';
  });

  // To prevent Encountered two children with the same key message, we can keep track of used country codes and skip duplicates
  const usedCountries: string[] = []

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountry(e.target.value);
    localStorage.setItem('selectedCountry', e.target.value);
    if (onRestart) {
      onRestart();
    }
  };

  return (
    <select
      className="w-full p-2 text-base rounded-lg border border-gray-400 bg-gray-900 text-gray-100 focus:outline-none focus:border-cyan-500 transition-colors"
      value={country}
      onChange={handleChange}
    >
    {countries.map(country => {
      if (usedCountries.includes(country.code)) {
        return null; // Skip duplicates
      }
      usedCountries.push(country.code);
      return (
        <option key={country.code} value={country.code}>
          {country.name}
        </option>
      )})}
    </select>
  );
};

export default CountryList;
