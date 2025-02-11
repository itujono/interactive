'use client';

import { GalleryVerticalEnd } from 'lucide-react';

import { UserDetailsForm } from '../../components/user-details-form';
import TabSwitcher from './tab-switcher';

export default function ControlPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <TabSwitcher />
        <section className="flex flex-col items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Interactive
        </section>
        <UserDetailsForm />
      </div>
    </div>
  );
}
