import * as React from 'react';
import { GameStore } from 'nzl_fwk';

export class Game extends React.Component<{ store: GameStore }>
{
    private store: GameStore = this.props.store;

    render()
    {
        return (
            <div id="mainGame" className="gameContainer">
                <div id="gameContainer" className="canvasContainer"></div>
            </div>
        );
    }
}
