import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import teamMatchIcon from '@/assets/images/icons/team-match-icon.svg';
import { buildMatchConfig } from './matchConfig';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { DatePicker } from '@/ui/DatePicker';
import { TimePicker } from '@/ui/TimePicker';
import {
  Dialog,
  DialogClose,
  DialogContentProfile,
  DialogScrollBody,
  DialogTitle,
} from '@/ui/Dialog';
import {
  FormField,
  formFieldLabelCheckoutClass,
} from '@/ui/FormField';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { ToggleGroup, ToggleGroupItem } from '@/ui/ToggleGroup';

const OVERS_OPTIONS = [5, 10, 15, 20, 25, 30, 40, 50];
const OVERS_DIALOG_OPTIONS = [10, 20, 30, 40, 50];
const PLAYERS_PER_SIDE_OPTIONS = [2, 3, 4, 5];

const oversInputBase =
  'flex h-12 w-full items-center rounded-[6px] bg-[#141412] px-4 py-3 text-left text-white focus:outline-none focus:ring-2 focus:ring-[#DA9811]/50 cursor-pointer';

export default function StartMatch() {
  const navigate = useNavigate();
  const [venue, setVenue] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [matchTime, setMatchTime] = useState('');
  const [format, setFormat] = useState('tournament');
  const [overs, setOvers] = useState('');
  const [playersPerSide, setPlayersPerSide] = useState('');
  const [ballType, setBallType] = useState('leather');
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null); // 'A' | 'B'
  const [teamName, setTeamName] = useState('');
  const [teamA, setTeamA] = useState({ name: '' });
  const [teamB, setTeamB] = useState({ name: '' });
  const [oversDialogOpen, setOversDialogOpen] = useState(false);
  const [wicketsDialogOpen, setWicketsDialogOpen] = useState(false);
  const [tossDialogOpen, setTossDialogOpen] = useState(false);
  const [tossWinner, setTossWinner] = useState('');
  const [tossDecision, setTossDecision] = useState('');

  const handleBack = () => navigate(-1);
  const handleOpenTeamDialog = (team) => {
    setEditingTeam(team);
    if (team === 'A') {
      setTeamName(teamA.name);
    } else {
      setTeamName(teamB.name);
    }
    setTeamDialogOpen(true);
  };
  const handleCreateTeam = () => {
    const name = teamName.trim();
    if (!name) return;
    if (editingTeam === 'A') {
      setTeamA({ name });
    } else if (editingTeam === 'B') {
      setTeamB({ name });
    }
    setTeamDialogOpen(false);
    setEditingTeam(null);
    setTeamName('');
  };
  const handleSaveFixture = () => {} // TODO: integrate with API
  const handleStartMatch = () => setTossDialogOpen(true);
  const handleStartScoring = () => {
    const match = buildMatchConfig({
      teamA,
      teamB,
      venue,
      matchDate,
      matchTime,
      format,
      overs,
      playersPerSide,
      ballType,
      tossWinner,
      tossDecision,
    });
    setTossDialogOpen(false);
    setTossWinner('');
    setTossDecision('');
    // TODO: create match via API, use returned matchId in URL
    navigate('/organizer/scoring/match/new', { state: { match } });
  };

  return (
    <div className="bg-black">
      <Container className="!px-4 !py-0">
        <header className="-mx-4 -mt-6 flex items-center gap-3 bg-black px-4 pb-6 pt-6">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-[27px] w-[27px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-[#4a4a4a] transition-opacity active:opacity-80"
            aria-label="Back"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="min-w-0 flex-1 truncate pr-[27px] text-center text-[16px] font-bold uppercase tracking-wide text-white">
            Start A Match
          </h1>
        </header>

        <div className="space-y-6 pb-8">
          {/* Team selection */}
          <div className="flex items-stretch">
            <button
              type="button"
              onClick={() => handleOpenTeamDialog('A')}
              className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-[17px] border border-[#FFFFFF0F] bg-[#141412] p-4 transition-opacity active:opacity-90"
            >
              <img src={teamMatchIcon} alt="" className="h-10 w-10 shrink-0" aria-hidden />
              <span className="text-[16px] font-bold uppercase tracking-wide text-white">
                {teamA.name || 'Team A'}
              </span>
              <span className="text-[13px] font-normal text-[#A2A6AB]">
                {teamA.name ? null : 'Create Team 1'}
              </span>
            </button>
            <div className="relative z-10 flex shrink-0 items-center -mx-3">
              <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full border-[8px] border-black bg-[#DA9811] text-[12px] font-bold uppercase tracking-wide text-[#080807]">
                VS
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleOpenTeamDialog('B')}
              className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-[17px] border border-[#FFFFFF0F] bg-[#141412] p-4 transition-opacity active:opacity-90"
            >
              <img src={teamMatchIcon} alt="" className="h-10 w-10 shrink-0" aria-hidden />
              <span className="text-[16px] font-bold uppercase tracking-wide text-white">
                {teamB.name || 'Team B'}
              </span>
              <span className="text-[13px] font-normal text-[#A2A6AB]">
                {teamB.name ? null : 'Create Team 2'}
              </span>
            </button>
          </div>

          <FormField
            htmlFor="venue"
            label="Select a venue"
            className="space-y-2"
            labelClassName={`!mb-2 ${formFieldLabelCheckoutClass}`}
          >
            <Input
              id="venue"
              placeholder="Venue name"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="!mb-0"
            />
          </FormField>

          {/* Match date and time */}
          <div className="space-y-2">
            <Label className={`!mb-2 ${formFieldLabelCheckoutClass}`}>
              Match date and time
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <DatePicker
                value={matchDate}
                onChange={setMatchDate}
                placeholder="Select date"
              />
              <TimePicker
                value={matchTime}
                onChange={setMatchTime}
                placeholder="Select time"
              />
            </div>
          </div>

          {/* Format */}
          <div className="space-y-2">
            <Label className={`!mb-2 ${formFieldLabelCheckoutClass}`}>
              Format
            </Label>
            <ToggleGroup
              type="single"
              value={format}
              onValueChange={(v) => v && setFormat(v)}
              className="flex cursor-pointer gap-2"
            >
              <ToggleGroupItem value="tournament" className="cursor-pointer" aria-label="Tournament">
                Tournament
              </ToggleGroupItem>
              <ToggleGroupItem value="club" className="cursor-pointer" aria-label="Club">
                Club
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Overs */}
          <FormField
            htmlFor="overs"
            label="Overs"
            className="space-y-2"
            labelClassName={`!mb-2 ${formFieldLabelCheckoutClass}`}
          >
            <button
              type="button"
              id="overs"
              onClick={() => setOversDialogOpen(true)}
              className={`${oversInputBase} ${!overs ? '!text-[#A2A6AB78]' : ''}`}
              aria-label="Select overs"
            >
              {overs || 'Select overs'}
            </button>
          </FormField>

          {/* Overs selection dialog */}
          <Dialog open={oversDialogOpen} onOpenChange={setOversDialogOpen}>
            <DialogContentProfile className="!h-auto !max-h-[90vh]">
              <div className="flex min-h-0 flex-1 flex-col p-5">
                <DialogTitle className="text-[14px] !font-bold uppercase tracking-wide text-[#DA9811]">
                  Select Overs
                </DialogTitle>
                <div
                  className="mt-4 flex h-12 items-center rounded-[6px] bg-[#141412] px-4 text-white"
                  aria-live="polite"
                >
                  {overs || '—'}
                </div>
                <div className="mt-4">
                  <ToggleGroup
                    type="single"
                    value={overs}
                    onValueChange={(v) => v && setOvers(v)}
                    className="flex cursor-pointer flex-wrap gap-2"
                  >
                    {OVERS_DIALOG_OPTIONS.map((n) => (
                      <ToggleGroupItem
                        key={n}
                        value={String(n)}
                        className="cursor-pointer"
                        aria-label={`${n} overs`}
                      >
                        {n}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
                <div className="mt-6">
                  <Button
                    type="button"
                    variant="orange"
                    className="w-full cursor-pointer !bg-[#DA9811] !text-[#080807]"
                    onClick={() => setOversDialogOpen(false)}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </DialogContentProfile>
          </Dialog>

          {/* Wickets / players per side */}
          <FormField
            htmlFor="players-per-side"
            label="Wickets"
            className="space-y-2"
            labelClassName={`!mb-2 ${formFieldLabelCheckoutClass}`}
          >
            <button
              type="button"
              id="players-per-side"
              onClick={() => setWicketsDialogOpen(true)}
              className={`${oversInputBase} ${!playersPerSide ? '!text-[#A2A6AB78]' : ''}`}
              aria-label="Select players per side"
            >
              {playersPerSide || 'Select players per side'}
            </button>
          </FormField>

          {/* Wickets (players per side) selection dialog */}
          <Dialog open={wicketsDialogOpen} onOpenChange={setWicketsDialogOpen}>
            <DialogContentProfile className="!h-auto !max-h-[90vh]">
              <div className="flex min-h-0 flex-1 flex-col p-5">
                <DialogTitle className="text-[14px] !font-bold uppercase tracking-wide text-[#DA9811]">
                  Select players per side
                </DialogTitle>
                <div className="mt-5 flex flex-col gap-2">
                  {PLAYERS_PER_SIDE_OPTIONS.map((n) => {
                    const isSelected = playersPerSide === String(n);
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => {
                          setPlayersPerSide(String(n));
                          setWicketsDialogOpen(false);
                        }}
                        className={`flex w-full cursor-pointer items-center rounded-full px-4 py-3 text-base text-[14px] font-medium transition-colors focus:outline-none ${
                          isSelected
                            ? 'bg-[#DA9811] text-[#080807]'
                            : 'bg-[#141412] text-white'
                        }`}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
              </div>
            </DialogContentProfile>
          </Dialog>

          {/* Ball type */}
          <div className="space-y-2">
            <Label className={`!mb-2 ${formFieldLabelCheckoutClass}`}>
              Ball type
            </Label>
            <ToggleGroup
              type="single"
              value={ballType}
              onValueChange={(v) => v && setBallType(v)}
              className="flex cursor-pointer gap-2"
            >
              <ToggleGroupItem value="leather" className="cursor-pointer" aria-label="Leather Ball">
                Leather Ball
              </ToggleGroupItem>
              <ToggleGroupItem value="tennis" className="cursor-pointer" aria-label="Tennis Ball">
                Tennis Ball
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="fixture"
              onClick={handleSaveFixture}
              className="flex-1 cursor-pointer"
            >
              Save Fixture
            </Button>
            <Button
              type="button"
              variant="orange"
              onClick={handleStartMatch}
              className="flex-1 cursor-pointer"
            >
              Start Match
            </Button>
          </div>
        </div>
      </Container>

      <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
        <DialogContentProfile className="!h-auto !max-h-[90vh]">
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex shrink-0 items-center justify-between px-5 py-4">
              <DialogTitle className="text-[14px] !font-bold uppercase tracking-wide text-[#FF9700]">
                {editingTeam === 'A' ? 'Team A' : 'Team B'}
              </DialogTitle>
              <DialogClose
                className="cursor-pointer rounded p-1 text-white/60 transition-colors hover:text-white focus:outline-none"
                aria-label="Close"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 15 15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" />
                </svg>
              </DialogClose>
            </div>

            <DialogScrollBody className="flex flex-col gap-4">
              <FormField
                htmlFor="team-name"
                label="Team name"
                labelClassName={`!mb-2 ${formFieldLabelCheckoutClass}`}
              >
                <Input
                  id="team-name"
                  placeholder="Create a team name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="!mb-0"
                />
              </FormField>
            </DialogScrollBody>

            <div className="shrink-0 px-5 pb-5 pt-2">
              <Button
                type="button"
                variant="orange"
                className="w-full cursor-pointer"
                onClick={handleCreateTeam}
              >
                Create Team
              </Button>
            </div>
          </div>
        </DialogContentProfile>
      </Dialog>

      {/* Toss dialog – shown when user clicks Start Match */}
      <Dialog open={tossDialogOpen} onOpenChange={setTossDialogOpen}>
        <DialogContentProfile className="!h-auto !max-h-[90vh]">
          <div className="flex min-h-0 flex-1 flex-col p-5">
            <DialogTitle className="text-[14px] !font-bold uppercase tracking-wide text-[#DA9811]">
              Who won the toss?
            </DialogTitle>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setTossWinner('A')}
                className={`flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-[17px] border-2 px-4 py-4 transition-colors focus:outline-none ${
                  tossWinner === 'A'
                    ? 'border-[#DA9811] bg-[#DA9811] text-white'
                    : 'border-[#141412] bg-[#141412] text-white'
                }`}
              >
                <img src={teamMatchIcon} alt="" className="h-8 w-8 shrink-0" aria-hidden />
                <span className="text-[14px] font-bold uppercase">
                  {teamA.name || 'Team A'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setTossWinner('B')}
                className={`flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-[17px] border-2 px-4 py-4 transition-colors focus:outline-none ${
                  tossWinner === 'B'
                    ? 'border-[#DA9811] bg-[#DA9811] text-white'
                    : 'border-[#141412] bg-[#141412] text-white'
                }`}
              >
                <img src={teamMatchIcon} alt="" className="h-8 w-8 shrink-0" aria-hidden />
                <span className="text-[14px] font-bold uppercase">
                  {teamB.name || 'Team B'}
                </span>
              </button>
            </div>

            <p className="mt-6 text-[14px] font-medium text-white">Decided to?</p>
            <ToggleGroup
              type="single"
              value={tossDecision}
              onValueChange={(v) => v && setTossDecision(v)}
              className="mt-2 flex cursor-pointer gap-2"
            >
              <ToggleGroupItem value="bat" className="cursor-pointer" aria-label="Bat">
                Bat
              </ToggleGroupItem>
              <ToggleGroupItem value="bowl" className="cursor-pointer" aria-label="Bowl">
                Bowl
              </ToggleGroupItem>
            </ToggleGroup>

            <div className="mt-6">
              <Button
                type="button"
                variant="orange"
                className="w-full cursor-pointer"
                onClick={handleStartScoring}
              >
                Start Scoring
              </Button>
            </div>
          </div>
        </DialogContentProfile>
      </Dialog>
    </div>
  );
}
