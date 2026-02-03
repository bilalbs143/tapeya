import { usePlatform } from '@/hooks/usePlatform';
import { Button } from '@/ui/Button';
import { Container } from '@/ui/Container';

export default function Home() {
  const platform = usePlatform();

  return (
    <Container>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome to Tapeya
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          React + Tailwind + Capacitor — iOS, Android & Web
        </p>
        <p className="text-sm text-slate-500">
          Running on: <span className="font-medium">{platform}</span>
        </p>
        <div className="flex gap-3">
          <Button>Get Started</Button>
          <Button variant="outline">Learn More</Button>
        </div>
      </div>
    </Container>
  );
}
