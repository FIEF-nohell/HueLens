import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
    try {
        const { image } = await req.json(); // Parse the JSON body

        if (!image) {
            return NextResponse.json({ message: 'Image is required' }, { status: 400 });
        }

        // Extract the palette
        const extractedPalette = await extractPalette(image);

        return NextResponse.json({ palette: extractedPalette }, { status: 200 });
    } catch (error) {
        console.error('Error generating palette:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

async function extractPalette(base64Image: string): Promise<string[]> {
    // Decode the base64 image
    const buffer = Buffer.from(base64Image.split(',')[1], 'base64');

    // Resize image to simplify color extraction
    const { data, info } = await sharp(buffer)
        .resize(100, 100, { fit: 'inside' }) // Resize to a smaller dimension for processing
        .raw()
        .ensureAlpha()
        .toBuffer({ resolveWithObject: true });

    // Extract colors
    const colorMap = new Map<string, number>();

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Ignore very dark colors (e.g., nearly black)
        if (r < 30 && g < 30 && b < 30) continue;

        const hex = rgbToHex(r, g, b);
        colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
    }

    // Sort colors by frequency
    const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([hex]) => hex);

    // Dynamically choose between 3-5 colors based on color diversity
    const uniqueColorCount = sortedColors.length;
    const colorCount = Math.min(Math.max(3, uniqueColorCount), 5);

    return sortedColors.slice(0, colorCount);
}

// Helper function to convert RGB to HEX
function rgbToHex(r: number, g: number, b: number): string {
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;
}
