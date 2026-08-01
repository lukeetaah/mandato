import type { MediaOutlet, SocialMediaState } from './types';

export function createInitialMedia(): MediaOutlet[] {
  return [
    {
      id: 'media-la-nacion-sur',
      name: 'El Sur Diario',
      type: 'portal',
      credibility: 75,
      editorialLine: {
        economy: 40,
        stateSize: -20,
        security: 30,
        education: 10,
        environment: -10,
        trade: 40,
        industry: 10,
        liberties: 10,
        federalism: -20,
        foreignRelations: 30,
        technology: 20,
        health: 0,
        culture: -10,
      },
      ownerActorId: 'actor-media-mogul',
      interests: ['mercados libres', 'orden institucional'],
      finances: 80,
      audience: 70,
      fatigue: 10,
      dispositionToPlayer: 0,
    },
    {
      id: 'media-canal-nacional',
      name: 'Canal 11 Red Federal',
      type: 'tv',
      credibility: 60,
      editorialLine: {
        economy: -30,
        stateSize: 40,
        security: -10,
        education: 30,
        environment: 10,
        trade: -30,
        industry: 30,
        liberties: 0,
        federalism: 40,
        foreignRelations: -20,
        technology: 10,
        health: 40,
        culture: 10,
      },
      ownerActorId: null,
      interests: ['pauta oficial', 'audiencia masiva'],
      finances: 50,
      audience: 85,
      fatigue: 20,
      dispositionToPlayer: 10,
    },
  ];
}

export function createInitialSocialMedia(): SocialMediaState {
  return {
    trending: ['#RepúblicaDelSur', '#PresupuestoNacional', '#GobernadoresEnAlerta'],
    playerSentiment: 5,
    botActivity: 15,
    fakeNewsLevel: 25,
    memeAboutPlayer: false,
    viralEvent: null,
    cancellationRisk: 10,
  };
}
