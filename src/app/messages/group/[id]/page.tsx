import { notFound } from 'next/navigation'

interface GroupChatPageProps {
  params: {
    id: string
  }
}

export default async function GroupChatPage({ params }: GroupChatPageProps) {
  const { id } = await params

  // TODO: Implement group chat functionality
  const group = null

  if (!group) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-yellow-400 mb-8">
          Group Chat
        </h1>
        <p>Group chat implementation for ID: {id}</p>
        {/* Implement group chat interface */}
      </div>
    </div>
  )
}