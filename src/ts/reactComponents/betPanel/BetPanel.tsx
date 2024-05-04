import * as React from 'react';

export class BetPanel extends React.Component
{
    render()
    {
        return(
            <div className="betPanelContainer" id="betPanelContainer">

                <div className="betPanelButton" id="exitGameButton">
                    <img src="./assets/common/betPanel/exit.png" alt="" draggable="false" />
                    <div className="nullifier"></div>
                </div>
                <div className="betPanelButton" id="enterGambleButton">
                    <img src="./assets/common/betPanel/gamble.png" alt="" draggable="false" />
                    <div className="nullifier"></div>
                </div>

                <div className="betPanelButton betPanelRight" id="spinButton">
                    <div className="autoplayColor" id="autoplayColor"></div>
                    <span>HOLD FOR<br />AUTOPLAY</span>
                    <img src="./assets/common/betPanel/spin.png" alt="" draggable="false" />
                    <div className="nullifier"></div>
                </div>
                <div className="betPanelButton betPanelRight" id="speedUpButton">
                    <img src="./assets/common/betPanel/spin.png" alt="" draggable="false" />
                    <div className="nullifier"></div>
                </div>
                <div className="betPanelButton betPanelRight" id="collectButton">
                    <img src="./assets/common/betPanel/collect.png" alt="" draggable="false" />
                    <div className="nullifier"></div>
                </div>
                <div className="betPanelButton betPanelRight" id="autoplayButton">
                    <img src="./assets/common/betPanel/auto.png" alt="" draggable="false" />
                    <div className="nullifier"></div>
                </div>

                <div className="betPanelButton betPanelMenuButton betPanelRight betPanelTop" id="menuButton">
                    <img src="./assets/common/betPanel/menu.png" alt="" draggable="false" />
                    <div className="nullifier"></div>
                </div>

            </div>
        );
    }
}