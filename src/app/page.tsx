'use client'

import { Library, Camera, Settings } from 'lucide-react'
import LibraryTab from '@/components/LibraryTab'
import { useState } from 'react'
import CameraTab from '@/components/CameraTab'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'library' | 'camera' | 'settings'>('library')

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'library':
        return <LibraryTab />
      case 'camera':
        return <CameraTab />
      case 'settings':
        return <div className="flex items-center justify-center h-full text-neutral-500">Settings (Coming Soon)</div>
      default:
        return null
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Active Tab Content */}
      <div className="flex-1 overflow-y-auto">{renderActiveTab()}</div>

      {/* Tab Bar */}
      <nav
        className="fixed bottom-0 left-0 w-full h-16 bg-neutral-100 dark:bg-neutral-800 flex justify-around items-center border-t border-neutral-200 dark:border-neutral-700 pb-safe-bottom"
      >
        <button
          onClick={() => setActiveTab('library')}
          className={`flex flex-col items-center text-sm ${activeTab === 'library' ? 'text-neutral-200' : 'text-neutral-500'
            }`}
        >
          <Library size={24} />
          <span>Library</span>
        </button>
        <button
          onClick={() => setActiveTab('camera')}
          className={`flex flex-col items-center text-sm ${activeTab === 'camera' ? 'text-neutral-200' : 'text-neutral-500'
            }`}
        >
          <Camera size={24} />
          <span>Camera</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center text-sm ${activeTab === 'settings' ? 'text-neutral-200' : 'text-neutral-500'
            }`}
        >
          <Settings size={24} />
          <span>Settings</span>
        </button>
      </nav>
    </div>
  )
}
