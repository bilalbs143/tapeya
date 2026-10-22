import { cn } from '@/shared/lib/cn';
import { CommentIcon } from '@/shared/ui/icons';

/** WhatsApp callout — bilingual, above the CTA. Keep out of PhoneField. */
export function WhatsAppNotice({ className }: { className?: string | undefined }) {
  return (
    <div
      className={cn('border-positive/40 bg-positive/10 flex items-start gap-2.5 rounded-panel border p-3.5', className)}
    >
      <CommentIcon size="xs" strokeWidth={2} className="text-positive-2 mt-px shrink-0" />
      <span className="flex-1">
        <span className="text-body block text-2xs leading-relaxed">
          This number must be active on <strong className="font-bold">WhatsApp</strong> — that&rsquo;s where your code
          is sent.
        </span>
        <span dir="rtl" lang="ur" className="text-muted mt-1.5 block text-2xs leading-[1.7]">
          یہ نمبر واٹس ایپ پر فعال ہونا ضروری ہے۔
        </span>
      </span>
    </div>
  );
}
