import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Tournament } from '../model/schemas';
import { TournamentCard } from './TournamentCard';

const tournament: Tournament = {
  id: 1,
  name: 'Ramzan Cup',
  shortName: 'RC',
  type: 'open_tournament',
  city: 'Karachi',
  startDate: '2026-03-01',
  endDate: '2026-03-30',
  coverImage: null,
  teamsCount: 4,
  matchesCount: 2,
  teamCap: 8,
  groupCount: null,
  country: 'Pakistan',
  status: 'active',
  statusLabel: 'Active',
  venueName: 'Gulshan Ground',
  prize: 'PKR 100,000',
  champion: null,
  hubSection: 'needsYou',
  canManage: true,
  likesCount: 0,
  dislikesCount: 0,
  sharesCount: 0,
  myReaction: null,
  interestCampaignSlug: null,
};

describe('TournamentCard', () => {
  it('renders setup card with capacity and next action', () => {
    render(
      <MemoryRouter>
        <TournamentCard tournament={tournament} />
      </MemoryRouter>
    );

    expect(screen.getByText('Ramzan Cup')).toBeInTheDocument();
    expect(screen.getByText('4/8')).toBeInTheDocument();
    expect(screen.getByText(/Add 4 more team/)).toBeInTheDocument();
  });

  it('renders previous card with public link', () => {
    render(
      <MemoryRouter>
        <TournamentCard
          tournament={{
            ...tournament,
            status: 'inactive',
            hubSection: 'previous',
            champion: 'Karachi Kings',
          }}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Karachi Kings')).toBeInTheDocument();
    expect(screen.getByText('CHAMPIONS')).toBeInTheDocument();
  });
});
