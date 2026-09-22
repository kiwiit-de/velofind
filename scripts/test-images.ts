import { imageFetcherService } from '../src/server/services/image-fetcher.service.ts';

async function run() {
  console.log('Testing image resolution for models:');
  const models = [
    { brand: 'CUBE', model: 'Stereo Hybrid 140 HPC Race 750', category: 'E_BIKE' },
    { brand: 'CUBE', model: 'Kathmandu Hybrid EXC 750', category: 'TREKKING' },
    { brand: 'Specialized', model: 'Diverge STR Expert', category: 'GRAVEL' },
    { brand: 'Specialized', model: 'Turbo Levo Comp Alloy', category: 'MTB' },
    { brand: 'Riese & Müller', model: 'Charger4 GT touring', category: 'E_BIKE' },
    { brand: 'Riese & Müller', model: 'Load 75 vario', category: 'CARGO' },
    { brand: 'Canyon', model: 'Grizl CF SL 8 1BY', category: 'GRAVEL' },
    { brand: 'Kalkhoff', model: 'Entice 5 Advance+', category: 'TREKKING' },
    { brand: 'Focus', model: 'JAM² 6.8', category: 'MTB' },
    { brand: 'Gazelle', model: 'Ultimate C380 HMB', category: 'CITY' },
  ];

  for (const m of models) {
    const img = imageFetcherService.getVerifiedModelImage(m.brand, m.model, m.category);
    console.log(`${m.brand} ${m.model} => ${img}`);
  }
}

run();
