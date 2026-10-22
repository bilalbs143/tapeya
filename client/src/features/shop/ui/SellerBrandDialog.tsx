import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  BaseDialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/dialogs/BaseDialog';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Form } from '@/shared/ui/Form';
import { Input } from '@/shared/ui/Input';
import { toast } from '@/shared/ui/toast';

import { useCreateVendorBrandMutation, useUpdateVendorBrandMutation } from '../api/vendorShopApi';
import type { ShopBrand } from '../model/schemas';

const LOGO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const LOGO_MAX_MB = 2;

type SellerBrandDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: ShopBrand | null | undefined;
  canEdit?: boolean | undefined;
};

/** Add / edit brand sheet — name + optional logo (FormData when file present). */

export function SellerBrandDialog({ open, onOpenChange, brand = null, canEdit = true }: SellerBrandDialogProps) {
  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      contentClassName="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0"
    >
      {open ? (
        <BrandDialogBody key={brand?.id ?? 'new'} brand={brand} canEdit={canEdit} onOpenChange={onOpenChange} />
      ) : null}
    </BaseDialog>
  );
}

function BrandDialogBody({
  brand,
  canEdit,
  onOpenChange,
}: {
  brand: ShopBrand | null;
  canEdit: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = Boolean(brand?.id);
  const [createBrand, createState] = useCreateVendorBrandMutation();
  const [updateBrand, updateState] = useUpdateVendorBrandMutation();
  const busy = createState.isLoading || updateState.isLoading;

  const [name, setName] = useState(brand?.name ?? '');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [clearedExisting, setClearedExisting] = useState(false);
  const logoInput = useRef<HTMLInputElement>(null);

  const existingLogo = !clearedExisting && !logoFile ? (brand?.logoUrl ?? null) : null;
  const logoPreview = useMemo(() => (logoFile ? URL.createObjectURL(logoFile) : null), [logoFile]);

  useEffect(() => {
    if (!logoPreview) return undefined;
    return () => URL.revokeObjectURL(logoPreview);
  }, [logoPreview]);

  function onLogoPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!(LOGO_TYPES as readonly string[]).includes(file.type)) {
      setLogoError('Logo must be JPG, PNG or WebP.');
      return;
    }
    if (file.size > LOGO_MAX_MB * 1024 * 1024) {
      setLogoError(`Logo must be under ${LOGO_MAX_MB} MB.`);
      return;
    }
    setLogoError(null);
    setClearedExisting(true);
    setLogoFile(file);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit || busy) return;
    if (!name.trim()) {
      setNameError('Name is required.');
      return;
    }
    setNameError(null);

    try {
      let body: { name: string } | FormData = { name: name.trim() };
      if (logoFile) {
        const fd = new FormData();
        fd.append('name', name.trim());
        fd.append('logo', logoFile);
        body = fd;
      }

      if (isEdit && brand) {
        await updateBrand({ id: brand.id, body }).unwrap();
        toast({ title: 'Brand Updated', tone: 'success' });
      } else {
        await createBrand(body).unwrap();
        toast({ title: 'Brand Created', tone: 'success' });
      }
      onOpenChange(false);
    } catch (err) {
      toast({
        title: getApiErrorMessage(err, isEdit ? 'Could not update brand.' : 'Could not create brand.'),
        tone: 'error',
      });
    }
  }

  const preview = logoPreview ?? existingLogo;

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Brand' : 'Add Brand'}</DialogTitle>
        <DialogDescription className="font-mono text-dim text-3xs font-medium tracking-eyebrow uppercase">
          Shown on your product listings
        </DialogDescription>
      </DialogHeader>

      <DialogBody className="min-h-0 flex-1 overflow-y-auto">
        <Form id="seller-brand-form" density="compact" onSubmit={(ev) => void onSubmit(ev)}>
          <Input
            label="Name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameError(null);
            }}
            error={nameError ?? undefined}
            disabled={!canEdit}
            placeholder="CA Sports"
            className="h-12 rounded-field"
          />

          <Field
            label="Logo"
            error={logoError ?? undefined}
            hint={logoError ? undefined : 'JPG, PNG or WebP, max 2 MB.'}
          >
            {({ id }) => (
              <div className="flex items-center gap-3">
                <span className="bg-surface-raised border-border-subtle flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-panel border">
                  {preview ? (
                    <img src={preview} alt="" className="h-full w-full object-contain p-1" />
                  ) : (
                    <span className="text-dim font-mono text-4xs font-bold">LOGO</span>
                  )}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  {canEdit ? (
                    <>
                      <button
                        type="button"
                        id={id}
                        onClick={() => logoInput.current?.click()}
                        className="text-brand-text self-start text-2xs font-bold"
                      >
                        {preview ? 'Replace Logo' : 'Upload Logo'}
                      </button>
                      {preview ? (
                        <button
                          type="button"
                          onClick={() => {
                            setLogoFile(null);
                            setClearedExisting(true);
                            setLogoError(null);
                          }}
                          className="text-dim self-start text-3xs font-semibold"
                        >
                          Remove
                        </button>
                      ) : null}
                    </>
                  ) : (
                    <span className="text-dim text-3xs">On file.</span>
                  )}
                </div>
                <input
                  ref={logoInput}
                  type="file"
                  accept={LOGO_TYPES.join(',')}
                  onChange={onLogoPick}
                  className="hidden"
                />
              </div>
            )}
          </Field>
        </Form>
      </DialogBody>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="secondary" size="md" disabled={busy}>
            Cancel
          </Button>
        </DialogClose>
        {canEdit ? (
          <Button type="submit" form="seller-brand-form" size="md" loading={busy}>
            {isEdit ? 'Save Brand' : 'Add Brand'}
          </Button>
        ) : null}
      </DialogFooter>
    </>
  );
}
