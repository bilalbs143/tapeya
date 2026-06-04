import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { EMPTY_FILE_UPLOAD } from '@/lib/utils/fileUploadUtils';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';
import { FileUploadField } from '@/ui/FileUploadField';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';

export default function AddTeam() {
  const navigate = useNavigate();
  const [logoUpload, setLogoUpload] = useState(EMPTY_FILE_UPLOAD);

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
              <Input id="team_name" name="team_name" placeholder="Enter Team Name" autoComplete="off" />
            </FormField>

            <FormField label="Owner Name" htmlFor="owner_name" required>
              <Input id="owner_name" name="owner_name" placeholder="Enter Owner Name" autoComplete="off" />
            </FormField>

            <FormField label="Icon Player" htmlFor="icon_player" required>
              <Input id="icon_player" name="icon_player" placeholder="Enter Icon Player Name" autoComplete="off" />
            </FormField>

            <FileUploadField
              label="Upload Logo"
              variant="compact"
              value={logoUpload}
              onChange={setLogoUpload}
              accept="image/jpeg,image/png,image/webp,image/gif"
              acceptLabel="JPG, PNG, WebP"
              maxSizeMb={5}
            />
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
