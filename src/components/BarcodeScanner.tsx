'use client';
import { useEffect, useRef } from 'react'

interface BarcodeDetectorResult {
    rawValue: string
}

interface BarcodeDetector {
    detect(video: HTMLVideoElement): Promise<BarcodeDetectorResult[]>
}

interface BarcodeDetectorConstructor {
    new(options?: { formats?: string[] }): BarcodeDetector
}

declare global {
    interface Window {
        BarcodeDetector: BarcodeDetectorConstructor
    }
}

interface Props {
    onDetected: (code: string) => void
    onClose: () => void
}

export default function BarcodeScanner({ onDetected, onClose }: Props) {
    const videoRef = useRef<HTMLVideoElement | null>(null)

    useEffect(() => {
        let stream: MediaStream
        let scanning = true

        const start = async () => {
            if (!("BarcodeDetector" in window)) {
                console.error('BarcodeDetector not supported')
                onClose()
                return
            }

            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                })

                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    await videoRef.current.play()
                    const detector = new window.BarcodeDetector({
                        formats: ['ean_13', 'ean_8', 'code_128', 'upc_a']
                    })

                    const scan = async () => {
                        if (!scanning) return
                        if (videoRef.current) {
                            try {
                                const codes = await detector.detect(videoRef.current)
                                if (codes.length) {
                                    onDetected(codes[0].rawValue)
                                    scanning = false
                                    stream.getTracks().forEach(t => t.stop())
                                    return
                                }
                            } catch {
                                // ignore errors and continue scanning
                            }
                        }
                        requestAnimationFrame(scan)
                    }

                    scan()
                }
            } catch (err) {
                console.error(err)
                onClose()
            }
        }

        start()

        return () => {
            scanning = false
            stream?.getTracks().forEach(t => t.stop())
        }
    }, [onDetected, onClose])

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
            <div className="relative w-full max-w-sm">
                <video ref={videoRef} className="w-full h-auto rounded-md" />
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center"
                >
                    ✕
                </button>
            </div>
        </div>
    )
}
