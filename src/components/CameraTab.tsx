'use client'

import { useState, useRef, useEffect } from 'react'
import usePaletteStore from '@/store/usePaletteStore'

export default function CameraTab() {
    const [image, setImage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment') // Default to rear camera
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    const { addPalette } = usePaletteStore()

    const startCamera = async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            alert('Camera not supported on this device')
            return
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode }, // Use the current facing mode (user/environment)
            })
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                videoRef.current.play()
            }
        } catch (error) {
            console.error('Error accessing camera:', error)
            alert('Unable to access camera')
        }
    }

    useEffect(() => {
        startCamera()

        return () => {
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream
                stream.getTracks().forEach((track) => track.stop())
                videoRef.current.srcObject = null
            }
        }
    }, [facingMode]) // Restart camera whenever the facing mode changes

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
        <div className="p-0 flex flex-col items-center justify-start h-full">
            {/* Camera Preview */}
            <div className="relative w-full h-[60vh] bg-black">
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                ></video>
                <canvas ref={canvasRef} className="hidden"></canvas>
                <button
                    onClick={() =>
                        setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
                    }
                    className="absolute top-4 right-4 bg-neutral-700 text-white p-2 rounded-full shadow hover:bg-neutral-600"
                >
                    Switch Camera
                </button>
            </div>

            {/* Buttons */}
            {image ? (
                <div className="relative w-full max-w-xs mt-4">
                    <img
                        src={image}
                        alt="Captured or uploaded"
                        className="w-full rounded-lg shadow-md"
                    />
                    <button
                        onClick={() => setImage(null)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow hover:bg-red-600"
                    >
                        Clear
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center w-full mt-4">
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

            {/* Generate Palette */}
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
