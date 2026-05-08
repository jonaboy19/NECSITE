import { redirect } from 'next/navigation'
// Confirm page redirects to match detail after result submission
export default async function ConfirmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/tournaments/${id}`)
}
