import * as React from 'react';
import { SymbolDetails } from './symbolDetails';

export class Page1 extends React.Component<{id: string}>
{
    private pageId: string = this.props.id;

    render()
    {
        return(
            <div className="page" id={this.pageId}>

                <div className="column">
                    <SymbolDetails id="TABLE2" img1Name="h2-7red.png" />
                    <SymbolDetails id="TABLE3" img1Name="h2-7blue.png" />
                </div>
                <div className="column">
                    <SymbolDetails id="TABLE4" img1Name="h2-7white.png" />
                    <SymbolDetails id="TABLE5" img1Name="h2-heart.png" img2Name="h2-diamond-yellow.png" />
                </div>
                <div className="column">
                    <SymbolDetails id="TABLE6" img1Name="h2-diamond-purple.png" img2Name="h2-diamond-green.png" />
                </div>

            </div>
        );
    }
}