import { BaseComponent } from "nzl_fwk";
import { AnimatedSprite } from "pixi.js";

/**
 * Coins shower animation.
 * This animation will be played after the free games has been finished.
 * @author dbaranji
 */
export class CoinsShower extends BaseComponent {
    private _leftCoins: AnimatedSprite;

    private _rightCoins: AnimatedSprite;

    private _centerCoins: AnimatedSprite;

    private _bigWinLoops: number;

    /**
     * Coins shower initialization.
     */
    protected init(): void {
        this._leftCoins = <AnimatedSprite>this.container.getChildByName("coinsLeft");
        this._rightCoins = <AnimatedSprite>this.container.getChildByName("coinsRight");
        this._centerCoins = <AnimatedSprite>this.container.getChildByName("coinsCenter");
        this._bigWinLoops = 0;

        this.hideCoins();
    }

    /**
     * Shows the coins shower animation.
     */
    private showCoins(): void {
        this._leftCoins.visible = true;
        this._rightCoins.visible = true;
    }

    /**
     * Hides the coins shower animation.
     */
    private hideCoins(): void {
        this._leftCoins.visible = false;
        this._rightCoins.visible = false;
    }

    /**
     * Play coins shower animation.
     */
    public playCoins(): void {
        this.showCoins();

        this._leftCoins.play();
        this._rightCoins.play();
    }

    /**
     * Stops the coins shower animation.
     */
    public stopCoins(): void {
        this._leftCoins.gotoAndStop(1);
        this._rightCoins.gotoAndStop(1);

        this.hideCoins();
    }

    /**
     * Runs the big win coins animation.
     */
    public playBigWinCoins(): void {
        this._centerCoins.visible = true;
        this._centerCoins.play();
        this._centerCoins.onComplete = (): void => {
            if (++this._bigWinLoops === 2) {
                this.stopBigWinCoins();
            } else {
                this._centerCoins.gotoAndPlay(1);
            }
        };
    }

    /**
     * Stops the big win coins animation.
     */
    public stopBigWinCoins(): void {
        this._centerCoins.visible = false;
        this._centerCoins.gotoAndStop(1);
        this._bigWinLoops = 0;
    }
}
