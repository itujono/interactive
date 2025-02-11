import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="bg-muted flex min-h-screen items-center justify-center p-24 pt-0">
      <Button asChild>
        <Link href="/control">Go to Control</Link>
      </Button>
    </main>
  );
}
