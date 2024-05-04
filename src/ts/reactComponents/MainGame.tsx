import * as React from 'react';
import { Game } from './game/Game';
import { GameLoader } from './gameLoader/GameLoader';
import { GameStore } from 'nzl_fwk';
import { RotateDevice } from './rotateDevice/RotateDevice';
import { Background } from './background/Background';
import { Help } from './help/Help';
import { NoInternetPopup } from './noInternetPopup/NoInternetPopup';

export class MainGame extends React.Component<{store: GameStore}>
{
    private store: GameStore = this.props.store;

    render()
    {
        return(
            <div id="gameContent" className="gameContent">
                <Background store={this.store} />
                <Game store={ this.store } />
                <NoInternetPopup />
                <RotateDevice />
                <GameLoader />
            </div>
        );
    }
}