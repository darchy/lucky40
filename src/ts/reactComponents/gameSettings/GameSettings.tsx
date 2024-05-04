import * as React from 'react';
import { GameStore } from 'nzl_fwk';
import { observer } from 'mobx-react';

@observer
export class GameSettings extends React.Component<{store: GameStore}>
{
    private store: GameStore = this.props.store;

    render()
    {
        return(
            <div id="gameSettingsContainer" className="gameSettingsContainer">
                
                <div className="gameSettings">
                    <div className="buttonsContainer">
                        <div className="button" id="gamble" >
                            <div className="iconArea">
                                <div className="helper"></div>
                                <img src="./assets/common/gameSettings/next-gamble-on.png" alt="" id="gamble-on-icon" draggable="false" />
                                <img src="./assets/common/gameSettings/next-gamble-off.png" alt="" id="gamble-off-icon" draggable="false" />
                            </div>
                            <span>GAMBLE</span>
                        </div>
                        <div className="button" id="sound" /*onClick={ this.onButtonClick }*/>
                            <div className="iconArea">
                                <div className="helper"></div>
                                <img src="./assets/common/gameSettings/sound-on.png" alt="" id="sound-on-icon" draggable="false" />
                                <img src="./assets/common/gameSettings/sound-off.png" alt="" id="sound-off-icon" draggable="false" />
                            </div>
                            <span>SOUND</span>
                        </div>
                        <div className="button" id="help" /*onClick={ this.onButtonClick }*/>
                            <div className="iconArea">
                                <div className="helper"></div>
                                <img src="./assets/common/gameSettings/info.png" alt="" draggable="false" />
                            </div>
                            <span>HELP</span>
                        </div>
                        <div className="button" id="back" /*onClick={ this.onButtonClick }*/>
                            <div className="iconArea">
                                <div className="helper"></div>
                                <img src="./assets/common/gameSettings/back.png" alt="" draggable="false" />
                            </div>
                            <span>BACK</span>
                        </div>
                    </div>

                    <div className="valuesContainer">
                        <div className="linesContainer">
                            <div className="iconArea" id="lines" style={{ cursor: "default" }} /*onClick={ this.onButtonClick }*/>
                                {/*<img src="./assets/common/gameSettings/arrow1.png" alt="" draggable="false" />*/}
                            </div>
                            <div id="linesValue" className="valueArea">{ this.store.getActiveLines() }</div>
                            <div className="labelArea">LINES</div>
                        </div>
                        <div className="stakeContainer">
                            <div className="iconArea" id="stake" /*onClick={ this.onButtonClick }*/>
                                <img src="./assets/common/gameSettings/arrow1.png" alt="" draggable="false" />
                            </div>
                            <div id="stakeValue" className="valueArea">{ this.store.getTotalBet() }</div>
                            <div className="labelArea">STAKE</div>
                        </div>
                    </div>
                </div>
                <div className="versionContainer" id="versionInfo"></div>

            </div>
        );
    }

    /*private onButtonClick(e: any): void
    {
        let buttonId: string = e.currentTarget.id;
        EventsManager.getInstance().dispatchEvent(new GameSettingsEvents(GameSettingsEvents.ON_BUTTON_CLICK, buttonId));
    }*/
}