import * as React from 'react';

export class SymbolDetails extends React.Component<{id: string, img1Name: string, img2Name?: string}>
{
    private tableId: string = this.props.id;
    private image1Path: string = './assets/common/help/' + this.props.img1Name;
    private image2Path: string | undefined = this.props.img2Name === undefined ? undefined : './assets/common/help/' + this.props.img2Name;

    private getSymbolContainer(): any
    {
        if (this.image2Path === undefined) {
            return(
                <div className="symbolContainer">
                    <img src={this.image1Path} alt="" draggable="false" />
                </div>
            );
        } else {
            return(
                <div className="symbolContainer">
                    <img src={this.image1Path} alt="" draggable="false" />
                    <img src={this.image2Path} alt="" draggable="false" />
                </div>
            );
        }
    }

    render()
    {
        return(
            <div className="symbolDetails" id={this.tableId}>
                { this.getSymbolContainer() }
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