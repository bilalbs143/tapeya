/**
 * Scoring tab – live scoring view: team/innings, score, stats, batsmen and bowlers tables.
 * Uses the same table UI as the scorecard flow (statusDetailsTabs/ScorecardTab, LiveTab).
 */
import { useState } from 'react';

import teamMatchIcon from '@/assets/images/icons/team-match-icon.svg';
import { Button } from '@/ui/Button';
import {
  Dialog,
  DialogContentProfile,
  DialogScrollBody,
  DialogTitle,
} from '@/ui/Dialog';
import { FormField, formFieldLabelEditClass } from '@/ui/FormField';
import { Input } from '@/ui/Input';

const BORDER = 'border-[#1C1C1A]';
const HEADER_BG = 'bg-[#141412]';
const DASH = '—';

/** Initial batsmen for the Select Batsman dialog (can come from API later). */
const INITIAL_BATSMEN = [
  { id: '1', name: 'Oneeb', role: 'bench' },
  { id: '2', name: 'Bilal', role: 'bench' },
  { id: '3', name: 'Sohaib', role: 'bench' },
];

/** Initial bowlers for the Select Bowler dialog (can come from API later). */
const INITIAL_BOWLERS = [
  { id: '1', name: 'Ali', role: 'bench' },
  { id: '2', name: 'Hassan', role: 'bench' },
  { id: '3', name: 'Usman', role: 'bench' },
];

