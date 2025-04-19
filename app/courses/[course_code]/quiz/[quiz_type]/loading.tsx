import SpaceLoader from '@/components/SpaceLoader';

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <SpaceLoader size={200} />
    </div>
  );
}
