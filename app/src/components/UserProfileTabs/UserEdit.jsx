import { useState } from 'react';

import { DatePicker } from '@/ui/DatePicker';
import {
  Dialog,
  DialogClose,
  DialogContentProfile,
  DialogSaveButton,
  DialogScrollBody,
  DialogTitle,
} from '@/ui/Dialog';
import { FormField } from '@/ui/FormField';
import { Input } from '@/ui/Input';
import { PhoneInput } from '@/ui/PhoneInput';
import {
  Select,
  SelectContent,
  selectContentInputClass,
  SelectItem,
  selectItemIndicatorInputClass,
  selectItemInputClass,
  selectItemTextInputClass,
  SelectTrigger,
  selectTriggerInputClass,
  SelectValue,
  selectViewportInputClass,
} from '@/ui/Select';

const categoryOptions = [
  { value: 'Player', label: 'Player' },
  { value: 'Coach', label: 'Coach' },
  { value: 'Umpire', label: 'Umpire' },
];

const playingRoleOptions = [
  { value: 'Batter', label: 'Batter' },
  { value: 'Bowler', label: 'Bowler' },
  { value: 'All-rounder', label: 'All-rounder' },
  { value: 'Wicket-keeper', label: 'Wicket-keeper' },
];

const battingStyleOptions = [
  { value: 'Left handed', label: 'Left handed' },
  { value: 'Right handed', label: 'Right handed' },
];

const bowlingStyleOptions = [
  { value: 'Left handed', label: 'Left handed' },
  { value: 'Right handed', label: 'Right handed' },
  { value: 'N/A', label: 'N/A' },
];

export function UserEdit({ open, onOpenChange }) {
  const [phone, setPhone] = useState('+923157118511');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [category, setCategory] = useState('Player');
  const [playingRole, setPlayingRole] = useState('Bowler');
  const [battingStyle, setBattingStyle] = useState('Left handed');
  const [bowlingStyle, setBowlingStyle] = useState('Right handed');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('Pakistan');
  const [city, setCity] = useState('Lahore, Pakistan');

  const handleSave = () => {
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContentProfile>
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex shrink-0 items-center justify-between px-5 py-4">
            <DialogTitle className="text-[16px] font-bold tracking-wide text-[#DA9811] uppercase">
              EDIT PROFILE
            </DialogTitle>
            <DialogClose
              className="rounded p-1 text-white/60 transition-colors hover:text-white focus:ring-2 focus:ring-[#FFB703] focus:outline-none"
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

          <DialogScrollBody>
            <div className="flex flex-col gap-4">
              <FormField label="Phone" htmlFor="phone" variant="edit">
                <PhoneInput
                  id="phone"
                  placeholder="Enter Phone Number"
                  value={phone}
                  onChange={setPhone}
                />
              </FormField>

              <FormField label="Date of birth" htmlFor="dob" variant="edit">
                <DatePicker
                  id="dob"
                  placeholder="MM-DD-YYYY"
                  value={dateOfBirth}
                  onChange={setDateOfBirth}
                  className="max-w-none"
                />
              </FormField>

              <FormField label="Category" htmlFor="category" variant="edit">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger
                    id="category"
                    className={`max-w-none ${selectTriggerInputClass}`}
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent
                    className={`z-[100] ${selectContentInputClass}`}
                    viewportClassName={selectViewportInputClass}
                  >
                    {categoryOptions.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className={selectItemInputClass}
                        textClassName={selectItemTextInputClass}
                        indicatorClassName={selectItemIndicatorInputClass}
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                label="Playing role"
                htmlFor="playing-role"
                variant="edit"
              >
                <Select value={playingRole} onValueChange={setPlayingRole}>
                  <SelectTrigger
                    id="playing-role"
                    className={`max-w-none ${selectTriggerInputClass}`}
                  >
                    <SelectValue placeholder="Select playing role" />
                  </SelectTrigger>
                  <SelectContent
                    className={`z-[100] ${selectContentInputClass}`}
                    viewportClassName={selectViewportInputClass}
                  >
                    {playingRoleOptions.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className={selectItemInputClass}
                        textClassName={selectItemTextInputClass}
                        indicatorClassName={selectItemIndicatorInputClass}
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                label="Batting style"
                htmlFor="batting-style"
                variant="edit"
              >
                <Select value={battingStyle} onValueChange={setBattingStyle}>
                  <SelectTrigger
                    id="batting-style"
                    className={`max-w-none ${selectTriggerInputClass}`}
                  >
                    <SelectValue placeholder="Select batting style" />
                  </SelectTrigger>
                  <SelectContent
                    className={`z-[100] ${selectContentInputClass}`}
                    viewportClassName={selectViewportInputClass}
                  >
                    {battingStyleOptions.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className={selectItemInputClass}
                        textClassName={selectItemTextInputClass}
                        indicatorClassName={selectItemIndicatorInputClass}
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                label="Bowling style"
                htmlFor="bowling-style"
                variant="edit"
              >
                <Select value={bowlingStyle} onValueChange={setBowlingStyle}>
                  <SelectTrigger
                    id="bowling-style"
                    className={`max-w-none ${selectTriggerInputClass}`}
                  >
                    <SelectValue placeholder="Select bowling style" />
                  </SelectTrigger>
                  <SelectContent
                    className={`z-[100] ${selectContentInputClass}`}
                    viewportClassName={selectViewportInputClass}
                  >
                    {bowlingStyleOptions.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className={selectItemInputClass}
                        textClassName={selectItemTextInputClass}
                        indicatorClassName={selectItemIndicatorInputClass}
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                label="Email (Optional)"
                htmlFor="email"
                variant="edit"
              >
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="max-w-none"
                />
              </FormField>

              <FormField label="Country" htmlFor="country" variant="edit">
                <Input
                  id="country"
                  type="text"
                  placeholder="Enter country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="max-w-none"
                />
              </FormField>

              <FormField label="City" htmlFor="city" variant="edit">
                <Input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="max-w-none"
                />
              </FormField>
            </div>
          </DialogScrollBody>

          <DialogSaveButton onClick={handleSave} className="shrink-0">
            Save
          </DialogSaveButton>
        </div>
      </DialogContentProfile>
    </Dialog>
  );
}
