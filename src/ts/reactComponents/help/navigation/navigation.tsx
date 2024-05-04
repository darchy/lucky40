import * as React from 'react';

export class Navigation extends React.Component
{
    render()
    {
        return(
            <div className="navigationContainer">
                <div className="button left" id="previous">
                    <img src="./assets/common/help/prev.png" alt="" draggable="false" />
                    <div className="nullifier"></div>
                </div>
                <div className="info" id="currentPageInfo"></div>
                <div className="button right" id="next">
                    <img src="./assets/common/help/next.png" alt="" draggable="false" />
                    <div className="nullifier"></div>
                </div>
            </div>
        );
    }
}