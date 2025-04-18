'use client'

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: number
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value }) => ( 
    <div className="flex flex-col items-center">
      <div className="p-3 rounded-lg transition-colors">
        {icon}
      </div>
      <h3 className="text-base font-medium text-indigo-300 mb-1">{title}</h3>
      <p className="text-2xl font-bold tracking-tight">{value.toLocaleString()}</p>
    </div>
)

export default StatCard
