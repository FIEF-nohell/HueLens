import { persist } from "zustand/middleware";
import { create } from "zustand";

interface PaletteState {
    palettes: { id: string; colors: string[]; name?: string }[];
    image: string | null;
    palette: string[];
    setImage: (image: string | null) => void;
    setPalette: (palette: string[]) => void;
    addPalette: (colors: string[]) => void;
    debugPalettes: () => void;
    updatePalette: (id: string, updatedPalette: { colors?: string[]; name?: string }) => void;
    deletePalette: (id: string) => void;
    clearPalettes: () => void;
}

function generateRandomHexColors(amount: number): string[] {
    const colors: string[] = [];
    for (let i = 0; i < amount; i++) {
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);
        colors.push(`#${randomColor.padStart(6, '0')}`);
    }
    return colors;
}

const usePaletteStore = create<PaletteState>()(
    persist(
        (set, get) => ({
            image: null,
            palette: [],
            palettes: [],
            setImage: (image) => set({ image }),
            setPalette: (palette) => set({ palette }),

            addPalette: (palette) => {
                const newPalette = { id: Date.now().toString(), colors: [...palette], name: "Name" };
                set((state) => ({
                    palettes: [...state.palettes, newPalette],
                }));
            },

            debugPalettes: () => {
                set((state) => ({
                    palettes: [
                        { id: "1", colors: generateRandomHexColors(5), name: "Vivid Tones" },
                        { id: "2", colors: generateRandomHexColors(4), name: "Sunset Glow" },
                        { id: "3", colors: generateRandomHexColors(3), name: "Ocean Dreams" },
                        { id: "4", colors: generateRandomHexColors(5), name: "Warm Memories" },
                    ],
                }));
            },

            updatePalette: (id, updatedPalette) => {
                set((state) => ({
                    palettes: state.palettes.map((palette) =>
                        palette.id === id ? { ...palette, ...updatedPalette } : palette
                    ),
                }));
            },

            deletePalette: (id) => {
                set((state) => ({
                    palettes: state.palettes.filter((palette) => palette.id !== id),
                }));
            },

            clearPalettes: () => {
                set(() => ({ palettes: [] }));
            },
        }),
        {
            name: "palette-storage",
            partialize: (state) => ({
                palettes: state.palettes,
            }),
        }
    )
);

export default usePaletteStore;
