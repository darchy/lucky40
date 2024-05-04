import * as React from 'react';

export class BigSymbolDetails extends React.Component<{id: string, imgName: string, withText?: boolean}>
{
    private tableId: string = this.props.id;
    private imagePath: string = './assets/common/help/' + this.props.imgName;
    private withText: boolean = this.props.withText === true;

    private getText(): any
    {
        if (this.withText === true) {
            return(
                <div className="symbolContainerText">
                    <img src="./assets/common/help/h2-wordWild.png" alt="" draggable="false" /><br />
                    doubles the WIN
                    <span>Substitue for all symbols except Scatter</span>
                </div>
            );
        } else {
            return(
                <div className="symbolContainerText"></div>
            );
        }
    }

    render()
    {
        return(
            <div className="bigSymbolDetails" id={this.tableId}>

                <div className="symbolContainer">
                    { this.getText() }
                    <div className="symbolContainerImage">
                        <img src={this.imagePath} alt="" draggable="false" />
                    </div>
                </div>

                <div className="detailsContainer">
                    <div className="leftColumn">
                        4x<br />3x
                    </div>
                    <div className="rightColumn" id="values">
                    </div>
                </div>

            </div>
        );
    }
}