import * as React from 'react';

export class ProgressBar extends React.Component
{
    render()
    {
        return (
            <div className="progressBarContainer">
                <div className="progressBarOutline">
                    <div id="progressBarInline" className="progressBarInline"></div>
                </div>
            </div>
        );
    };
}
