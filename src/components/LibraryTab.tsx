'use client'

import usePaletteStore from '@/store/usePaletteStore'
import { Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function LibraryTab() {
    const { palettes, deletePalette, debugPalettes } = usePaletteStore()
    const [isLoading, setIsLoading] = useState(true)

    // Simulate loading state (Zustand initialization)
    useEffect(() => {
        // Simulate Zustand's initialization delay
        const timer = setTimeout(() => setIsLoading(false), 500)
        return () => clearTimeout(timer)
    }, [])

    if (isLoading) {
        return (
            <div className="p-4">
                <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
                    Your Palettes
                </h1>
                {/* Skeleton Loading */}
                <div className="grid gap-6">
                    {[...Array(3)].map((_, index) => (
                        <div
                            key={index}
                            className="bg-neutral-200 dark:bg-neutral-800 p-4 rounded-lg shadow-md animate-pulse"
                        >
                            <div className="flex mb-3 ">
                                {[...Array(5)].map((_, idx) => (
                                    <div
                                        key={idx}
                                        className="h-12 w-full bg-neutral-300 dark:bg-neutral-700"
                                    ></div>
                                ))}
                            </div>
                            <div className="h-4 w-2/3 bg-neutral-300 dark:bg-neutral-700 rounded-md mb-2"></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6" onClick={debugPalettes}>
                Your Palettes
            </h1>
            {palettes.length === 0 ? (
                <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                    You haven't created any palettes yet.
                </p>
            ) : (
                <div className="grid gap-6">
                    {palettes.map((palette) => (
                        <div
                            key={palette.id}
                            className="bg-neutral-200 dark:bg-neutral-800 p-4 rounded-lg shadow-md"
                        >
                            {/* Palette Colors */}
                            <div className="flex mb-3">
                                {palette.colors.map((color, index) => (
                                    <div
                                        key={index}
                                        className="h-12 shadow w-full"
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    ></div>
                                ))}
                            </div>

                            {/* Palette Name and Actions */}
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                                    {palette.name || 'Untitled Palette'}
                                </p>
                                <button
                                    onClick={() => deletePalette(palette.id)}
                                    className="text-red-500 hover:text-red-600 transition-colors"
                                    title="Delete Palette"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
