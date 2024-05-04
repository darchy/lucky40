import * as React from 'react';

export class Page7 extends React.Component<{id: string}>
{
    private pageId: string = this.props.id;

    render()
    {
        return(
            <div className="page" id={this.pageId}>
                <div className="fullBackground">

                <div className="gameRulesContainer">
                        <span>Game rules:</span>
                        <p>
                            All values are expressed as actual wins in credits.<br /><br />
                            
                            All symbols pay from left to right on selected paylines.<br />
                            Free spin wins are added to the payline win.<br />
                            When winning on multiple paylines, all wins are added to the total win.<br />
                            Only the highest win is payed per line.<br />
                            Only the highest scatter win is payed.<br />
                            During free games, 3 or more SCATTER retrigger 15 free games.<br /><br />
                            
                            MALFUNCTION VOIDS ALL PAYS AND PLAYS.<br /><br />

                            Theoretical RTP of the game is minimum 93% and maximum 98%<br />
                            High volatility games pay out less often but the cance to hit big wins in short time span is higher.
                        </p>
                    </div>

                </div>
            </div>
        );
    }
}