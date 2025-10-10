'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ChatSettingsPage() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState({
    notifications: true,
    sound: true,
    readReceipts: true
  })

  const handleSave = async () => {
    // TODO: Save chat settings
    console.log('Saving settings:', settings)
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Please log in to access settings.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <Card className="border-yellow-400/20 bg-black/40 backdrop-blur-sm max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-yellow-400 text-2xl">
              Chat Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-300 font-semibold">Notifications</h3>
                <p className="text-gray-400 text-sm">Receive message notifications</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                className="rounded border-yellow-400/30 bg-black/50 text-yellow-400"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-300 font-semibold">Sound</h3>
                <p className="text-gray-400 text-sm">Play sound for new messages</p>
              </div>
              <input
                type="checkbox"
                checked={settings.sound}
                onChange={(e) => setSettings({...settings, sound: e.target.checked})}
                className="rounded border-yellow-400/30 bg-black/50 text-yellow-400"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-300 font-semibold">Read Receipts</h3>
                <p className="text-gray-400 text-sm">Send read receipts</p>
              </div>
              <input
                type="checkbox"
                checked={settings.readReceipts}
                onChange={(e) => setSettings({...settings, readReceipts: e.target.checked})}
                className="rounded border-yellow-400/30 bg-black/50 text-yellow-400"
              />
            </div>

            <Button
              onClick={handleSave}
              className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
            >
              Save Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}