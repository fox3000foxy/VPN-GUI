import { Country } from "../types/Country";

export async function fetchCountries(): Promise<Country[]> {
    const res = await fetch('/data/countries.txt')
    const text = await res.text();
    const countries: Country[] = text.split('\n').map((line: string) => {
        const [name, code] = line.split('{').map((part:string) => part.trim().replace("}",''));
        return { name, code };
    })
    return countries;
}
