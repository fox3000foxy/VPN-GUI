import React from 'react';
import { CountryListProps } from '../types/Country';

const CountryList: React.FC<CountryListProps> = ({ countries }) => {
  const [country, setCountry] = React.useState<string>(() => {
    return localStorage.getItem('selectedCountry') || '';
  });

  // To prevent Encountered two children with the same key message, we can keep track of used country codes and skip duplicates
  const usedCountries: string[] = []

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountry(e.target.value);
    localStorage.setItem('selectedCountry', e.target.value);
  };

  return (
    <select
      style={{ width: '100%', padding: '8px', fontSize: '1em' }}
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
