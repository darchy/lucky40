import * as React from 'react';
import { observer } from 'mobx-react';
import { GameStore } from 'nzl_fwk';
import { Clock } from '../game/Clock';
import { Loader } from 'pixi.js';

@observer
export class Console extends React.Component<{ store: GameStore }>
{
    private store: GameStore = this.props.store;

    render()
    {
        let creditsText: string = "Credits";
        const domainSettings: any = Loader.shared.resources["domainSettings"];

        if (domainSettings !== undefined && domainSettings !== null) {
            const settings: any = domainSettings.data;

            if (settings !== undefined && settings !== null) {
                const showCurrency: number = settings.showcurrency !== undefined ? Number(settings.showcurrency) : 0;
                const currency: string = sessionStorage.currency !== undefined && sessionStorage.currency !== "" ? ` (${sessionStorage.currency})` : "";
                creditsText = showCurrency === 0 ? "Credits" : `Balance${currency}`;
            }
        }

        return(
            <div className="consoleContainer">

                <div className="baseGame">
                    <div className="section">
                        <span>{creditsText}</span>
                        <span>{ this.store.getCredits() }</span>
                    </div>

                    <div className="section">
                        <span>Win</span>
                        <span>{ this.store.getWin() }</span>
                    </div>

                    <div className="section">
                        <span>Stake</span>
                        <span>{ this.store.getTotalBet() }</span>
                    </div>
                </div>

                <div className="transaction-id">{ this.store.getTransactionId() }</div>
                <Clock />

            </div>
        );
    }
}