import { useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';

import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';

export default function AddTeam() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [logoName, setLogoName] = useState('No file selected');

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setLogoName(file ? file.name : 'No file selected');
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    const newTeam = {
      id: `new-${Date.now()}`,
      name: form.team_name?.value?.trim() || '',
      owner: form.owner_name?.value?.trim() || '',
      iconPlayer: form.icon_player?.value?.trim() || '',
    };
    // TODO: Integrate API for creating team when backend is ready.
    navigate('/drafting/teams', { state: { newTeam } });
  };

  return (
    <div className="min-h-screen bg-black">
      <Container className="!px-4 !py-0">
        <header className="-mx-4 -mt-6 flex items-center gap-3 bg-black px-4 pt-6 pb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full bg-white text-[#4a4a4a] transition-opacity active:opacity-80"
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
          <h1 className="min-w-0 flex-1 pr-[27px] text-center text-[16px] font-bold tracking-wide text-white uppercase">
            Drafting
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 pb-10">
          <FormField label="Team Name" htmlFor="team_name" required>
            <Input
              id="team_name"
              name="team_name"
              placeholder="Enter team name"
              autoComplete="off"
            />
          </FormField>

          <FormField label="Owner Name" htmlFor="owner_name" required>
            <Input
              id="owner_name"
              name="owner_name"
              placeholder="Enter owner name"
              autoComplete="off"
            />
          </FormField>

          <FormField label="Icon Player" htmlFor="icon_player" required>
            <Input
              id="icon_player"
              name="icon_player"
              placeholder="Enter icon player name"
              autoComplete="off"
            />
          </FormField>

          <FormField label="Upload Logo" htmlFor="team_logo_input">
            <div className="flex h-12 items-center justify-between rounded-[6px] bg-[#141412] px-4">
              <span
                className="truncate text-[16px]"
                style={{ color: '#A2A6AB78' }}
              >
                {logoName}
              </span>
              <div className="shrink-0">
                <input
                  ref={fileInputRef}
                  id="team_logo_input"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileChange}
                  aria-label="Upload team logo"
                />
                <Button
                  type="button"
                  variant="file"
                  size="sm"
                  className="h-8 rounded-[6px] px-2 text-[12px] font-semibold tracking-wide"
                  onClick={handleAttachClick}
                >
                  Attach file
                </Button>
              </div>
            </div>
          </FormField>

          <div className="pt-4">
            <Button
              type="submit"
              variant="auth"
              className="h-12 w-full rounded-[8px] text-[15px] font-semibold uppercase tracking-wide"
            >
              Submit
            </Button>
          </div>
        </form>
      </Container>
    </div>
  );
}