export function ScoringTab() {
  const [addBatsmanOpen, setAddBatsmanOpen] = useState(false);
  const [addBatsmanView, setAddBatsmanView] = useState('select'); // 'select' | 'create'
  const [batsmen, setBatsmen] = useState(INITIAL_BATSMEN);
  const [newBatsmanName, setNewBatsmanName] = useState('');

  const [addBowlerOpen, setAddBowlerOpen] = useState(false);
  const [addBowlerView, setAddBowlerView] = useState('select'); // 'select' | 'create'
  const [bowlers, setBowlers] = useState(INITIAL_BOWLERS);
  const [newBowlerName, setNewBowlerName] = useState('');

  const openAddBatsmanDialog = () => {
    setAddBatsmanView('select');
    setAddBatsmanOpen(true);
  };

  const closeAddBatsmanDialog = () => {
    setAddBatsmanOpen(false);
    setNewBatsmanName('');
  };

  const setBatsmanRole = (id, role) => {
    setBatsmen((prev) =>
      prev.map((b) => (b.id === id ? { ...b, role } : b)),
    );
  };

  const goToCreateBatsman = () => {
    setNewBatsmanName('');
    setAddBatsmanView('create');
  };

  const handleAddNewBatsman = () => {
    const name = newBatsmanName.trim();
    if (!name) return;
    setBatsmen((prev) => [
      ...prev,
      { id: String(Date.now()), name, role: 'bench' },
    ]);
    setNewBatsmanName('');
    setAddBatsmanView('select');
  };

  const openAddBowlerDialog = () => {
    setAddBowlerView('select');
    setAddBowlerOpen(true);
  };

  const closeAddBowlerDialog = () => {
    setAddBowlerOpen(false);
    setNewBowlerName('');
  };

  const setBowlerRole = (id, role) => {
    setBowlers((prev) =>
      prev.map((b) => (b.id === id ? { ...b, role } : b)),
    );
  };

  const goToCreateBowler = () => {
    setNewBowlerName('');
    setAddBowlerView('create');
  };

  const handleAddNewBowler = () => {
    const name = newBowlerName.trim();
    if (!name) return;
    setBowlers((prev) => [
      ...prev,
      { id: String(Date.now()), name, role: 'bench' },
    ]);
    setNewBowlerName('');
    setAddBowlerView('select');
  };

  return (
    <div className="mt-4 space-y-4 pb-8">
      {/* Team name & innings – centered */}
      <div className="flex items-center justify-center gap-2">
        <img
          src={teamMatchIcon}
          alt=""
          className="h-8 w-8 shrink-0"
          aria-hidden
        />
        <span className="text-[16px] font-bold uppercase tracking-wide text-white">
          Team A
        </span>
        <span className="text-[13px] text-[#DA9811]">
          1st Innings
        </span>
      </div>

      {/* Score box – large, centered */}
      <div className="rounded-[17px] min-w-[150px] m-auto text-center bg-[#141412] px-4 py-4">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-[36px] font-bold leading-none text-white">
            0-0
          </span>
          <span className="text-[16px] font-bold text-white/90">(9)</span>
        </div>
      </div>

      {/* Match stats row – single bar with 1px gradient separators */}
      <div className="flex mt-4">
        <div className="flex flex-1 flex-col items-center justify-center px-3 py-2.5">
          <p className="text-[12px] font-bold uppercase tracking-wide text-[#A2A6AB]">
            Extras
          </p>
          <p className="mt-0.5 text-[14px] font-bold text-white">0</p>
        </div>
        <div
          className="w-px shrink-0 self-stretch bg-gradient-to-b from-[#00000000] via-[#FFFFFF66] to-[#00000000]"
          aria-hidden
        />
        <div className="flex flex-1 flex-col items-center justify-center px-3 py-2.5">
          <p className="text-[12px] font-bold uppercase tracking-wide text-[#A2A6AB]">
            Overs
          </p>
          <p className="mt-0.5 text-[14px] font-bold text-white">
            <span className="text-[#DA9811]">0.0 / 19</span>
          </p>
        </div>
        <div
          className="w-px shrink-0 self-stretch bg-gradient-to-b from-[#00000000] via-[#FFFFFF66] to-[#00000000]"
          aria-hidden
        />
        <div className="flex flex-1 flex-col items-center justify-center px-3 py-2.5">
          <p className="text-[12px] font-bold uppercase tracking-wide text-[#A2A6AB]">
            CRR
          </p>
          <p className="mt-0.5 text-[14px] font-bold text-white">0.0</p>
        </div>
        <div
          className="w-px shrink-0 self-stretch bg-gradient-to-b from-[#00000000] via-[#FFFFFF66] to-[#00000000]"
          aria-hidden
        />
        <div className="flex flex-1 flex-col items-center justify-center px-3 py-2.5">
          <p className="text-[12px] font-bold uppercase tracking-wide text-[#A2A6AB]">
            Partnership
          </p>
          <p className="mt-0.5 text-[14px] font-bold text-white">0(0)</p>
        </div>
      </div>

      {/* Batsman table – same UI as scorecard BattingScorecardTable */}
      <div className="relative overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className={HEADER_BG}>
              <th
                className={`${HEADER_BG} border-r border-b border-l px-4 py-2.5 text-left font-bold text-white ${BORDER}`}
              >
                Batsman
              </th>
              {['R', 'B', '4s', '6s', 'SR'].map((h) => (
                <th
                  key={h}
                  className={`${HEADER_BG} w-[2rem] border-r border-b py-2.5 text-center font-bold text-white ${BORDER}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={`border-r border-b border-l ${BORDER} px-4 py-3`}>
                <span className="text-[12px] font-medium text-white">{DASH}</span>
              </td>
              <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                {DASH}
              </td>
              <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                {DASH}
              </td>
              <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                {DASH}
              </td>
              <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                {DASH}
              </td>
              <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                {DASH}
              </td>
            </tr>
            <tr>
              <td className={`border-r border-b border-l ${BORDER} px-4 py-3`}>
                <span className="text-[12px] font-medium text-white">{DASH}</span>
              </td>
              <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                {DASH}
              </td>
              <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                {DASH}
              </td>
              <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                {DASH}
              </td>
              <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                {DASH}
              </td>
              <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                {DASH}
              </td>
            </tr>
          </tbody>
        </table>
        {/* Add button overlay – centered over table body */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 bottom-0 flex min-h-[5rem] items-center justify-center"
          aria-hidden
        >
          <Button
            type="button"
            variant="dark"
            size="lg"
            className="pointer-events-auto flex flex-col items-center gap-1.5"
            aria-label="Add Batsman"
            onClick={openAddBatsmanDialog}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DA9811] text-[#080807]">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </span>
            <span className="text-[13px] font-bold uppercase tracking-wide text-[#A2A6AB]">
              Add Batsman
            </span>
          </Button>
        </div>
      </div>

      {/* Bowler table – same UI as scorecard bowling tables (LiveTab / TableTab) */}
      <div className="relative overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className={HEADER_BG}>
              <th
                className={`${HEADER_BG} border-r border-b border-l px-4 py-2.5 text-left font-bold text-white ${BORDER}`}
              >
                Bowler
              </th>
              {['O', 'M', 'R', 'W', 'ECON'].map((h) => (
                <th
                  key={h}
                  className={`${HEADER_BG} ${h === 'ECON' ? 'w-14' : 'w-[2rem]'} border-r border-b py-2.5 text-center font-bold text-white ${BORDER}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={`border-r border-b border-l ${BORDER} bg-black px-4 py-3`}>
                <span className="text-[12px] font-medium text-white">{DASH}</span>
              </td>
              <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                {DASH}
              </td>
              <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                {DASH}
              </td>
              <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                {DASH}
              </td>
              <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                {DASH}
              </td>
              <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                {DASH}
              </td>
            </tr>
            <tr>
              <td className={`border-r border-b border-l ${BORDER} bg-black px-4 py-3`}>
                <span className="text-[12px] font-medium text-white">{DASH}</span>
              </td>
              <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                {DASH}
              </td>
              <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                {DASH}
              </td>
              <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                {DASH}
              </td>
              <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                {DASH}
              </td>
              <td className={`border-r border-b ${BORDER} px-4 py-3 text-center text-white`}>
                {DASH}
              </td>
            </tr>
          </tbody>
        </table>
        {/* Add button overlay – centered over table body */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 bottom-0 flex min-h-[5rem] items-center justify-center"
          aria-hidden
        >
          <Button
            type="button"
            variant="dark"
            size="lg"
            className="pointer-events-auto flex flex-col items-center gap-1.5"
            aria-label="Add Bowler"
            onClick={openAddBowlerDialog}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DA9811] text-[#080807]">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </span>
            <span className="text-[13px] font-bold uppercase tracking-wide text-[#A2A6AB]">
              Add Bowler
            </span>
          </Button>
        </div>
      </div>

      {/* Add Batsman dialog – Select Batsman | Create New Batsman */}
      <Dialog open={addBatsmanOpen} onOpenChange={(open) => !open && closeAddBatsmanDialog()}>
        <DialogContentProfile className="!h-auto !max-h-[90vh]">
          {addBatsmanView === 'select' ? (
            <>
              <div className="shrink-0 px-5 pt-5">
                <DialogTitle className="text-[14px] !font-bold uppercase tracking-wide text-[#DA9811]">
                  Select Batsman
                </DialogTitle>
              </div>
              <DialogScrollBody className="flex flex-col gap-3">
                {batsmen.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between gap-3 rounded-[10px] bg-[#141412] px-4 py-3"
                  >
                    <span className="text-[14px] font-bold text-white">
                      {b.name}
                    </span>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant={b.role === 'playing' ? 'orange' : 'black'}
                        onClick={() => setBatsmanRole(b.id, 'playing')}
                        className="text-[12px] font-bold uppercase"
                      >
                        Playing
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={b.role === 'bench' ? 'orange' : 'black'}
                        onClick={() => setBatsmanRole(b.id, 'bench')}
                        className="text-[12px] font-bold uppercase"
                      >
                        Bench
                      </Button>
                    </div>
                  </div>
                ))}
              </DialogScrollBody>
              <div className="shrink-0 px-5 pb-5 pt-2">
                <Button
                  type="button"
                  variant="orangeDialog"
                  size="dialog"
                  className="gap-2"
                  onClick={goToCreateBatsman}
                >
                  <span className="flex h-5 w-5 items-center justify-center text-[18px] leading-none">
                    +
                  </span>
                  Create New
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="shrink-0 px-5 pt-5">
                <DialogTitle className="text-[14px] !font-bold uppercase tracking-wide text-[#DA9811]">
                  Create New Batsman
                </DialogTitle>
              </div>
              <DialogScrollBody className="flex flex-col">
                <FormField
                  htmlFor="new-batsman-name"
                  label="FULL NAME"
                  className="space-y-2"
                  labelClassName={formFieldLabelEditClass}
                >
                  <Input
                    id="new-batsman-name"
                    placeholder="Enter player name"
                    value={newBatsmanName}
                    onChange={(e) => setNewBatsmanName(e.target.value)}
                    className="!mb-0"
                  />
                </FormField>
              </DialogScrollBody>
              <div className="shrink-0 px-5 pb-5 pt-4">
                <Button
                  type="button"
                  variant="orangeDialogWhite"
                  size="dialog"
                  disabled={!newBatsmanName.trim()}
                  onClick={handleAddNewBatsman}
                >
                  Add Batsman
                </Button>
              </div>
            </>
          )}
        </DialogContentProfile>
      </Dialog>

      {/* Add Bowler dialog – Select Bowler | Create New Bowler */}
      <Dialog open={addBowlerOpen} onOpenChange={(open) => !open && closeAddBowlerDialog()}>
        <DialogContentProfile className="!h-auto !max-h-[90vh]">
          {addBowlerView === 'select' ? (
            <>
              <div className="shrink-0 px-5 pt-5">
                <DialogTitle className="text-[14px] font-bold uppercase tracking-wide text-[#DA9811]">
                  Select Bowler
                </DialogTitle>
              </div>
              <DialogScrollBody className="flex flex-col gap-3">
                {bowlers.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between gap-3 rounded-[10px] bg-[#141412] px-4 py-3"
                  >
                    <span className="text-[14px] font-bold text-white">
                      {b.name}
                    </span>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant={b.role === 'playing' ? 'orange' : 'black'}
                        onClick={() => setBowlerRole(b.id, 'playing')}
                        className="text-[12px] font-bold uppercase"
                      >
                        Playing
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={b.role === 'bench' ? 'orange' : 'black'}
                        onClick={() => setBowlerRole(b.id, 'bench')}
                        className="text-[12px] font-bold uppercase"
                      >
                        Bench
                      </Button>
                    </div>
                  </div>
                ))}
              </DialogScrollBody>
              <div className="shrink-0 px-5 pb-5 pt-2">
                <Button
                  type="button"
                  variant="orangeDialog"
                  size="dialog"
                  className="gap-2"
                  onClick={goToCreateBowler}
                >
                  <span className="flex h-5 w-5 items-center justify-center text-[18px] leading-none">
                    +
                  </span>
                  Create New
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="shrink-0 px-5 pt-5">
                <DialogTitle className="text-[14px] font-bold uppercase tracking-wide text-[#DA9811]">
                  Create New Bowler
                </DialogTitle>
              </div>
              <DialogScrollBody className="flex flex-col">
                <FormField
                  htmlFor="new-bowler-name"
                  label="FULL NAME"
                  className="space-y-2"
                  labelClassName={formFieldLabelEditClass}
                >
                  <Input
                    id="new-bowler-name"
                    placeholder="Enter player name"
                    value={newBowlerName}
                    onChange={(e) => setNewBowlerName(e.target.value)}
                    className="!mb-0"
                  />
                </FormField>
              </DialogScrollBody>
              <div className="shrink-0 px-5 pb-5 pt-4">
                <Button
                  type="button"
                  variant="orangeDialogWhite"
                  size="dialog"
                  disabled={!newBowlerName.trim()}
                  onClick={handleAddNewBowler}
                >
                  Add Bowler
                </Button>
              </div>
            </>
          )}
        </DialogContentProfile>
      </Dialog>
    </div>
  );
}
