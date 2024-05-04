import * as React from 'react';
import { Page1 } from './page1/page1';
import { Page2 } from './page2/page2';
import { Page3 } from './page3/page3';
import { Page4 } from './page4/page4';
import { Page5 } from './page5/page5';
import { Page6 } from './page6/page6';
import { Navigation } from './navigation/navigation';
import { Page7 } from './page7/page7';
import { Page8 } from './page8/page8';
import { Page9 } from './page9/page9';

export class Help extends React.Component
{
    render()
    {
        return(
            <div id="helpContainer" className="helpContainer">
                <div className="helpContent">
                
                    <div className="exitButtonContainer">
                        <div className="container">
                            <div className="exitButton button right" id="exit">X</div>
                        </div>
                    </div>

                    <div className="logoContainer">
                        <img src="./assets/common/help/logo.png" alt="" draggable="false" />
                    </div>

                    <div className="pagesContainer">
                        <Page1 id="page1" />
                        <Page2 id="page2" />
                        <Page3 id="page3" />
                        <Page4 id="page4" />
                        <Page5 id="page5" />
                        <Page7 id="page6" />
                        <Page6 id="page7" />
                        <Page8 id="page8" />
                        <Page9 id="page9" />
                    </div>

                    <Navigation />

                </div>
            </div>
        );
    }
}