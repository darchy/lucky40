import { observer } from 'mobx-react';
import * as React from 'react';
import { GameStore } from 'nzl_fwk';
import { Clock } from '../game/Clock';

@observer
export class Background extends React.Component<{ store: GameStore }>
{
    private store: GameStore = this.props.store;

    render()
    {
        return(
            <div id="backgroundsHolder" className="backgroundsHolder">
                <div className="transaction-id">{ this.store.getTransactionId() }</div>
                <Clock />
            </div>
        );
    }
}