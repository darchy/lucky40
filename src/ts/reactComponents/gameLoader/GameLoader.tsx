import * as React from 'react';
import { ProgressBar } from './ProgressBar';
import { TouchMessage } from './TouchMessage';

export class GameLoader extends React.Component
{
    private bckImg: any = {
        backgroundImage: 'url(./assets/common/preloader/background.png)'
    };

    private gameLogoImg: any = {
        backgroundImage: 'url(./assets/common/preloader/logo.png)'
    };

    render()
    {
        return (
            <div id="loaderContainer" className="loaderContainer" style={ this.bckImg }>
                <div className="gameLogo" style={ this.gameLogoImg }></div>
                <ProgressBar />
                <TouchMessage />
            </div>
        );
    }
}
