import * as React from 'react';

export class Page5 extends React.Component<{id: string}>
{
    private pageId: string = this.props.id;

    render()
    {
        return(
            <div className="page" id={this.pageId}>
                <div className="fullBackground noPadding">

                    <div className="linesSection">
                        <img src="./assets/common/help/h3-w1.png" alt="" draggable="false" />
                        <img src="./assets/common/help/h3-w2.png" alt="" draggable="false" />
                        <img src="./assets/common/help/h3-w3.png" alt="" draggable="false" />
                        <img src="./assets/common/help/h3-w4.png" alt="" draggable="false" />
                        <img src="./assets/common/help/h3-w5.png" alt="" draggable="false" />
                    </div>
                    <div className="linesSection">
                        <img src="./assets/common/help/h3-w6.png" alt="" draggable="false" />
                        <img src="./assets/common/help/h3-w7.png" alt="" draggable="false" />
                        <img src="./assets/common/help/h3-w8.png" alt="" draggable="false" />
                        <img src="./assets/common/help/h3-w9.png" alt="" draggable="false" />
                        <img src="./assets/common/help/h3-w10.png" alt="" draggable="false" />
                    </div>

                </div>
            </div>
        );
    }
}