import { useNavigate } from 'react-router-dom';

import { calculateProfileStrength } from '@/lib/profileStrength';
import { useGetMeQuery } from '@/store/api/authApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';
import { closeDialog } from '@/store/slices/commonSlice';
import {
  DialogHeaderRow,
  dialogPrimaryTitleClass,
  DialogTitle,
} from '@/ui/Dialog';
import { Progress } from '@/ui/Progress';

export function ProfileStrengthReminderDialog() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userFromStore = useAppSelector(selectUser);
  const { data: meResponse } = useGetMeQuery(undefined, {
    skip: !userFromStore?.id,
  });
  const user = meResponse?.data ?? userFromStore;
  const strength = calculateProfileStrength(user);

  const goToProfile = () => {
    dispatch(closeDialog());
    navigate('/profile');
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>
          Complete your profile
        </DialogTitle>
      </DialogHeaderRow>

      <div className="flex flex-1 flex-col items-stretch justify-center px-6 py-6 text-center">
        <div className="w-full px-1">
          <Progress
            value={strength}
            max={100}
            className="!h-2 rounded-full bg-[#2B2B2B]"
            indicatorClassName="!bg-[#DA9811]"
          />
        </div>

        <p className="mt-3 text-[15px] font-bold text-white italic">
          Your profile is {strength}% complete
        </p>

        <button
          type="button"
          onClick={goToProfile}
          className="mt-6 inline-flex items-center justify-center gap-1.5 self-center text-[14px] font-semibold tracking-wide text-[#DA9811] underline decoration-[#DA9811] underline-offset-4 transition-opacity hover:opacity-90 focus:ring-2 focus:ring-[#FFB703] focus:ring-offset-2 focus:ring-offset-[#080807] focus:outline-none"
        >
          Go to Profile
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="shrink-0"
          >
            <path d="M7 17L17 7M17 7H9M17 7V15" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default ProfileStrengthReminderDialog;
