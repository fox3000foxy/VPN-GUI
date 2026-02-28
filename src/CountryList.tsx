import React from 'react';
import { CountryListProps } from './types/Country';

const CountryList: React.FC<CountryListProps> = ({ countries }) => {
  const [country, setCountry] = React.useState<string>(() => {
    return localStorage.getItem('selectedCountry') || '';
  });

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
      {countries.map(country => (
        <option key={country.code} value={country.code}>
          {country.name}
        </option>
      ))}
    </select>
  );
};

export default CountryList;
