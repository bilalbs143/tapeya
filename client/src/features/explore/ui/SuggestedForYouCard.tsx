import { Link } from 'react-router-dom';

import { SectionLabel } from '@/shared/layout';
import { cn } from '@/shared/lib/cn';
import { Card } from '@/shared/ui/Card';

import type { SuggestedUser } from '../model/schemas';
import { exploreRoutes } from '../routes';
import { SuggestedUserRow } from './SuggestedUserRow';

type SuggestedForYouCardProps = {
  users: SuggestedUser[];
  title?: string;
  showViewMore?: boolean;
  className?: string;
};

/** Desktop “Suggested for you” card. */
export function SuggestedForYouCard({
  users,
  title = 'Suggested for You',
  showViewMore = true,
  className,
}: SuggestedForYouCardProps) {
  if (!users.length) return null;

  return (
    <Card className={cn('p-3.5', className)}>
      <SectionLabel
        as="h2"
        action={
          showViewMore ? (
            <Link to={exploreRoutes.discover()} className="text-brand-text text-3xs font-bold">
              View More
            </Link>
          ) : null
        }
      >
        {title}
      </SectionLabel>
      <ul className="flex flex-col gap-2.5">
        {users.map((user) => (
          <SuggestedUserRow key={user.id} user={user} />
        ))}
      </ul>
    </Card>
  );
}
