import { usePrevious } from "../hooks";
import type { State } from "../types";

export default function Square({ value, onSquareClick, disabled }: { value: State, onSquareClick: () => void, disabled: boolean}) {
    const prevValue = usePrevious(value);
    const justFlipped = prevValue !== null && value !== null && prevValue !== value;

    const stoneColor = value === 'b' ? 'bg-gray-800' : 'bg-white';
    const flipContainerClass = justFlipped ? 'animate-flip' : '';

    const hoverStyle = value === null ? 'hover:bg-teal-700' : '';

    return (
        <button
            className={`
                w-full h-full
                bg-teal-600 rounded-md
                flex items-center justify-center
                p-1 perspective-1000
                ${hoverStyle}
            `}
            onClick={onSquareClick}
            disabled={disabled}
        >
            {value !== null && (
                <div className={`w-full h-full rounded-full shadow-lg transform-style-3d ${flipContainerClass}`}>
                    <div className={`absolute w-full h-full rounded-full ${stoneColor} backface-hidden`}></div>
                    <div className={`absolute w-full h-full rounded-full ${stoneColor} transform-rotate-y-180 backface-hidden`}></div>
                </div>
            )}
        </button>
    )
}