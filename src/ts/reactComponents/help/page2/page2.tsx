import * as React from 'react';
import { BigSymbolDetails } from './bigSymbolDetails';

export class Page2 extends React.Component<{id: string}>
{
    private pageId: string = this.props.id;

    render()
    {
        return(
            <div className="page" id={this.pageId}>
                <div className="bigBackground">

                    <BigSymbolDetails id="TABLE1" imgName="h2-wild.png" withText={true} />

                    {/*<div className="middleTextContainer">
                        Substitute for all symbols except Scatter
                    </div>*/}
                    <div className="middleTextContainer">
                        FREE SPINS
                    </div>

                    <BigSymbolDetails id="TABLE7" imgName="h2-scatter.png" />

                    <div className="textContainer">
                        <img src="./assets/common/help/h1-logo-rotation.png" alt="" draggable="false" />
                    </div>

                </div>
            </div>
        );
    }
}