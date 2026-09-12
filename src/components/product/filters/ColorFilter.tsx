import ColorSwatch from '../ColorSwatch';

export default function ColorFilter({ selectedColor, onChange }: { selectedColor: string; onChange: (color: string) => void }) {
    const COLORS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow'];
    return (
        <ColorSwatch
            colors={COLORS}
            selectedColor={selectedColor}
            onColorChange={onChange}
        />
    );
}