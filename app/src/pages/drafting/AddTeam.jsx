import { useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
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
    <div className="bg-black">
      <AppSubpageHeader title="Add Team" />
      <Container>
        <form onSubmit={handleSubmit} className="pb-10">
          <div className="space-y-5 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
            <FormField label="Team Name" htmlFor="team_name" required>
              <Input id="team_name" name="team_name" placeholder="Enter team name" autoComplete="off" />
            </FormField>

            <FormField label="Owner Name" htmlFor="owner_name" required>
              <Input id="owner_name" name="owner_name" placeholder="Enter owner name" autoComplete="off" />
            </FormField>

            <FormField label="Icon Player" htmlFor="icon_player" required>
              <Input id="icon_player" name="icon_player" placeholder="Enter icon player name" autoComplete="off" />
            </FormField>

            <FormField label="Upload Logo" htmlFor="team_logo_input">
              <div className="flex h-12 items-center justify-between rounded-[6px] bg-[#141412] px-4">
                <span className="truncate text-[16px]" style={{ color: '#A2A6AB78' }}>
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
          </div>

          <div className="pt-4 lg:flex lg:justify-start">
            <Button
              type="submit"
              variant="auth"
              className="h-12 w-full rounded-[8px] text-[15px] font-semibold tracking-wide uppercase lg:w-[150px]"
            >
              Submit
            </Button>
          </div>
        </form>
      </Container>
    </div>
  );
}
