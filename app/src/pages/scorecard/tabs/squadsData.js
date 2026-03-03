/**
 * Mock squad data - replace with API later.
 */
import karachiFlag from '@/assets/images/icons/karachi-flag.png';

const TEAM_LOGO = karachiFlag;

export const MOCK_SQUADS = [
  {
    id: 'rcb-w',
    teamName: 'RCB-W',
    lastUpdated: '31-Dec-2025',
    logo: TEAM_LOGO,
    players: [
      { id: '1', name: 'Aaron George', role: 'Top-order Batter' },
      { id: '2', name: 'Alex Carey', role: 'Wicketkeeper Batter' },
      { id: '3', name: 'Andre Russell', role: 'Batting Allrounder' },
      { id: '4', name: 'Aiden Markram', role: 'Top-order Batter' },
      { id: '5', name: 'Ben Stokes', role: 'Batting Allrounder' },
      { id: '6', name: 'Chris Woakes', role: 'Bowling Allrounder' },
      { id: '7', name: 'David Warner', role: 'Opening Batter' },
      { id: '8', name: 'Glenn Maxwell', role: 'Batting Allrounder' },
    ],
  },
  {
    id: 'gg-w',
    teamName: 'GG-W',
    lastUpdated: '31-Dec-2025',
    logo: TEAM_LOGO,
    players: [
      { id: '11', name: 'Sophie Devine', role: 'Batting Allrounder' },
      { id: '12', name: 'Beth Mooney', role: 'Wicketkeeper Batter' },
      { id: '13', name: 'Ash Gardner', role: 'Batting Allrounder' },
      { id: '14', name: 'Laura Wolvaardt', role: 'Top-order Batter' },
      { id: '15', name: 'Marizanne Kapp', role: 'Bowling Allrounder' },
      { id: '16', name: 'Deepti Sharma', role: 'Bowling Allrounder' },
      { id: '17', name: 'Shafali Verma', role: 'Opening Batter' },
      { id: '18', name: 'Jemimah Rodrigues', role: 'Top-order Batter' },
    ],
  },
  {
    id: 'mi-w',
    teamName: 'MI-W',
    lastUpdated: '31-Dec-2025',
    logo: TEAM_LOGO,
    players: [
      { id: '21', name: 'Hayley Matthews', role: 'Batting Allrounder' },
      { id: '22', name: 'Nat Sciver-Brunt', role: 'Batting Allrounder' },
      { id: '23', name: 'Amelia Kerr', role: 'Bowling Allrounder' },
      { id: '24', name: 'Harmanpreet Kaur', role: 'Middle-order Batter' },
      { id: '25', name: 'Pooja Vastrakar', role: 'Bowling Allrounder' },
      { id: '26', name: 'Yastika Bhatia', role: 'Wicketkeeper Batter' },
      { id: '27', name: 'Issy Wong', role: 'Bowler' },
      { id: '28', name: 'Saika Ishaque', role: 'Bowler' },
    ],
  },
];

export function getSquadByTeamId(teamId) {
  if (!teamId) return null;
  const id = String(teamId).toLowerCase();
  return (
    MOCK_SQUADS.find((s) => s.id === id || s.teamName.toLowerCase() === id) ??
    null
  );
}
