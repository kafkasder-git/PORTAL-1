import dynamic from 'next/dynamic';
import { SuspenseBoundary } from '@/shared/components/ui/suspense-boundary';

// Lazy load the heavy meetings manager component
const MeetingsManagerContent = dynamic(
  () => import('@/features/meetings/components/MeetingsManager'),
  {
    loading: () => (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm text-muted-foreground">Toplantı yönetimi yükleniyor...</p>
        </div>
      </div>
    ),
  }
);

export default function MeetingsPage() {
  return <MeetingsManagerContent />;
}
