'use client';

import { SparklesIcon, TvIcon } from 'lucide-react';

import { Tabs } from '@/components/tabs';

type Props = {};

export default function TabSwitcher({}: Props) {
  return (
    <Tabs
      className="self-center flex"
      tabs={[
        { label: 'Space', value: 'space', icon: SparklesIcon },
        { label: 'Laser Beams', value: 'laser-beams', icon: TvIcon },
      ]}
    />
  );
}
