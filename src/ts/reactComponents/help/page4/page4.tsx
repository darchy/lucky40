import * as React from 'react';

export class Page4 extends React.Component<{id: string}>
{
    private pageId: string = this.props.id;

    render()
    {
        return(
            <div className="page" id={this.pageId}>
                <div className="fullBackground">

                    <div className="textContainer centeredText">
                        Free Spins can be re-triggered.
                    </div>

                    <div className="scattersContainer">
                        <div className="section left">
                            <img src="./assets/common/help/h2-group15games.png" alt="" draggable="false" />
                        </div>
                        <div className="section right">
                            <img src="./assets/common/help/h2-group30games.png" alt="" draggable="false" />
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}