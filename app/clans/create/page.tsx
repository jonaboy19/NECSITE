'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CreateClan() {
  const supabase = createClient()
  const [name, setName] = useState('')

  const handleCreate = async () => {
    const { data: user } = await supabase.auth.getUser()

    if (!user?.user) return alert('Not logged in')

    await supabase.from('clans').insert({
      name,
      slug: name.toLowerCase().replace(/ /g, '-'),
      owner_id: user.user.id,
    })

    alert('Clan created')
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create Clan</h1>
      <input
        className="bg-black p-2 border"
        placeholder="Clan Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleCreate} className="ml-2 bg-cyan-500 px-4 py-2">
        Create
      </button>
    </div>
  )
}