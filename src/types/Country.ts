export type Country = {
  name: string;
  code: string;
};

export interface CountryListProps {
  countries: Country[];
  onRestart?: () => void; // Optional callback for restarting Tor when a country is selected
}
