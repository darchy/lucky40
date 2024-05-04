import { BaseComponent, EventsManager } from "nzl_fwk";
import { TweenLite, Linear } from "gsap";
import { AutoplayStarterEvents } from "./events/AutoplayStarterEvents";

/**
 * Autoplay starter just animates the autoplay color div that represents the moment when autoplay will be enabled.
 * @param id Component's ID.
 * @author dbaranji
 */
export class AutoplayStarter extends BaseComponent {
    private _context: HTMLElement | null;

    private _progress: any;

    private _tween: TweenLite | undefined;

    private _dom: boolean;

    private _started: boolean;

    private _dispatched: boolean;

    constructor(id: string) {
        super(id);

        this._started = false;
        this._dispatched = false;
    }

    /**
     * Component's initialization.
     */
    protected init(): void {
        this._dom = this.setup.dom;

        if (this._dom) {
            this._context = document.getElementById(this.setup.containerId);
        }
    }

    /**
     * Starts the autoplay enabling progress.
     * Also dispatches the PROGRESS_BEGIN and PROGRESS_END events.
     */
    public startProgress(): void {
        if (this._started === true) {
            return;
        }

        this._started = true;
        EventsManager.getInstance().dispatchEvent(new AutoplayStarterEvents(AutoplayStarterEvents.PROGRESS_BEGIN));

        this._progress = { value: 0 };

        if (this._dom && this._context !== null) {
            this._context.style.top = "100%";
            this._context.style.height = "0";
            this._context.style.display = "flex";

            this._tween = new TweenLite(this._progress, 1.5, {
                value: 100,
                ease: Linear.easeNone,
                delay: 0.5,
                onUpdate: (): void => {
                    const top: number = 100 - this._progress.value;

                    if (this._context !== null) {
                        this._context.style.top = `${String(top)}%`;
                        this._context.style.height = `${String(this._progress.value)}%`;
                    }
                },
                onComplete: (): void => {
                    if (this._context !== null) {
                        this._context.style.height = "100%";
                        this._context.style.top = "0";
                    }

                    if (!this._dispatched) {
                        EventsManager.getInstance().dispatchEvent(
                            new AutoplayStarterEvents(AutoplayStarterEvents.PROGRESS_END),
                        );
                        this._dispatched = true;
                    }
                },
            });
        } else {
            this._tween = new TweenLite(this._progress, 0.8, {
                value: 100,
                ease: Linear.easeNone,
                delay: 0.3,
                onComplete: () => {
                    if (!this._dispatched) {
                        EventsManager.getInstance().dispatchEvent(
                            new AutoplayStarterEvents(AutoplayStarterEvents.PROGRESS_END),
                        );
                        this._dispatched = true;
                    }
                },
            });
        }
    }

    /**
     * Cancels the autoplay enabling progress.
     * Also dispatches the PROGRESS_CANCEL event.
     */
    public cancelProgress(): void {
        this._started = false;
        this._dispatched = false;

        if (this._tween !== undefined) {
            this._tween.kill();
            this._tween = undefined;
        }

        if (this._dom && this._context !== null) {
            this._context.style.display = "none";
            this._context.style.top = "0";
            this._context.style.height = "100%";
        }

        EventsManager.getInstance().dispatchEvent(new AutoplayStarterEvents(AutoplayStarterEvents.PROGRESS_CANCEL));
    }
}
