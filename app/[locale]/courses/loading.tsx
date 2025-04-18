import SpaceLoader from "@/components/SpaceLoader"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
      <SpaceLoader size={200} />
    </div>
  )
}