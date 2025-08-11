import type { State } from "../types";
import Square from "./Square";

export function Board({ squares, onPlay, disabled }: { squares: State[], onPlay: (idx: number) => void, disabled: boolean }) {
    const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const rows = ['1', '2', '3', '4', '5', '6', '7', '8'];

    const gridItems = [];

    gridItems.push(<div key="leftCorner" />);
    cols.forEach(col => gridItems.push(
        <div key={`col-${col}`} className="h-8 flex items-center justify-center font-bold text-gray-400">
            {col}
        </div>
    ));
    gridItems.push(<div key="rightCorner"/>)

    for (let i = 0; i < 8; i++) {
        gridItems.push(
            <div key={`row-${rows[i]}`} className="w-8 flex items-center justify-center font-bold text-gray-400">
                {rows[i]}
            </div>
        );
        for (let j = 0; j < 8; j++) {
            const idx = i * 8 + j;
            gridItems.push(
                <div key={`square-${idx}`} className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16">
                    <Square
                        value={squares[idx]}
                        onSquareClick={() => onPlay(idx)}
                        disabled={disabled || squares[idx] !== null}
                    />
                </div>
            );
        }
        gridItems.push(<div key={`row-${i}-end`}/>)
    }

    return (
        <div className="p-4 bg-gray-900 rounded-xl shadow-2xl">
            <div className="inline-grid grid-cols-10 gap-1">
                {gridItems}
            </div>
        </div>
    );
}