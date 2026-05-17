import { useNavigate } from 'react-router-dom';

import { useDialog } from '@/context/DialogContext';
import { calculateProfileStrength } from '@/lib/profileStrength';
import { useGetMeQuery } from '@/store/api/authApi';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';
import { DialogHeaderRow, dialogPrimaryTitleClass, DialogSaveButton, DialogScrollBody, DialogTitle } from '@/ui/Dialog';
import { Progress } from '@/ui/Progress';

export function ProfileStrengthReminderDialog() {
  const { closeDialog } = useDialog();
  const navigate = useNavigate();
  const userFromStore = useAppSelector(selectUser);
  const { data: meResponse } = useGetMeQuery(undefined, {
    skip: !userFromStore?.id,
  });
  const user = meResponse?.data ?? userFromStore;
  const strength = calculateProfileStrength(user);

  const goToProfile = () => {
    closeDialog();
    navigate('/profile');
  };

  return (
    <>
      <DialogHeaderRow>
        <DialogTitle className={dialogPrimaryTitleClass}>Complete your profile</DialogTitle>
      </DialogHeaderRow>

      <DialogScrollBody className="flex flex-col items-stretch justify-center text-center">
        <div className="w-full px-1">
          <Progress value={strength} max={100} className="!h-2 rounded-full bg-[#2B2B2B]" indicatorClassName="!bg-[#DA9811]" />
        </div>

        <p className="mt-3 text-[15px] font-bold text-white italic">Your profile is {strength}% complete</p>
      </DialogScrollBody>

      <DialogSaveButton onClick={goToProfile}>Go to Profile</DialogSaveButton>
    </>
  );
}

export default ProfileStrengthReminderDialog;
