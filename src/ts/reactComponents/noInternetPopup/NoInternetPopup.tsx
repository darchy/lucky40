import * as React from 'react';

export class NoInternetPopup extends React.Component
{
    render()
    {
        return(
            <div id="popupContainer" className="popupContainer">
                <div className="popupLook">
                    No internet connection
                </div>
            </div>
        );
    }
}