import * as React from 'react';

export class Page9 extends React.Component<{id: string}>
{
    private pageId: string = this.props.id;

    render()
    {
        return(
            <div className="page" id={this.pageId}>
                <div className="fullBackground">

                <div className="gameRulesContainer">
                        <span>Autoplay:</span>
                        <p className="centerText">
                            Press and hold the START button <img src="assets/common/betPanel/spin.png" alt="spin" /> triggers AUTOPLAY <img src="assets/common/betPanel/auto.png" alt="autoplay" />
                            <br /><br />
                            STOP AUTOPLAY
                            <br /><br />
                            AFTER EACH GAME - press START button and AUTOPLAY will stop.<br />
                            IF SINGLE WIN EXCEEDS - whenever a single win is above the sum written is this field, Autoplay will stop.
                        </p>
                    </div>

                </div>
            </div>
        );
    }
}