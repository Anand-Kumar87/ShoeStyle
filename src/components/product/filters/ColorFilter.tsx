import ColorSwatch from '../product/ColorSwatch';

export default function ColorFilter({ selectedColor, onChange }: any) {
    const COLORS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow'];
    return (
        <div className="flex flex-wrap gap-2">
            {COLORS.map(color => (
                <button key={color} onClick={() => onChange(color)} className={selectedColor === color ? 'ring-2 ring-black rounded-full' : ''}>
                    <ColorSwatch color={color} />
                </button>
            ))}
        </div>
    );
}