import * as React from 'react';

export class Page6 extends React.Component<{id: string}>
{
    private pageId: string = this.props.id;

    render()
    {
        return(
            <div className="page" id={this.pageId}>
                <div className="fullBackground">

                    <div className="doubleUpContainer">
                        <div className="doubleUpLeft">
                            <span>Double Up:</span>
                            <p>
                                To gamble any win press GAMBLE BUTTON.<br />
                                Then select the right color (<span className="red">RED</span>/<span className="black">BLACK</span>) or a <span className="blue">SUIT</span> to win.<br />
                                Win is <span className="green">DOUBLED (x2)</span> if <span className="red">RED</span>/<span className="black">BLACK</span> choice is correct.<br />
                                Win is <span className="green">QUADRUPLED (x4)</span> if <span className="blue">SUIT</span> choice is correct.<br />
                                Winnings may be gambled until Gamble limit is reached<br />
                                (maximum 5 times or the limit is reached before).
                            </p>
                        </div>
                        <div className="doubleUpRight">
                            <img src="./assets/common/help/h3-4suits.png" alt="" draggable="false" />
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}