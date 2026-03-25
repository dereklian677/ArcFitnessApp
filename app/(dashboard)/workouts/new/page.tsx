import { PageHeader } from '@/components/shared/PageHeader'
import { WorkoutForm } from '@/components/workouts/WorkoutForm'

export default function NewWorkoutPage() {
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <PageHeader
        title="Log workout"
        description="Record your exercises, sets, reps, and weights"
      />
      <WorkoutForm />
    </div>
  )
}
