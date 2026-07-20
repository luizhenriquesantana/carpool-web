import { mkdirSync, writeFileSync } from 'node:fs';

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

if (!googleMapsApiKey) {
  console.error('GOOGLE_MAPS_API_KEY is required for a production build.');
  process.exit(1);
}

const environment = `export const environment = {
  production: true,
  apiUrl: 'https://carpool-route-planning.fly.dev',
  googleClientId: 'YOUR_GOOGLE_CLIENT_ID',
  githubClientId: 'YOUR_GITHUB_CLIENT_ID',
  googleMapsApiKey: ${JSON.stringify(googleMapsApiKey)}
};
`;

mkdirSync('src/environments', { recursive: true });
writeFileSync('src/environments/environment.generated.ts', environment);
console.log('Generated production environment configuration.');
