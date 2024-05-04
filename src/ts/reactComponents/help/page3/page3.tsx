import * as React from 'react';

export class Page3 extends React.Component<{id: string}>
{
    private pageId: string = this.props.id;

    render()
    {
        return(
            <div className="page" id={this.pageId}>
                <div className="fullBackground">

                    <div className="textContainer">
                        Happy Diamonds is 4 reel game with 10 winlines.<br />
                        In case of Win on winline, winning symbols dissapear<br />
                        and new symbols from higher positions on reels fall in their places.
                    </div>
                    <div className="symbolsContainer">
                        <div className="wildContainer">
                            <img src="./assets/common/help/h2-wild.png" alt="" draggable="false" />
                            Doubles the Win
                        </div>
                        <div className="textHolder">
                            <img src="./assets/common/help/h2-wordWild.png" alt="" draggable="false" /> substitutes for:
                        </div>
                        <div className="symbolsHolder">
                            <img src="./assets/common/help/h2-7red.png" alt="" draggable="false" />
                            <img src="./assets/common/help/h2-7blue.png" alt="" draggable="false" />
                            <img src="./assets/common/help/h2-7white.png" alt="" draggable="false" />
                            <img src="./assets/common/help/h2-heart.png" alt="" draggable="false" />
                            <img src="./assets/common/help/h2-diamond-yellow.png" alt="" draggable="false" />
                            <img src="./assets/common/help/h2-diamond-purple.png" alt="" draggable="false" />
                            <img src="./assets/common/help/h2-diamond-green.png" alt="" draggable="false" />
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}