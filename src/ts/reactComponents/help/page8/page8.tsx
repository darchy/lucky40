import * as React from 'react';

export class Page8 extends React.Component<{id: string}>
{
    private pageId: string = this.props.id;

    render()
    {
        return(
            <div className="page" id={this.pageId}>
                <div className="fullBackground">

                <div className="gameRulesContainer">
                        <span>How to play:</span>
                        <p className="smallerText centerText">
                            Settings button <img src="assets/common/betPanel/menu.png" alt="menu" /> opens settings menu that contain settings which affects the way the game is being played per each login.
                            <br />
                            In game settings menu adjust number of lines and bet per line that you want to use in the game.
                            <br />
                            Help <img src="assets/common/gameSettings/info.png" alt="help" /> opens Information game page.
                            <br />
                            CREDIT and BET labels show the current balance and current total bet.
                            <br />
                            Start <img src="assets/common/betPanel/spin.png" alt="spin" /> starts the game.
                            <br />
                            Exit <img src="assets/common/betPanel/exit.png" alt="exit" /> exit the game.
                            <br />
                            Autoplay <img src="assets/common/betPanel/auto.png" alt="autoplay" /> start automatic game play.
                            <br />
                            Left button <img src="assets/common/help/prev.png" alt="left" /> and Right button <img src="assets/common/help/next.png" alt="right" /> scroll between information pages.
                            <br />
                            Close button <img src="assets/common/betPanel/exit.png" alt="close" /> closes the information screen.
                            <br />
                            Space on the keyboard can be used to start or stop spin.
                        </p>
                    </div>

                </div>
            </div>
        );
    }
}