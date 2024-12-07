'use client'

import { useState, useRef, useEffect } from 'react'
import usePaletteStore from '@/store/usePaletteStore'

export default function CameraTab() {
    const [image, setImage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    const { addPalette } = usePaletteStore()

    useEffect(() => {
        const startCamera = async () => {
            if (!navigator.mediaDevices?.getUserMedia) {
                alert('Camera not supported on this device')
                return
            }
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true })
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    videoRef.current.play()
                }
            } catch (error) {
                console.error('Error accessing camera:', error)
                alert('Unable to access camera')
            }
        }

        startCamera()

        return () => {
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream
                stream.getTracks().forEach((track) => track.stop())
                videoRef.current.srcObject = null
            }
        }
    }, [])

    const capturePhoto = () => {
        if (canvasRef.current && videoRef.current) {
            const canvas = canvasRef.current
            const context = canvas.getContext('2d')
            const video = videoRef.current
            if (context) {
                canvas.width = video.videoWidth
                canvas.height = video.videoHeight
                context.drawImage(video, 0, 0, canvas.width, canvas.height)
                const imageData = canvas.toDataURL('image/png')
                setImage(imageData)
            }
        }
    }

    const handleGalleryUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const reader = new FileReader()
            reader.onload = () => {
                if (reader.result) {
                    setImage(reader.result.toString())
                }
            }
            reader.readAsDataURL(event.target.files[0])
        }
    }

    const generatePalette = async () => {
        if (!image) return
        setIsLoading(true)

        try {
            const response = await fetch('/api/generate-palette', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image }),
            })
            if (!response.ok) {
                throw new Error('Failed to generate palette')
            }
            const data = await response.json()
            console.log(data.palette)
            addPalette(data.palette) // Save the generated palette to Zustand
        } catch (error) {
            console.error('Error generating palette:', error)
            alert('Failed to generate palette')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="p-4 flex flex-col items-center justify-center h-full">
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Capture or Upload
            </h1>
            {image ? (
                <div className="relative w-full max-w-xs">
                    <img
                        src={image}
                        alt="Captured or uploaded"
                        className="w-full rounded-lg shadow-md mb-4"
                    />
                    <button
                        onClick={() => setImage(null)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow hover:bg-red-600"
                    >
                        Clear
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center w-full">
                    <div className="relative w-full max-w-xs mb-4">
                        <video
                            ref={videoRef}
                            className="w-full h-auto rounded-lg shadow-md"
                            autoPlay
                            playsInline
                            muted
                        ></video>
                        <canvas ref={canvasRef} className="hidden"></canvas>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={capturePhoto}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
                        >
                            Capture Photo
                        </button>
                        <label
                            htmlFor="gallery-upload"
                            className="px-6 py-2 bg-neutral-700 text-white rounded-lg shadow hover:bg-neutral-600 cursor-pointer"
                        >
                            Pick from Gallery
                        </label>
                        <input
                            id="gallery-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleGalleryUpload}
                            className="hidden"
                        />
                    </div>
                </div>
            )}
            {image && (
                <button
                    onClick={generatePalette}
                    disabled={isLoading}
                    className={`px-6 py-2 rounded-lg shadow mt-4 ${isLoading
                        ? 'bg-gray-400 text-neutral-600 cursor-not-allowed'
                        : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                >
                    {isLoading ? 'Generating...' : 'Generate Palette'}
                </button>
            )}
        </div>
    )
}
