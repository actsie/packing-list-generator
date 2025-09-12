import { TripPage } from '@/components/trip-page'

interface TripPageProps {
  params: {
    id: string
  }
}

export default function Page({ params }: TripPageProps) {
  return <TripPage tripId={params.id} />
}