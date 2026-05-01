import { useNavigate } from 'react-router-dom';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';

export default function DraftingHome() {
  const navigate = useNavigate();

  return (
    <div className="bg-black">
      <Container className="!px-4 !py-0">
        <div className="flex min-h-[calc(100vh-144px)] flex-col">
          <AppSubpageHeader
            title="Drafting"
            bottomSpacing="relaxed"
            className="-mx-4 -mt-6 lg:mt-0"
          />

          <div className="flex flex-1 items-center justify-center">
            <Button
              type="button"
              variant="card"
              onClick={() => navigate('/drafting/add-team')}
              className="flex h-[120px] w-[158px] flex-col items-center justify-center gap-3 rounded-[18px] !bg-[#141412] px-0 py-0"
            >
              <span className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#DA9811] text-[32px] font-bold text-[#080807]">
                +
              </span>
              <span className="text-[16px] font-bold text-[#A2A6AB]">
                Create Teams
              </span>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
