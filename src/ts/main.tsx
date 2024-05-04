import * as React from 'react';
import { render } from 'react-dom';
import { MainGame } from './reactComponents/MainGame';
import { GameController } from './GameController';
import { GameStore } from "nzl_fwk";

declare global {
    interface Window { version: string }
}

window.onload = (): void =>
{
    let store: GameStore = new GameStore();
    new GameController(store);

    render(<MainGame store={store} />, document.getElementById('mainContent'));
}