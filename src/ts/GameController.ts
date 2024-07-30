import {
    GameProtocol,
    CommunicationProtocol,
    SlotParser,
    GameStore,
    EventsManager,
    GameProtocolEvents,
    BetPanel,
    IGameController,
    BetPanelEvents,
    InitPayload,
    GPRequestPayload,
    GPGameStage,
    GPRequestType,
    GameSettingsEvents,
    UpdatePayload,
    UpdatePayloadTypes,
    WinLinesPayload,
    OutcomePayload,
    WinLineDetail,
    BonusGamesDetails,
    ReelsEvents,
    WinCounter,
    CONTINUE_ACTIONS,
    GAMBLE_STATES,
    WinCounterEvents,
    StatusLine,
    SoundManager,
    FreeGames,
    FreeGamesEvents,
    CollectPayload,
    Background,
    FreeGamesPlaquePayload,
    FreeGamesPlaqueType,
    GameSettings,
    GameSettingsClickPayload,
    WinCounterPayload,
    Help,
    HelpEvents,
    PaytablePayload,
    PaytableTableData,
    HelpPayload,
    DeviceManager,
    DeviceManagerEvents,
    Gamble,
    GambleEvents,
    GamblePayload,
    Services,
    FloatingButtons,
    FloatingButtonsEvents,
    Console,
    ConsoleEvents,
    Reels,
    TranslationManager,
    SoundManagerEvents,
} from "nzl_fwk";
import { CoinsShower } from "./components/coinsShower/CoinsShower";
import { AutoplayStarter } from "./components/autoplayStarter/AutoplayStarter";
import { AutoplayStarterEvents } from "./components/autoplayStarter/events/AutoplayStarterEvents";

export class GameController implements IGameController {
    private _store: GameStore;

    private _parser: SlotParser;

    private _cp: CommunicationProtocol;

    private _gp: GameProtocol;

    private _soundManager: SoundManager;

    private _initialPayload: InitPayload;

    private _outcomePayload: OutcomePayload;

    private _gamblePayload: GamblePayload | undefined;

    private _autoplayTimer: number;

    // flags
    private _isInBonusGames: boolean = false;

    private _isAutoplayEnabled: boolean = false;

    private _wasAutoplayEnabled: boolean = false;

    private _isHelpOpened: boolean = false;

    private _isGambleEnabled: boolean = false;

    private _isInGamble: boolean = false;

    private _isSoundEnabled: boolean = true;

    private _shouldCollectBonus: boolean = false;

    private _winCounterCurrentIndex: number = 1;

    // components
    private _background: Background;

    private _reels: Reels;

    private _betPanel: BetPanel;

    private _betPanel1: BetPanel;

    private _winCounter: WinCounter;

    private _statusLine: StatusLine;

    private _freeGames: FreeGames;

    private _coinsShower: CoinsShower;

    private _gameSettings: GameSettings;

    private _autoplayStarter: AutoplayStarter;

    private _help: Help;

    private _gamble: Gamble;

    private _console: Console;

    private _floatingButtonHome: FloatingButtons;

    private _floatingButtonGamble: FloatingButtons;

    private _floatingButtonHelp: FloatingButtons;

    constructor(store: GameStore) {
        this._store = store;
        this._parser = new SlotParser(process.env.GAME_ID as string, process.env.AFF_NAME);
        this._cp = new CommunicationProtocol(
            {
                environment: process.env.ENV as string,
                loginUsername: process.env.LOGIN_USER,
                loginPassword: process.env.LOGIN_PASS,
            },
            this._parser,
        );
        this._gp = new GameProtocol(this._cp, this._store);

        this._background = new Background("background");
        this._reels = new Reels("reels");
        this._betPanel = new BetPanel("betPanel", this._store);
        this._betPanel1 = new BetPanel("betPanel1", this._store);
        this._winCounter = new WinCounter("winCounter");
        this._statusLine = new StatusLine("statusLine");
        this._freeGames = new FreeGames("freeGames", this._store);
        this._help = new Help("help");
        this._coinsShower = new CoinsShower("coinsShower");
        this._gameSettings = new GameSettings("gameSettings");
        this._autoplayStarter = new AutoplayStarter("autoplayStarter");
        this._gamble = new Gamble("gamble");
        this._console = new Console("console", this._store);
        this._floatingButtonHome = new FloatingButtons("floatingButtonHome", this._store);
        this._floatingButtonGamble = new FloatingButtons("floatingButtonGamble", this._store);
        this._floatingButtonHelp = new FloatingButtons("floatingButtonHelp", this._store);

        this.registerEvents();
    }

    /**
     * Registeres all necessary events.
     */
    private registerEvents(): void {
        // game protocol
        EventsManager.getInstance().addEvent(GameProtocolEvents.ON_BEFORE_SHOW_STAGE, this.onBeforeShowStage, this);
        EventsManager.getInstance().addEvent(GameProtocolEvents.ON_SHOW_STAGE, this.onStartGame, this);
        EventsManager.getInstance().addEvent(GameProtocolEvents.ON_RESPONSE, this.onPlayOutcome, this);
        EventsManager.getInstance().addEvent(GameProtocolEvents.ON_GAMBLE_RESPONSE, this.onGambleOutcome, this);
        EventsManager.getInstance().addEvent(GameProtocolEvents.ON_UPDATE, this.onUpdateGameParameters, this);
        EventsManager.getInstance().addEvent(GameProtocolEvents.ON_EXIT_GAME, this.onExitGame, this);
        EventsManager.getInstance().addEvent(GameProtocolEvents.ON_ERROR, this.onError, this);
        EventsManager.getInstance().addEvent(GameProtocolEvents.ON_COLLECT, this.onCollect, this);
        EventsManager.getInstance().addEvent(GameProtocolEvents.ON_ENTER_BONUS_GAMES, this.onEnterBonusGames, this);
        EventsManager.getInstance().addEvent(GameProtocolEvents.ON_PAYTABLE_REQUESTED, this.onHelpRequested, this);

        // device manager
        EventsManager.getInstance().addEvent(DeviceManagerEvents.ON_VISIBILITY_CHANGE, this.onVisibilityChange, this);
        EventsManager.getInstance().addEvent(
            DeviceManagerEvents.ON_NETWORK_STATUS_CHANGE,
            this.onNetworkStatusChange,
            this,
        );

        // bet panel
        EventsManager.getInstance().addEvent(BetPanelEvents.ON_BUTTON_DOWN, this.onBetPanelButtonDown, this);
        EventsManager.getInstance().addEvent(BetPanelEvents.ON_BUTTON_CLICK, this.onBetPanelButtonClick, this);
        EventsManager.getInstance().addEvent(
            BetPanelEvents.ON_AUTO_COLLECT_TIMEOUT,
            this.onBetPanelAutoCollectTimeout,
            this,
        );

        // game settings
        EventsManager.getInstance().addEvent(GameSettingsEvents.ON_BUTTON_CLICK, this.onGameSettingsButtonClick, this);
        EventsManager.getInstance().addEvent(
            GameSettingsEvents.ON_SET_DEFAULT_VALUES,
            this.onGameSettingsSetDefaultValues,
            this,
        );
        // EventsManager.getInstance().addEvent(GameSettingsEvents.ON_VOLUME_UPDATE, this.onGameSettingsVolumeUpdate, this);

        // reels
        EventsManager.getInstance().addEvent(ReelsEvents.REEL_SLAM_STOP, this.onReelStoped, this);
        EventsManager.getInstance().addEvent(ReelsEvents.SPINNING_COMPLETE, this.onSpinningComplete, this);
        // EventsManager.getInstance().addEvent(ReelsEvents.PRESENTATION_COMPLETE, this.onReelsPresentationComplete, this);
        EventsManager.getInstance().addEvent(
            ReelsEvents.WIN_LINES_SWITCHING_BEGIN,
            this.onWinLinesSwitchingBegin,
            this,
        );
        EventsManager.getInstance().addEvent(ReelsEvents.FIVE_OF_A_KIND_ANIM_BEGIN, this.onFiveOfAKindAnimBegin, this);

        // win counter
        EventsManager.getInstance().addEvent(WinCounterEvents.ON_COUNTING_BEGIN, this.onWinCountingBegin, this);
        EventsManager.getInstance().addEvent(WinCounterEvents.ON_COUNTING, this.onWinCounting, this);
        EventsManager.getInstance().addEvent(WinCounterEvents.ON_COUNTING_COMPLETE, this.onWinCountingComplete, this);

        // free games
        EventsManager.getInstance().addEvent(FreeGamesEvents.ON_SHOW, this.onFreeGamesPlaqueShow, this);
        EventsManager.getInstance().addEvent(FreeGamesEvents.ON_HIDE, this.onFreeGamesPlaqueHide, this);

        // autoplay starter
        EventsManager.getInstance().addEvent(
            AutoplayStarterEvents.PROGRESS_BEGIN,
            this.onAutoplayStarterProgressStart,
            this,
        );
        EventsManager.getInstance().addEvent(
            AutoplayStarterEvents.PROGRESS_END,
            this.onAutoplayStarterProgressEnd,
            this,
        );
        EventsManager.getInstance().addEvent(
            AutoplayStarterEvents.PROGRESS_CANCEL,
            this.onAutoplayStarterProgressCancel,
            this,
        );

        // help
        EventsManager.getInstance().addEvent(HelpEvents.ON_BUTTON_CLICK, this.onHelpButtonClick, this);

        // gamble
        EventsManager.getInstance().addEvent(GambleEvents.ON_BUTTON_CLICK, this.onGambleButtonClick, this);
        EventsManager.getInstance().addEvent(
            GambleEvents.ON_PRESENTATION_COMPLETE,
            this.onGamblePresentationComplete,
            this,
        );
        EventsManager.getInstance().addEvent(GambleEvents.ON_RESULT, this.onGambleResult, this);

        // console
        EventsManager.getInstance().addEvent(ConsoleEvents.ON_BUTTON_CLICK, this.onConsoleButtonClick, this);

        // floating buttons
        EventsManager.getInstance().addEvent(FloatingButtonsEvents.ON_BUTTON_CLICK, this.onFloatingButtonsClick, this);

        // sound manager
        EventsManager.getInstance().addEvent(SoundManagerEvents.ON_SOUND_END, this.onSoundComplete, this);
    }

    /**
     * Registeres all components that will be used in game.
     */
    public registerComponents(): void {
        this._soundManager = new SoundManager();

        this._gp.registerComponent(this._background);
        this._gp.registerComponent(this._reels);
        this._gp.registerComponent(this._statusLine);
        this._gp.registerComponent(this._betPanel);
        this._gp.registerComponent(this._betPanel1);
        this._gp.registerComponent(this._winCounter);
        this._gp.registerComponent(this._freeGames);
        this._gp.registerComponent(this._help);
        this._gp.registerComponent(this._coinsShower);
        this._gp.registerComponent(this._gameSettings);
        this._gp.registerComponent(this._autoplayStarter);
        this._gp.registerComponent(this._gamble);
        this._gp.registerComponent(this._console);
        this._gp.registerComponent(this._floatingButtonHome);
        this._gp.registerComponent(this._floatingButtonGamble);
        this._gp.registerComponent(this._floatingButtonHelp);
        this._gp.completeComponentsRegistration();
    }

    /**
     * Handles on before show stage event.
     * Initializes the components.
     * @param e GameProtocolEvents object.
     */
    private onBeforeShowStage(e: GameProtocolEvents): void {
        window.parent.postMessage("CHECK_IOS_HAND");

        this._initialPayload = e.getPayload();
        this._outcomePayload = this._initialPayload.outcomePayload;

        Services.DECIMAL_COUNTER = this._initialPayload.decimalCounter;

        if (
            sessionStorage.currency !== undefined &&
            sessionStorage.currency !== null &&
            (sessionStorage.currency.toLowerCase() === "ron" || sessionStorage.currency.toLowerCase() === "lei")
        ) {
            Services.LANGUAGE = "ro";
        }

        this.registerComponents();
    }

    /**
     * Handles start game event.
     */
    private onStartGame(): void {
        this._betPanel.disableAllButtons();
        this._betPanel1.disableAllButtons();
        this._console.disableButtons();
        this.enableFloatingButtons(["exitGame", "menu", "help"], false);
        this._betPanel.hideButtons(["collect", "speedUp", "autoplay", "enterGamble"]);
        this._betPanel1.hideButtons(["collect", "speedUp", "autoplay", "enterGamble"]);

        this._gameSettings.hide();

        // store/update win value
        const win: string = this._initialPayload.outcomePayload.win;
        this._store.setWin(new WinCounterPayload(win, win));

        // hide all win lines
        this._reels.hideWinLines();

        // init reels
        this._reels.initialize(this._initialPayload.outcomePayload, false);

        // disable sound on start
        this._isSoundEnabled = true;
        this._store.setIsSoundEnabled(true);
        this._soundManager.mute(false);

        this._floatingButtonHome.showButtons([this._isSoundEnabled === true ? "soundOn" : "soundOff"]);
        this._floatingButtonHome.hideButtons([this._isSoundEnabled === true ? "soundOff" : "soundOn"]);

        // handle start game by continue action code
        // it's necessary because of the reinitialization
        switch (this._outcomePayload.continueAction) {
            case CONTINUE_ACTIONS.ENTER_BONUS_GAMES:
                this.enterBonusGames();
                break;

            case CONTINUE_ACTIONS.CONTINUE_BONUS_GAMES:
                this.continueBonusGames();
                break;

            case CONTINUE_ACTIONS.EXIT_BONUS_GAMES:
                this.continueExitBonusGames();
                break;

            case CONTINUE_ACTIONS.ENTER_BROKEN_GAME:
                this._reels.animateWin();
                //this._soundManager.playSound("Storyboard");
                break;

            case CONTINUE_ACTIONS.CONTINUE_GAMBLE_GAME:
                this._gamblePayload = this._outcomePayload.gamblePayload;
                this.showGamble();
                break;

            default:
                // play welcome sound
                // this.soundManager.playSound('HappyDiamondsuk');
                this._soundManager.playSound('EnterGame');
                //this._soundManager.playSound("Storyboard");

                this.setBetPanelIdleState();

                const statusLineText: string = `${TranslationManager.getInstance().getString(
                    "status_game_over",
                )} - ${TranslationManager.getInstance().getString(
                    "status_place_your_bet",
                )} - ${TranslationManager.getInstance().getString("status_last_win", this._outcomePayload.lastWin)}`;
                this._statusLine.setText(statusLineText);
                break;
        }
    }

    /**
     * Shows the gamble stage and hides the main game stage.
     */
    private showGamble(): void {
        this._isInGamble = true;
        this._background.showBackground("gambleBackground");

        this.setBetPanelGambleState();

        this._winCounter.resetWinCounter();

        this._reels.hide();
        if (this._gamblePayload !== undefined) {
            this._gamble.show(this._gamblePayload);
        }
        //this._soundManager.stopSound("Storyboard");
        this._soundManager.playSound("GambleStart");

        if (
            this._outcomePayload !== undefined &&
            this._outcomePayload.bonusGamesDetails !== undefined &&
            this._outcomePayload.bonusGamesDetails.exitBonusGames === true
        ) {
            this._freeGames.hidePlaque();
        }

        this._betPanel.hideButtons(["enterGamble"]);
        this._betPanel1.hideButtons(["enterGamble"]);
    }

    /**
     * Hides the gamble stage and shows the main game stage.
     */
    private hideGamble(): void {
        this._isInGamble = false;
        this._background.showBackground("gameBackground");

        this.setBetPanelIdleState();

        this._reels.show();
        this._gamble.hide();

        this._soundManager.stopSound("GambleMusicLoop");

        //this._soundManager.playSound("Storyboard");

        this._betPanel.showButtons(["exitGame", "help", "menu"]);
        this._betPanel1.showButtons(["exitGame", "help", "menu"]);
        this._console.showButtons(["exitGame", "help", "menu"]);
        this.showFloatingButtons(["exitGame", "help", "menu"], true);
    }

    /**
     * Prepares the bonus games (free spins) interface.
     * Shows the featured games and featured win info on the screen.
     */
    private continueBonusGames(): void {
        this._isInBonusGames = true;
        this._store.setIsInFreeGames(true);

        const bonusGamesDetails: BonusGamesDetails | undefined = this._outcomePayload.bonusGamesDetails;
        const win: number = Number(this._outcomePayload.win);

        if (bonusGamesDetails !== undefined) {
            this._freeGames.setFeatureGames(
                bonusGamesDetails.usedBonusGames as number,
                bonusGamesDetails.bonusGames as number,
            );
            this._freeGames.setFeatureWin(bonusGamesDetails.totalWinReInitValue);
            this._freeGames.showFeatureDetails();

            this._store.setFeatureWin(bonusGamesDetails.totalWinReInitValue);
        }

        // this.store.setFeatureGame(`${bonusGamesDetails.usedBonusGames} of ${bonusGamesDetails.bonusGames}`);

        this._background.showBackground("freeGamesBackground");
        this._reels.showBackground("freeGamesBackground");

        this._reels.animateWin();

        this._soundManager.playSound("BonusGameLoop");

        // enable spin button
        if (
            (this._outcomePayload.winLines === undefined || this._outcomePayload.winLines.length === 0) &&
            (this._outcomePayload.scatters === undefined || this._outcomePayload.scatters.length === 0)
        ) {
            this._betPanel1.enableButtons(["spin"]);
        }
    }

    /**
     * Prepares the exit bonus games (free spins) interface.
     * Shows the featured win info and collect button on the screen.
     */
    private continueExitBonusGames(): void {
        // show total win plaque
        const totalWin: string =
            this._outcomePayload.bonusGamesDetails !== undefined ? this._outcomePayload.bonusGamesDetails.totalWin : "";
        const plaquePayload: FreeGamesPlaquePayload = new FreeGamesPlaquePayload(
            FreeGamesPlaqueType.TOTAL_WIN,
            undefined,
            totalWin,
            false,
        );

        this._freeGames.showPlaque(plaquePayload);

        // update console's win parameter
        const winPayload: WinCounterPayload = new WinCounterPayload(totalWin, totalWin);
        this._store.setWin(winPayload);

        // show bet panel idle state if there's no win in bonus games
        if (Number(totalWin) === 0) {
            this._winCounter.resetWinCounter();
            this._freeGames.hidePlaque();
            this.setBetPanelIdleState();
            return;
        }

        // show collect button
        this.setBetPanelCollectState();
    }

    /**
     * Handles exit game situation.
     */
    private onExitGame(): void {
        window.parent.postMessage("CLOSE_IFRAME");
        window.location.href = "../";
    }

    /**
     * Handles error situation.
     */
    private onError(): void {
        window.parent.postMessage("CLOSE_IFRAME");
        window.location.href = "../";
    }

    /**
     * Handles update game parameters event.
     * @param e GameProtocolEvents object that contains UpdatePayload data.
     */
    private onUpdateGameParameters(e: GameProtocolEvents): void {
        const payload: UpdatePayload = e.getPayload();
        const type: UpdatePayloadTypes = payload.type;
        const credits: string = payload.credits;

        switch (type) {
            case UpdatePayloadTypes.CREDITS:
                this._store.setCredits(credits);
                break;

            case UpdatePayloadTypes.TRANSACTION_ID:
                const transactionId: string = payload.transactionId;
                this._store.setTransactionId(transactionId);
                break;

            default:
                const activeLines: number = payload.stakePayload.activeLines;
                const currentBet: string = payload.stakePayload.currentBet;
                const totalBet: string = payload.stakePayload.totalBet;

                this._store.setCredits(credits);
                this._store.setActiveLines(activeLines);
                this._store.setCurrentBet(currentBet);
                this._store.setTotalBet(totalBet);
                break;
        }

        // show win lines for a while if bet/stake has been changed
        if (type === UpdatePayloadTypes.BET || type === UpdatePayloadTypes.LINES) {
            const activeLines: number = payload.stakePayload.activeLines;
            const payloadWinLines: WinLinesPayload = new WinLinesPayload(activeLines, false, true);
            this._reels.showWinLines(payloadWinLines);

            this.setBetPanelIdleState();
        }
    }

    /**
     * Handles play outcome situation.
     * @param e GameProtocolEvents object that contains OutcomePayload data.
     */
    private onPlayOutcome(e: GameProtocolEvents): void {
        const payload: OutcomePayload = e.getPayload();

        this._outcomePayload = payload;
        this._reels.stopSpin(payload);
        // this._soundManager.playSound('ReelsRotation');

        this._betPanel.showButtons(["speedUp"]);
        this._betPanel.enableButtons(["speedUp"]);
        this._betPanel1.showButtons(["speedUp"]);
        this._betPanel1.enableButtons(["speedUp"]);

        if (Number(this._outcomePayload.win) === 0) {
            this._winCounter.resetWinCounter();
        }

        if (this._outcomePayload.bonusGamesDetails !== undefined) {
            const bonusGamesDetails: BonusGamesDetails = this._outcomePayload.bonusGamesDetails;
            this._freeGames.setFeatureGames(bonusGamesDetails.usedBonusGames as number, undefined);

            // this.store.setFeatureGame(`${bonusGamesDetails.usedBonusGames} of ${bonusGamesDetails.bonusGames}`);
        }
    }

    /**
     * Handles gamble outcome situation.
     * @param e GameProtocolEvents object that contains GamblePayload as payload.
     */
    private onGambleOutcome(e: GameProtocolEvents): void {
        this._gamblePayload = e.getPayload();

        if (this._gamblePayload !== undefined && this._gamblePayload.enterGamble) {
            // show gamble
            this.showGamble();
        } else {
            // set gamble outcome
            this._gamble.setOutcome(this._gamblePayload as GamblePayload);

            const win: string =
                this._gamblePayload !== undefined ? (this._gamblePayload.winInfo.get("gamblePaysId") as string) : "";
            this._store.setWin(new WinCounterPayload(win, win));

            if (
                this._gamblePayload !== undefined &&
                this._gamblePayload.state !== undefined &&
                (this._gamblePayload.state === GAMBLE_STATES.WIN || this._gamblePayload.state === GAMBLE_STATES.DRAW)
            ) {
                let soundLevel: number = this._gamblePayload.level !== undefined ? this._gamblePayload.level + 1 : 0;

                if (soundLevel < 2) soundLevel = 2;
                if (soundLevel > 7) soundLevel = 7;

                // this._soundManager.playSound(`gamble${soundLevel}`);
            } else {
                this._soundManager.stopSound("GambleMusicLoop");
            }
        }
    }

    /**
     * Handles collect situation.
     * @param e GameProtocolEvents object that contains CollectPayload data.
     */
    private onCollect(e: GameProtocolEvents): void {
        const collectPayload: CollectPayload = e.getPayload();
        console.log("[db]", "Collect payload", collectPayload);

        this._betPanel.disableAllButtons();
        this._betPanel1.disableAllButtons();
        this._console.disableButtons();
        this.enableFloatingButtons(["exitGame", "menu", "help"], false);

        // this.console.showLabels(["balanceLabel", "balanceValue"]);
        // this.console.hideLabels(["winLabel", "winValue"]);

        if (collectPayload.collectBonusGames) {
            const zeroWinVal: string = Number(0).toFixed(Services.DECIMAL_COUNTER);

            this._store.setWin(new WinCounterPayload(zeroWinVal, zeroWinVal), false);
            this._freeGames.hidePlaque();
            this._winCounter.resetWinCounter();
        }

        if (collectPayload.collectGamble) {
            const zeroWinVal: string = Number(0).toFixed(Services.DECIMAL_COUNTER);

            this._store.setWin(new WinCounterPayload(zeroWinVal, zeroWinVal), false);
            this.hideGamble();
        }

        if (this._isAutoplayEnabled) {
            this.setBetPanelAutoplayState();
            this.callAutoplaySpin();
        } else {
            this.setBetPanelIdleState();
        }

        if (this._isGambleEnabled) {
            this._betPanel.showButtons(["exitGame", "menu", "help"]);
            this._betPanel1.showButtons(["exitGame", "menu", "help"]);
            this._console.showButtons(["exitGame", "menu", "help"]);
            this._betPanel.hideButtons(["enterGamble"]);
            this._betPanel1.hideButtons(["enterGamble"]);

            this.showFloatingButtons(["exitGame", "menu", "help"], true);
        }

        const statusLineText: string = `${TranslationManager.getInstance().getString(
            "status_game_over",
        )} - ${TranslationManager.getInstance().getString(
            "status_place_your_bet",
        )} - ${TranslationManager.getInstance().getString("status_last_win", this._outcomePayload.lastWin)}`;
        this._statusLine.setText(statusLineText);
    }

    /**
     * Handles enter bonus games situation.
     * @param e GameProtocolEvents object that contains BonusGamesDetails data.
     */
    private onEnterBonusGames(e: GameProtocolEvents): void {
        const bonusGamesDetails: BonusGamesDetails = e.getPayload();

        console.log("[db]", "onEnterBonusGames", bonusGamesDetails);

        this._isInBonusGames = true;
        this._store.setIsInFreeGames(true);

        // disable autoplay if it's necessary
        if (this._isAutoplayEnabled) {
            this._wasAutoplayEnabled = true;
            this._isAutoplayEnabled = false;
        }

        // show the bonus games plaque
        const bonusGames: number = Number(bonusGamesDetails.bonusGames);
        const plaquePayload: FreeGamesPlaquePayload = new FreeGamesPlaquePayload(
            FreeGamesPlaqueType.ENTER_BONUS_GAMES,
            bonusGames,
        );

        this._freeGames.showPlaque(plaquePayload);
        this._soundManager.playSound("EnterBonusGames");

        // set the featured details
        this._freeGames.setFeatureWin(bonusGamesDetails.totalWin);
        this._freeGames.setFeatureGames(bonusGamesDetails.usedBonusGames as number, bonusGamesDetails.bonusGames);

        // this.store.setFeatureGame(`${bonusGamesDetails.usedBonusGames} of ${bonusGamesDetails.bonusGames}`);

        this._store.setFeatureWin(bonusGamesDetails.totalWin);

        // change the background
        this._background.showBackground("freeGamesBackground");
        this._reels.showBackground("freeGamesBackground");

        // set status line
        const statusLineText: string = `${TranslationManager.getInstance().getString(
            "status_press_button_to_begin",
        )} - ${TranslationManager.getInstance().getString("status_last_win", this._outcomePayload.lastWin)}`;
        this._statusLine.setText(statusLineText);
    }

    /**
     * Handles help requested situation.
     * @param e GameProtocolEvents object that contains PaytablePayload data.
     */
    private onHelpRequested(e: GameProtocolEvents): void {
        const payload: PaytablePayload = e.getPayload();
        const helpPayload: HelpPayload[] = [];

        for (let i: number = 0; i < payload.tables.length; i++) {
            const payloadTableItem: PaytableTableData = payload.tables[i];

            helpPayload.push({
                tableName: payloadTableItem.name,
                values: payloadTableItem.values,
            });
        }

        this.showHelp(helpPayload);
    }

    /**
     * Handles the visibility change situation.
     * It occurs on tab switch in browser or screen lock on device.
     * @param e DeviceManagerEvents object that contains hidden boolean value as a payload.
     */
    private onVisibilityChange(e: DeviceManagerEvents): void {
        const hidden: boolean = e.getPayload();

        if (hidden && this._isAutoplayEnabled) {
            this._isAutoplayEnabled = false;
        }

        if (this._isSoundEnabled) {
            this._soundManager.mute(hidden);
        }
    }

    /**
     * Handles the network status changed situation.
     * @param e DeviceManagerEvents object that contains network status value as a payload (online | offline)
     */
    private onNetworkStatusChange(e: DeviceManagerEvents): void {
        const status: string = e.getPayload();
        const popup: HTMLElement | null = document.getElementById("popupContainer");

        if (popup !== null) {
            if (status === "offline") {
                if (this._isAutoplayEnabled) {
                    this._isAutoplayEnabled = false;
                }

                popup.style.display = "block";
            } else {
                popup.style.display = "none";
            }
        }
    }

    /**
     * Handles single reel stoped situation.
     * @param e ReelsEvents object.
     */
    private onReelStoped(e: ReelsEvents): void {
        const reelOrderNum: number = e.getPayload();
        const suspenseSound: boolean[] = this._outcomePayload.suspenseSound ?? [];
        const playScatterSound: boolean = suspenseSound[reelOrderNum];

        if (playScatterSound) {
            let numScatters: number = 0;

            // suspenseSound.map((item: boolean, i: number): void =>
            suspenseSound.forEach((item: boolean, i: number) => {
                if (item && i <= reelOrderNum) {
                    numScatters++;
                }
            });

            this._soundManager.playSound(`ScatterTrigReel${numScatters}`);
        } else {
            this._soundManager.playSound(`ReelStop${reelOrderNum + 1}`);
        }

        if (reelOrderNum === 4) {
            this._soundManager.stopSound("ReelSpin");
        }
    }

    /**
     * Handles reels spinning complete situation.
     */
    private onSpinningComplete(): void {
        const win: number = Number(this._outcomePayload.win);

        if (win > 0) {
            const winLines: WinLineDetail[] | undefined = this._outcomePayload.winLines;

            if (winLines !== undefined && winLines.length > 0) {
                winLines.forEach((winDetail: WinLineDetail) => {
                    const symbolDefinition: any = this._reels.getSymbolDefinitionById(winDetail.symbolId);
                    const soundId: string = symbolDefinition.sound;

                    if (soundId !== undefined) {
                        this._soundManager.playSound(soundId);
                    }
                });
            }

            // start win counter
            if (!this._winCounter.isInCounting()) {
                this.setBetPanelWinCountingState();

                this._winCounter.countTo(
                    this._outcomePayload.win,
                    this._outcomePayload.stakePayload.totalBet,
                    this._isAutoplayEnabled,
                );
                this._soundManager.playSound("Counting" + this._winCounterCurrentIndex);
            }
        } else {
            this.onReelsPresentationComplete();
        }
    }

    private onFiveOfAKindAnimBegin(): void {
        this._soundManager.playSound("5ofkind");
    }

    /**
     * Handles reels presentation complete situation.
     * It happens after the all in reels animations has been completed (after symbols explosion in this case).
     */
    private onReelsPresentationComplete(): void {
        console.log("[db]", "Play outcome", this._outcomePayload);

        const win: number = Number(this._outcomePayload.win);
        /* const customData: any = this._outcomePayload.customData;

        if (customData !== undefined) {
            const collectReady: boolean = customData.collectReady;
            const happyDiamondsState: boolean = customData.happyDiamondsState;

            if (happyDiamondsState !== undefined && happyDiamondsState === true) {
                const gameStage: GPGameStage = this._outcomePayload.bonusGamesDetails === undefined ? GPGameStage.BASE_GAME : GPGameStage.FREE_GAME;
                const payload: GPRequestPayload = new GPRequestPayload(gameStage, GPRequestType.PLAY, { happyDiamonds: true });
                this._gp.sendRequest(payload);
                return;
            }

            if (collectReady !== undefined && collectReady === true) {
                if (!this._isGambleEnabled) {
                    const payload: GPRequestPayload = new GPRequestPayload(GPGameStage.BASE_GAME, GPRequestType.COLLECT);
                    this._gp.sendRequest(payload);
                } else {
                    this.setBetPanelCollectState();
                }

                return;
            }
        } */

        // handle bonus games state
        if (this._outcomePayload.bonusGamesDetails !== undefined) {
            const bonusGamesDetails: BonusGamesDetails = this._outcomePayload.bonusGamesDetails;

            // call enter bonus games if it's necessary
            if (bonusGamesDetails.enterBonusGames === true) {
                this.enterBonusGames();
                return;
            }

            // exit bonus games if it's necessary
            if (bonusGamesDetails.exitBonusGames === true) {
                this.exitBonusGames();
                return;
            }

            // shows the plaque with additional bonus games info (if any)
            if (bonusGamesDetails.bonusGameChange !== undefined && bonusGamesDetails.bonusGameChange > 0) {
                this._betPanel.disableAllButtons();
                this._betPanel1.disableAllButtons();
                this.enableFloatingButtons(["exitGame", "menu", "help"], false);

                const plaquePayload: FreeGamesPlaquePayload = new FreeGamesPlaquePayload(
                    FreeGamesPlaqueType.ADDITIONAL_BONUS_GAMES,
                    bonusGamesDetails.bonusGameChange,
                );

                this._freeGames.showPlaque(plaquePayload);
                this._soundManager.playSound("EnterBonusGames");
                return;
            }
        }

        // show bet panel
        if (win === 0) {
            if (this._isAutoplayEnabled) {
                this.setBetPanelAutoplayState();
                this.callAutoplaySpin();
            } else {
                this.setBetPanelIdleState();
            }
        }

        // set status line
        let statusLineText: string = `${TranslationManager.getInstance().getString(
            "status_game_over",
        )} - ${TranslationManager.getInstance().getString(
            "status_place_your_bet",
        )} - ${TranslationManager.getInstance().getString("status_last_win", this._outcomePayload.lastWin)}`;

        if (this._isInBonusGames === true) {
            statusLineText = `${TranslationManager.getInstance().getString(
                "status_game_over",
            )} - ${TranslationManager.getInstance().getString("status_last_win", this._outcomePayload.lastWin)}`;

            this._betPanel1.enableButtons(["spin"]);
        }

        if (this._isAutoplayEnabled === true) {
            statusLineText = `${TranslationManager.getInstance().getString(
                "status_autoplay",
            )} - ${TranslationManager.getInstance().getString("status_last_win", this._outcomePayload.lastWin)}`;
        }

        this._statusLine.setText(statusLineText);
    }

    /**
     * Handles the gamble presentation complete situation.
     */
    private onGamblePresentationComplete(): void {
        console.log("[db]", "gamble payload", this._gamblePayload);

        const state: number | undefined = this._gamblePayload !== undefined ? this._gamblePayload.state : undefined;
        const forceCollect: boolean = this._gamblePayload !== undefined ? this._gamblePayload.forceCollect : false;

        switch (state) {
            case GAMBLE_STATES.WIN:
            case GAMBLE_STATES.DRAW:
                if (!forceCollect) {
                    this._gamble.enableAllButtons();
                    this.setBetPanelGambleState();
                } else {
                    this.hideGamble();
                }
                break;

            case GAMBLE_STATES.LOSE:
                this.hideGamble();
                break;

            default:
                break;
        }
    }

    /**
     * Triggers after the gamble gets some result from game server.
     * It could be "WIN", "DRAW" or "LOSE".
     */
    private onGambleResult(e: GambleEvents): void {
        const paylod: string = e.getPayload();

        switch (paylod) {
            case "WIN":
            case "DRAW":
                this._soundManager.playSound("GambleWin");
                break;

            case "LOSE":
                this._soundManager.playSound("GambleLose");
                break;

            default:
                break;
        }
    }

    /**
     * Handles start switching win lines.
     * It starts win counting at this point.
     * @param e ReelsEvents object.
     */
    private onWinLinesSwitchingBegin(e: ReelsEvents): void {
        /*const cycleNumber: number = e.getPayload();

        if (cycleNumber === 0 && !this._winCounter.isInCounting()) {
            this.setBetPanelWinCountingState();

            this._winCounter.countTo(this._outcomePayload.win, this._outcomePayload.stakePayload.totalBet, this._isAutoplayEnabled);
            //this._soundManager.playSound("CollectStart");

            //if(this._outcomePayload.scatters !== undefined && this._outcomePayload.winLines === undefined){
                this._soundManager.playSound("Counting"+this._winCounterCurrentIndex);
            //}
        }*/
    }

    /**
     * Handles start of win counting situation.
     * @param e WinCounterEvents object that contains WinCounterPayload as a payload.
     */
    private onWinCountingBegin(e: WinCounterEvents): void {
        // this.console.showLabels(["winLabel", "winValue"]);
        // this.console.hideLabels(["balanceValue", "balanceLabel"]);
        //this._soundManager.playSound("Counting"+this._winCounterCurrentIndex);
    }

    /**
     * Handles win counting operation.
     * @param e WinCounterEvents object that contains WincounterPayload as a payload.
     */
    private onWinCounting(e: WinCounterEvents): void {
        // let payload: string = e.getPayload();
        const payload: WinCounterPayload = e.getPayload();
        const win: string = payload.win;

        const updateCredits: boolean = this._outcomePayload.bonusGamesDetails === undefined && !this._isGambleEnabled;
        this._store.setWin(payload, updateCredits);

        if (this._outcomePayload.bonusGamesDetails !== undefined) {
            this._freeGames.countFeatureWin(win);
        }
    }

    /**
     * Handles win counting complete situation.
     * It calls win symbols explosion animations in reels.
     */
    private onWinCountingComplete(): void {
        this._betPanel.disableAllButtons();
        this._betPanel1.disableAllButtons();
        this._console.disableButtons();
        this.enableFloatingButtons(["exitGame", "menu", "help"], false);

        this._store.resetCreditsCounter();

        //this._soundManager.stopSound("CollectStart");
        this._soundManager.stopSound("Counting"+this._winCounterCurrentIndex);

        this._winCounterCurrentIndex = 1;
        this._soundManager.playSound("CollectLoop");
        // this._soundManager.playSound('Morph');

        if (!this._shouldCollectBonus) {
            this.onReelsPresentationComplete();

            const bonusGamesDetails: BonusGamesDetails | undefined = this._outcomePayload.bonusGamesDetails;

            if (
                this._store.getIsInFreeGames() === true &&
                bonusGamesDetails !== undefined &&
                bonusGamesDetails.bonusGameChange !== undefined &&
                bonusGamesDetails.bonusGameChange > 0
            ) {
                return;
            }

            if (
                this._outcomePayload.bonusGamesDetails !== undefined &&
                this._outcomePayload.bonusGamesDetails.usedBonusGames ===
                    this._outcomePayload.bonusGamesDetails.bonusGames &&
                Number(this._outcomePayload.win) > 0
            ) {
                return;
            }
        }

        // set featured total win value
        if (this._outcomePayload.bonusGamesDetails !== undefined) {
            this._freeGames.setFeatureWin(this._outcomePayload.bonusGamesDetails.totalWin);

            this._store.setFeatureWin(this._outcomePayload.bonusGamesDetails.totalWin);

            // collect free games win
            // if (this._outcomePayload.bonusGamesDetails.exitBonusGames === true) {
            if (this._shouldCollectBonus === true) {
                this._soundManager.stopSound("BigWinLoop");

                this._betPanel.disableAllButtons();
                this._betPanel1.disableAllButtons();
                this._console.disableButtons();
                this.enableFloatingButtons(["exitGame", "menu", "help"], false);
                this.setBetPanelCollectState();
                this._betPanel.enableButtons(["collect"]);
                this._betPanel1.enableButtons(["collect"]);

                this._shouldCollectBonus = false;
            } else {
                if (
                    this._isAutoplayEnabled &&
                    this._outcomePayload.bonusGamesDetails.usedBonusGames !== undefined &&
                    this._outcomePayload.bonusGamesDetails.usedBonusGames > 0
                ) {
                    this.setBetPanelAutoplayState();
                    this.callAutoplaySpin();
                } else {
                    this.setBetPanelIdleState();
                }
            }

            return;
        }

        // auto collect win or set bet panel collect state
        if (Number(this._outcomePayload.win) > 0) {
            if (!this._isGambleEnabled) {
                const payload: GPRequestPayload = new GPRequestPayload(GPGameStage.BASE_GAME, GPRequestType.COLLECT);
                this._gp.sendRequest(payload);
            } else {
                this.setBetPanelCollectState();
            }
        }
    }

    /**
     * Handles bonus games plaque visibility change situation.
     * Occurs after the plaque become visible.
     * @param e FreeGamesEvents object that contains FreeGamesPlaqueType as a payload.
     */
    private onFreeGamesPlaqueShow(e: FreeGamesEvents): void {
        this._betPanel.disableAllButtons();
        this._betPanel1.disableAllButtons();
        this._console.disableButtons();
        this.enableFloatingButtons(["exitGame", "menu", "help"], false);
    }

    /**
     * Handles bonus games plaque visibility change situation.
     * Occurs after the plaque hides.
     * @param e FreeGamesEvents object that contains FreeGamesPlaqueType as a payload.
     */
    private onFreeGamesPlaqueHide(e: FreeGamesEvents): void {
        const plaqueType: FreeGamesPlaqueType = e.getPayload();
        const bonusPayload: BonusGamesDetails | undefined = this._outcomePayload.bonusGamesDetails;

        // show the feature details
        if (bonusPayload !== undefined && bonusPayload.enterBonusGames === true) {
            this._freeGames.showFeatureDetails();
        }

        if (plaqueType === FreeGamesPlaqueType.TOTAL_WIN) {
            // nothing to do here
        } else {
            // play bonus games sound loop
            if (plaqueType === FreeGamesPlaqueType.ENTER_BONUS_GAMES) {
                this._soundManager.playSound("BonusGameLoop");
            }

            // set new feature games value
            if (plaqueType === FreeGamesPlaqueType.ADDITIONAL_BONUS_GAMES) {
                const totalBonusGames: number | undefined =
                    this._outcomePayload.bonusGamesDetails !== undefined
                        ? this._outcomePayload.bonusGamesDetails.bonusGames
                        : undefined;

                if (totalBonusGames !== undefined) {
                    this._freeGames.setFeatureGames(undefined, totalBonusGames);
                    // this.store.setFeatureGame(`${this.outcomePayload.bonusGamesDetails.usedBonusGames} of ${totalBonusGames}`);
                }
            }

            // set bet panel state
            if (this._isAutoplayEnabled) {
                this.setBetPanelAutoplayState();
                this.callAutoplaySpin();
            } else {
                this.setBetPanelIdleState();
            }
        }
    }

    private onAutoplayStarterProgressStart(): void {
        this._autoplayTimer = window.setTimeout(() => {
            this._betPanel1.showAnimations(["autoplayAnimation"]);
            this._betPanel1.setButtonsOpacity(["spin"], 0);
            //this._soundManager.playSound("autostart");
            // this.betPanel1.hideButtons(["spin"]);

            this._statusLine.setText(TranslationManager.getInstance().getString("status_hold_for_autoplay"));
        }, 500);
    }

    /**
     * Handles autoplay enabling situation.
     */
    private onAutoplayStarterProgressEnd(): void {
        this._isAutoplayEnabled = true;
        this._wasAutoplayEnabled = false;

        // this.betPanel1.hideAnimations(["autoplayAnimation"]);
        this._soundManager.playSound("autostart");
        this._betPanel1.setButtonsOpacity(["spin"], 1);
        // this.betPanel1.showButtons(["spin"]);

        this._statusLine.clearText();
    }

    private onAutoplayStarterProgressCancel(): void {
        window.clearTimeout(this._autoplayTimer);

        this._betPanel1.hideAnimations(["autoplayAnimation"]);
        this._betPanel1.setButtonsOpacity(["spin"], 1);
        // this.betPanel1.showButtons(["spin"]);

        this._statusLine.clearText();
    }

    /**
     * Handles help button click action.
     * @param e HelpEvents object that contains button name as payload.
     */
    private onHelpButtonClick(e: HelpEvents): void {
        const buttonName: string = e.getPayload();

        this._soundManager.playSound("ButtonClick");

        switch (buttonName) {
            case "next":
                this._help.goToNextPage();
                break;

            case "previous":
                this._help.goToPreviousPage();
                break;

            case "exit":
                if (this._isHelpOpened) {
                    this.hideHelp();
                }
                break;

            default:
                break;
        }
    }

    private onGambleButtonClick(e: GambleEvents): void {
        this._gamble.disableAllButtons();
        this._betPanel.disableAllButtons();
        this._betPanel1.disableAllButtons();
        this._console.disableButtons();
        this.enableFloatingButtons(["exitGame", "menu", "help"], false);

        const buttonName: string = e.getPayload();
        let gambleValue: string = "";

        switch (buttonName) {
            case "btnDiamond":
                gambleValue = "DIAMOND";
                break;

            case "btnHeart":
                gambleValue = "HEART";
                break;

            case "btnSpade":
                gambleValue = "SPADE";
                break;

            case "btnClub":
                gambleValue = "CLUB";
                break;

            case "btnRed":
                gambleValue = "RED";
                break;

            case "btnBlack":
                gambleValue = "BLACK";
                break;

            default:
                break;
        }

        const payload: GPRequestPayload = new GPRequestPayload(GPGameStage.GAMBLE, GPRequestType.PLAY, {
            value: gambleValue,
        });
        this._gp.sendRequest(payload);
    }

    /**
     * Handles bet panel button down action.
     * @param e BetPanelEvents object that contains button name.
     */
    private onBetPanelButtonDown(e: BetPanelEvents): void {
        const buttonName: string = e.getPayload();

        switch (buttonName) {
            case "spin":
                this._autoplayStarter.startProgress();
                break;

            default:
                break;
        }
    }

    /**
     * Handles bet panel button click action.
     * @param e BeTPanelEvents object that contains button name.
     */
    private onBetPanelButtonClick(e: BetPanelEvents): void {
        const buttonName: string = e.getPayload();

        if (buttonName === "spin" && this._isAutoplayEnabled === true) {
            // this.soundManager.playSound("autostart");
        } else if (buttonName === "autoplay") {
            this._soundManager.playSound("autostop");
        } else {
            this._soundManager.playSound("ButtonClick");
        }

        switch (buttonName) {
            case "menu":
                this.showGameSettings();
                break;

            case "spin":
                this._autoplayStarter.cancelProgress();
                this.handleSpinAction();

                if (process.env.ENV !== "local") {
                    const elem: HTMLElement | null = document.getElementById("mainContent");

                    if (elem !== null) {
                        DeviceManager.getInstance().requestFullScreen(elem);
                    }
                }
                break;

            case "autoplay":
                this._isAutoplayEnabled = false;
                this._wasAutoplayEnabled = false;

                this._betPanel.disableAllButtons();
                this._betPanel1.disableAllButtons();
                this._console.disableButtons();
                this.enableFloatingButtons(["exitGame", "menu", "help"], false);
                this._betPanel.hideButtons(["autoplay"]);
                this._betPanel1.hideButtons(["autoplay"]);
                this._betPanel.showButtons(["spin"]);
                this._betPanel1.showButtons(["spin"]);
                break;

            case "speedUp":
                this.handleSpeedUpAction();
                break;

            case "collect":
                this.handleCollectAction();
                break;

            case "enterGamble":
                this._betPanel.disableAllButtons();
                this._betPanel1.disableAllButtons();
                this._console.disableButtons();
                this.enableFloatingButtons(["exitGame", "menu", "help"], false);
                this._betPanel.stopAutoCollectTimer();

                const enterGamble: GPRequestPayload = new GPRequestPayload(GPGameStage.GAMBLE, GPRequestType.ENTER);
                this._gp.sendRequest(enterGamble);
                break;

            case "exitGame":
                if (!this._isInBonusGames && !this._isInGamble) {
                    if (this._isHelpOpened) {
                        this.hideHelp();
                    } else {
                        this._betPanel.disableAllButtons();
                        this._betPanel1.disableAllButtons();
                        this._console.disableButtons();
                        this.enableFloatingButtons(["exitGame", "menu", "help"], false);

                        const exitRequest: GPRequestPayload = new GPRequestPayload(
                            GPGameStage.BASE_GAME,
                            GPRequestType.EXIT,
                        );
                        this._gp.sendRequest(exitRequest);
                    }
                }
                break;

            case "bet":
                this._betPanel.disableAllButtons();
                this._betPanel1.disableAllButtons();
                this._console.disableButtons();
                this.enableFloatingButtons(["exitGame", "menu", "help"], false);

                const minBet: number = Number(this._outcomePayload.stakePayload.minBet);
                const credits: number = this._store.getCreditsNumber();

                if (credits > 0 && credits > minBet) {
                    this._soundManager.playSound("ButtonClick");

                    const request: GPRequestPayload = new GPRequestPayload(GPGameStage.BASE_GAME, GPRequestType.BET);
                    this._gp.sendRequest(request);
                }
                break;

            case "help":
                this._betPanel.disableAllButtons();
                this._betPanel1.disableAllButtons();
                this._console.disableButtons();
                this.enableFloatingButtons(["exitGame", "menu", "help"], false);

                const request: GPRequestPayload = new GPRequestPayload(GPGameStage.BASE_GAME, GPRequestType.PAYTABLE);
                this._gp.sendRequest(request);
                break;

            default:
                break;
        }
    }

    private enterGambleHandler():void {
        this._betPanel.disableAllButtons();
        this._betPanel1.disableAllButtons();
        this._console.disableButtons();
        this.enableFloatingButtons(["exitGame", "menu", "help"], false);
        this._betPanel.stopAutoCollectTimer();

        const enterGamble: GPRequestPayload = new GPRequestPayload(GPGameStage.GAMBLE, GPRequestType.ENTER);
        this._gp.sendRequest(enterGamble);
    }

    /**
     * Handles bet panel's auto collect timeout.
     */
    private onBetPanelAutoCollectTimeout(): void {
        this.handleCollectAction();
    }

    private onConsoleButtonClick(e: ConsoleEvents): void {
        const buttonName: string = e.getPayload();
        // this._soundManager.playSound('ButtonClick');

        switch (buttonName) {
            /* case 'menu':
                this.showGameSettings();
                break;

            case 'exitGame':
                if (!this.isInBonusGames && !this.isInGamble) {
                    if (this.isHelpOpened) {
                        this.hideHelp();
                    } else {
                        this.betPanel.disableAllButtons();
                        this.betPanel1.disableAllButtons();
                        this.console.disableButtons();
                        this.enableFloatingButtons(["exitGame", "menu", "help"], false);

                        let exitRequest: GPRequestPayload = new GPRequestPayload(GPGameStage.BASE_GAME, GPRequestType.EXIT);
                        this.gp.sendRequest(exitRequest);
                    }
                }
                break; */

            case "bet":
            case "betIncrease":
                this._betPanel.disableAllButtons();
                this._betPanel1.disableAllButtons();
                this._console.disableButtons();
                this.enableFloatingButtons(["exitGame", "menu", "help"], false);

                const minBet: number = Number(this._outcomePayload.stakePayload.minBet);
                const credits: number = this._store.getCreditsNumber();

                if (credits > 0 && credits > minBet) {
                    this._soundManager.playSound("ButtonClick");

                    const request: GPRequestPayload = new GPRequestPayload(GPGameStage.BASE_GAME, GPRequestType.BET);
                    this._gp.sendRequest(request);
                }
                break;

            case "betDecrease":
                this._betPanel.disableAllButtons();
                this._betPanel1.disableAllButtons();
                this._console.disableButtons();
                this.enableFloatingButtons(["exitGame", "menu", "help"], false);

                const minBet1: number = Number(this._outcomePayload.stakePayload.minBet);
                const credits1: number = this._store.getCreditsNumber();

                if (credits1 > 0 && credits1 > minBet1) {
                    this._soundManager.playSound("ButtonClick");

                    const request: GPRequestPayload = new GPRequestPayload(
                        GPGameStage.BASE_GAME,
                        GPRequestType.BET,
                        "decrease",
                    );
                    this._gp.sendRequest(request);
                }
                break;

            case "linesIncrease":
                this._betPanel.disableAllButtons();
                this._betPanel1.disableAllButtons();
                this._console.disableButtons();
                this.enableFloatingButtons(["exitGame", "menu", "help"], false);

                this._soundManager.playSound("ButtonClick");

                const requestIL: GPRequestPayload = new GPRequestPayload(GPGameStage.BASE_GAME, GPRequestType.LINES);
                this._gp.sendRequest(requestIL);
                break;

            case "linesDecrease":
                this._betPanel.disableAllButtons();
                this._betPanel1.disableAllButtons();
                this._console.disableButtons();
                this.enableFloatingButtons(["exitGame", "menu", "help"], false);

                this._soundManager.playSound("ButtonClick");

                const requestDL: GPRequestPayload = new GPRequestPayload(
                    GPGameStage.BASE_GAME,
                    GPRequestType.LINES,
                    "decrease",
                );
                this._gp.sendRequest(requestDL);
                break;

            /* case "help":
                this.betPanel.disableAllButtons();
                this.betPanel1.disableAllButtons();
                this.console.disableButtons();
                this.enableFloatingButtons(["exitGame", "menu", "help"], false);

                const request: GPRequestPayload = new GPRequestPayload(GPGameStage.BASE_GAME, GPRequestType.PAYTABLE);
                this.gp.sendRequest(request);
                break; */

            default:
                break;
        }
    }

    private onFloatingButtonsClick(evt: FloatingButtonsEvents): void {
        const buttonName: string = evt.getPayload();
        this._soundManager.playSound("ButtonClick");

        switch (buttonName) {
            case "exitGame":
                if (!this._isInBonusGames && !this._isInGamble) {
                    if (this._isHelpOpened) {
                        this.hideHelp();
                    } else {
                        this._betPanel.disableAllButtons();
                        this._betPanel1.disableAllButtons();
                        this._console.disableButtons();
                        this.enableFloatingButtons(["exitGame", "menu", "help"], false);

                        const exitRequest: GPRequestPayload = new GPRequestPayload(
                            GPGameStage.BASE_GAME,
                            GPRequestType.EXIT,
                        );
                        this._gp.sendRequest(exitRequest);
                    }
                }
                break;

            case "menu":
                this.showGameSettings();
                break;

            case "help":
                this._betPanel.disableAllButtons();
                this._betPanel1.disableAllButtons();
                this._console.disableButtons();
                this.enableFloatingButtons(["exitGame", "menu", "help"], false);

                const request: GPRequestPayload = new GPRequestPayload(GPGameStage.BASE_GAME, GPRequestType.PAYTABLE);
                this._gp.sendRequest(request);
                break;

            case "gambleOn":
                this._floatingButtonGamble.hideButtons(["gambleOn"]);
                this._floatingButtonGamble.showButtons(["gambleOff"]);
                this._isGambleEnabled = false;
                window.sessionStorage.setItem("gamble", "off");
                break;

            case "gambleOff":
                this._floatingButtonGamble.hideButtons(["gambleOff"]);
                this._floatingButtonGamble.showButtons(["gambleOn"]);
                this._isGambleEnabled = true;
                window.sessionStorage.setItem("gamble", "on");
                break;

            case "soundOn":
                this._floatingButtonHome.hideButtons(["soundOn"]);
                this._floatingButtonHome.showButtons(["soundOff"]);
                this._isSoundEnabled = false;
                this._store.setIsSoundEnabled(false);
                this._soundManager.mute(true);
                break;

            case "soundOff":
                this._floatingButtonHome.hideButtons(["soundOff"]);
                this._floatingButtonHome.showButtons(["soundOn"]);
                this._isSoundEnabled = true;
                this._store.setIsSoundEnabled(true);
                this._soundManager.mute(false);
                break;

            default:
                break;
        }
    }

    /**
     * Triggers on sound playback stop.
     * @param e
     */
    private onSoundComplete(e: SoundManagerEvents): void {
        let soundId: string = e.getPayload();
        /*if(soundId.indexOf("Symbol") !== -1){
            soundId = "Symbol";
        }*/

        switch (soundId) {
            case "CollectStart":
                this._soundManager.playSound("CollectLoop");
                break;

            case "GambleStart":
                this._isInGamble ? this._soundManager.playSound("GambleMusicLoop") : null;
                break;
            
            /*case "Symbol":
                if(this._winCounter.isInCounting()){
                    this._soundManager.playSound("Counting"+this._winCounterCurrentIndex);
                }
                break;*/

            case ("Counting"+this._winCounterCurrentIndex):
                this._soundManager.stopSound("Counting"+this._winCounterCurrentIndex);

                if(this._winCounterCurrentIndex >= 4){
                    this._winCounterCurrentIndex = 0;
                }
                this._winCounterCurrentIndex++;
                this._soundManager.playSound("Counting"+this._winCounterCurrentIndex);
                break;

            default:
                // nothing to do here
                break;
        }
    }

    /**
     * Handles spin action.
     * It occurs after the spin button has been pressed.
     */
    private handleSpinAction(): void {
        const stake: number = Number(this._store.getTotalBet());
        const credits: number = this._store.getCreditsNumber();

        if (credits < stake && !this._isInBonusGames) {
            if (this._isAutoplayEnabled) {
                this._isAutoplayEnabled = false;

                this._betPanel.disableAllButtons();
                this._betPanel1.disableAllButtons();
                this._console.disableButtons();
                this.enableFloatingButtons(["exitGame", "menu", "help"], false);
                this.setBetPanelIdleState();
            }

            this._statusLine.setText(TranslationManager.getInstance().getString("status_not_enough_credits"));
            return;
        }

        const isInBonusGames: boolean = this._outcomePayload.bonusGamesDetails !== undefined && this._outcomePayload.bonusGamesDetails.exitBonusGames !== true;
        const gameStage: GPGameStage = isInBonusGames ? GPGameStage.FREE_GAME : GPGameStage.BASE_GAME;
        const request: GPRequestPayload = new GPRequestPayload(gameStage, GPRequestType.PLAY, { autoplay: false });
        this._gp.sendRequest(request);

        if (gameStage === GPGameStage.FREE_GAME && this._wasAutoplayEnabled) {
            this._isAutoplayEnabled = true;
            this._wasAutoplayEnabled = false;
        }

        const zeroWinVal: string = Number(0).toFixed(Services.DECIMAL_COUNTER);

        this._store.setWin(new WinCounterPayload(zeroWinVal, zeroWinVal));
        this._statusLine.clearText();
        this._reels.startSpin();
        this._soundManager.playSound("ReelSpin");

        if (!this._isAutoplayEnabled) {
            this._betPanel.disableAllButtons();
            this._betPanel1.disableAllButtons();
            this._console.disableButtons();
            this.enableFloatingButtons(["exitGame", "menu", "help"], false);
        } else {
            this._betPanel.disableAllButtons();
            this._betPanel1.disableAllButtons();
            this._console.disableButtons();
            this.enableFloatingButtons(["exitGame", "menu", "help"], false);
            this.setBetPanelAutoplayState();
        }
    }

    /**
     * Handles the speed up action.
     * It occurs after the speed up button has been pressed.
     */
    private handleSpeedUpAction(): void {
        this._betPanel.disableAllButtons();
        this._betPanel1.disableAllButtons();
        this._console.disableButtons();

        if (this._reels.isSpinning) {
            this._reels.stopSpin(this._outcomePayload, true);
        } else {
            this.enableFloatingButtons(["exitGame", "menu", "help"], false);
            this._winCounter.stopCounting();
        }
    }

    /**
     * Handles the collect action.
     * It occurs after the collect button has been pressed.
     */
    private handleCollectAction(): void {
        this._betPanel.disableAllButtons();
        this._betPanel1.disableAllButtons();
        this._console.disableButtons();
        this.enableFloatingButtons(["exitGame", "menu", "help"], false);

        let gameStage: GPGameStage =
            this._outcomePayload.bonusGamesDetails !== undefined &&
            this._outcomePayload.bonusGamesDetails.exitBonusGames === true
                ? GPGameStage.FREE_GAME
                : GPGameStage.BASE_GAME;

        if (this._isInGamble) {
            gameStage = GPGameStage.GAMBLE;
        }

        const payload: GPRequestPayload = new GPRequestPayload(gameStage, GPRequestType.COLLECT);

        this._gp.sendRequest(payload);
    }

    /**
     * Handles on game settings button click action.
     * @param e GameSettingsEvent object that contains GameSettingsClickPayload parameter.
     */
    private onGameSettingsButtonClick(e: GameSettingsEvents): void {
        const payload: GameSettingsClickPayload = e.getPayload();
        const buttonName: string = payload.buttonId;

        let request: GPRequestPayload;

        switch (buttonName) {
            case "gamble":
                this._isGambleEnabled = !this._isGambleEnabled;
                this._soundManager.playSound("ButtonClick");
                break;

            case "gamble_on":
                this._isGambleEnabled = true;
                this._soundManager.playSound("ButtonClick");
                break;

            case "gamble_off":
                this._isGambleEnabled = false;
                this._soundManager.playSound("ButtonClick");
                break;

            case "sound":
            case "sound_on":
            case "sound_off":
                this._isSoundEnabled = payload.value === "on";
                this._store.setIsSoundEnabled(payload.value === "on");
                this._soundManager.mute(payload.value === "off");

                if (buttonName !== "sound_off") this._soundManager.playSound("ButtonClick");
                break;

            case "help":
                request = new GPRequestPayload(GPGameStage.BASE_GAME, GPRequestType.PAYTABLE);
                this._gp.sendRequest(request);

                // this.showHelp();
                break;

            case "back":
                this._soundManager.playSound("ButtonClick");
                this.hideGameSettings();
                break;

            case "lines":
                request = new GPRequestPayload(GPGameStage.BASE_GAME, GPRequestType.LINES);
                this._gp.sendRequest(request);
                break;

            case "stake":
                const minBet: number = Number(this._outcomePayload.stakePayload.minBet);
                const credits: number = this._store.getCreditsNumber();

                if (credits > 0 && credits > minBet) {
                    this._soundManager.playSound("ButtonClick");

                    request = new GPRequestPayload(GPGameStage.BASE_GAME, GPRequestType.BET);
                    this._gp.sendRequest(request);
                }
                break;

            default:
                break;
        }
    }

    /**
     * Handles on game settings default values.
     * Updates the flags that controls game settings values. It could be sound and/or gamble values, for example.
     * @param e GameSettingsEvents object that contains map of the default game settings values as a payload.
     */
    private onGameSettingsSetDefaultValues(e: GameSettingsEvents): void {
        const defaultValues: Map<string, string> = e.getPayload();

        if (defaultValues !== undefined) {
            const soundVal: string = defaultValues.has("sound") ? (defaultValues.get("sound") as string) : "";
            const gambleVal: string = defaultValues.has("gamble") ? (defaultValues.get("gamble") as string) : "";

            this._soundManager.mute(soundVal === "off");
            this._isGambleEnabled = gambleVal === "on";
            this._isSoundEnabled = soundVal === "on";
            this._store.setIsSoundEnabled(soundVal === "on");

            if (this._isGambleEnabled === true) {
                this._floatingButtonGamble.showButtons(["gambleOn"]);
                this._floatingButtonGamble.hideButtons(["gambleOff"]);
            } else {
                this._floatingButtonGamble.showButtons(["gambleOff"]);
                this._floatingButtonGamble.hideButtons(["gambleOn"]);
            }
        }
    }

    /* private onGameSettingsVolumeUpdate(e: GameSettingsEvents): void
    {
        const vol: number = e.getPayload();
        this._soundManager.setVolume(vol);

        if (!this._isSoundEnabled && vol > 0) {
            this._isSoundEnabled = true;
            this._soundManager.mute(false);
        }
    } */

    /**
     * Sends the enter bonus games (free spins) request to game protocol.
     */
    private enterBonusGames(): void {
        const request: GPRequestPayload = new GPRequestPayload(GPGameStage.FREE_GAME, GPRequestType.ENTER);
        this._gp.sendRequest(request);
    }

    /**
     * Hides the featured details, shows the total win info and starts the coins shower animation.
     */
    private exitBonusGames(): void {
        this._isInBonusGames = false;
        this._store.setIsInFreeGames(false);

        const totalWin: string =
            this._outcomePayload.bonusGamesDetails !== undefined ? this._outcomePayload.bonusGamesDetails.totalWin : "";
        const plaquePayload: FreeGamesPlaquePayload = new FreeGamesPlaquePayload(
            FreeGamesPlaqueType.TOTAL_WIN,
            undefined,
            totalWin,
            false,
        );

        this._freeGames.hideFetaureDetails();
        this._freeGames.showPlaque(plaquePayload);

        this._soundManager.stopSound("BonusGameLoop");
        this._soundManager.playSound("ExitBonusPopup");

        this._coinsShower.playCoins();

        window.setTimeout((): void => {
            this.afterTotalFeatureWinsShow();
        }, 3500);
    }

    /**
     * Starts with counting total feature win.
     * Switches background to normal games, prepares and shows bet panel, counts the feature win, and stops and plays apropriate sounds.
     */
    private afterTotalFeatureWinsShow(): void {
        const totalWin: number | undefined =
            this._outcomePayload.bonusGamesDetails !== undefined
                ? Number(this._outcomePayload.bonusGamesDetails.totalWin)
                : undefined;

        this._coinsShower.stopCoins();
        this._background.showBackground("gameBackground");
        this._reels.showBackground("background");

        this._betPanel.disableAllButtons();
        this._betPanel1.disableAllButtons();
        this._console.disableButtons();
        this.enableFloatingButtons(["exitGame", "menu", "help"], false);

        if (totalWin === 0) {
            this._winCounter.resetWinCounter();
            this._freeGames.hidePlaque();
            this.setBetPanelIdleState();
            return;
        }

        this.setBetPanelWinCountingState();

        if (totalWin !== undefined) {
            //this._winCounter.countTo(String(totalWin), this._outcomePayload.stakePayload.totalBet, true);
            this._winCounter.countTo(
                String(totalWin),
                this._outcomePayload.stakePayload.totalBet,
                this._isAutoplayEnabled,
                true,
            );
        }

        this._soundManager.playSound("BigWinLoop");
        //this._soundManager.playSound("CollectStart");
        this._soundManager.stopSound("Counting" + this._winCounterCurrentIndex);

        this._shouldCollectBonus = true;
    }

    /**
     * Shows the game settings menu.
     */
    private showGameSettings(): void {
        this._gameSettings.show();
        this._betPanel.disableAllButtons();
        this._betPanel1.disableAllButtons();
        this._betPanel1.hideButtons(["spin"]);
        this._console.disableButtons();
        this.enableFloatingButtons(["exitGame", "menu", "help"], false);
    }

    /**
     * Hides the game settings menu.
     */
    private hideGameSettings(): void {
        this._gameSettings.hide();

        this._betPanel.enableAllButtons();
        this._betPanel1.enableAllButtons();
        this._betPanel1.showButtons(["spin"]);
        this._console.enableButtons();
        this._betPanel.disableButtons(["lines"]);
        this._betPanel1.disableButtons(["lines"]);

        this.enableFloatingButtons(["exitGame", "menu", "help"], true);
    }

    /**
     * Shows the help, but previous hides the game settings.
     * @param payload Help payload map that contains page name as a key and array of HelpPayload objects as a value.
     */
    private showHelp(payload: HelpPayload[]): void {
        this._isHelpOpened = true;
        this.hideGameSettings();
        this._help.show(payload);
        this._reels.hide();

        this.setBetPanelHelpState();
    }

    /**
     * Hides help.
     */
    private hideHelp(): void {
        this._isHelpOpened = false;
        this._help.hide();
        this._reels.show();

        this.setBetPanelIdleState();
        this.showFloatingButtons(["exitGame", "menu", "help"], true);
    }

    /**
     * Sets the bet panel idle state.
     * Spin, menu and exit game buttons will be visible and enabled in regular game.
     * Just spin button will be visible in bonus games.
     */
    private setBetPanelIdleState(): void {
        this._betPanel.disableAllButtons();
        this._betPanel1.disableAllButtons();
        this._console.disableButtons();
        this.enableFloatingButtons(["exitGame", "menu", "help"], false);

        if (!this._isInBonusGames) {
            this._betPanel.enableButtons(["spin", "menu", "exitGame", "bet", "help"]);
            this._betPanel1.enableButtons(["spin", "menu", "exitGame", "bet", "help"]);
            this._console.enableButtons([
                "menu",
                "exitGame",
                "bet",
                "betIncrease",
                "betDecrease",
                "linesIncrease",
                "linesDecrease",
                "help",
            ]);
            this.enableFloatingButtons(["exitGame", "help", "menu"], true);
        } else {
            this._betPanel.enableButtons(["spin"]);
            this._betPanel1.enableButtons(["spin"]);
        }

        this._betPanel.hideButtons(["speedUp", "collect", "autoplay"]);
        this._betPanel1.hideButtons(["speedUp", "collect", "autoplay"]);
        this._betPanel.showButtons(["spin"]);
        this._betPanel1.showButtons(["spin"]);
    }

    /**
     * Sets the bet panel autoplay state.
     * Just autoplay button will be visible.
     */
    private setBetPanelAutoplayState(): void {
        this._betPanel.disableAllButtons();
        this._betPanel1.disableAllButtons();
        this._console.disableButtons();
        this.enableFloatingButtons(["exitGame", "menu", "help"], false);

        this._betPanel.showButtons(["autoplay"]);
        this._betPanel1.showButtons(["autoplay"]);
        this._betPanel.enableButtons(["autoplay"]);
        this._betPanel1.enableButtons(["autoplay"]);

        this._betPanel.hideButtons(["spin", "collect", "speedUp"]);
        this._betPanel1.hideButtons(["spin", "collect", "speedUp"]);
    }

    /**
     * Sets the bet panel win counting state.
     * Only "speed up" button will be visible and enabled.
     */
    private setBetPanelWinCountingState(): void {
        this._betPanel.disableAllButtons();
        this._betPanel1.disableAllButtons();
        this._console.disableButtons();
        this.enableFloatingButtons(["exitGame", "menu", "help"], false);
        this._betPanel.showButtons(["speedUp"]);
        this._betPanel1.showButtons(["speedUp"]);
        this._betPanel.enableButtons(["speedUp"]);
        this._betPanel1.enableButtons(["speedUp"]);
        this._betPanel.hideButtons(["collect", "autoplay", "spin"]);
        this._betPanel1.hideButtons(["collect", "autoplay", "spin"]);
    }

    /**
     * Sets the bet panel collect state.
     * Only collect button will be visible and enabled.
     */
    private setBetPanelCollectState(): void {
        this._betPanel.disableAllButtons();
        this._betPanel1.disableAllButtons();
        this._console.disableButtons();
        this.enableFloatingButtons(["exitGame", "menu", "help"], false);

        if (this._isGambleEnabled) {
            /*
            this._betPanel.showButtons(["collect", "enterGamble"]);
            this._betPanel1.showButtons(["collect", "enterGamble"]);
            this._betPanel.enableButtons(["collect", "enterGamble"]);
            this._betPanel1.enableButtons(["collect", "enterGamble"]);
            this._betPanel.hideButtons(["exitGame", "menu", "help"]);
            this._betPanel1.hideButtons(["exitGame", "menu", "help"]);
            this._console.hideButtons(["exitGame", "menu", "help"]);
            this.showFloatingButtons(["exitGame", "menu", "help"], false);

            if (this._isAutoplayEnabled) {
                this._betPanel.startAutoCollectTimer();
            }

            const statusLineText: string = `${TranslationManager.getInstance().getString(
                "status_gamble_up",
            )} - ${TranslationManager.getInstance().getString("status_last_win", this._outcomePayload.lastWin)}`;
            this._statusLine.setText(statusLineText);
            */
           this.enterGambleHandler();
        } else {
            this._betPanel.showButtons(["collect"]);
            this._betPanel1.showButtons(["collect"]);
            this._betPanel.enableButtons(["collect"]);
            this._betPanel1.enableButtons(["collect"]);

            const statusLineText: string = `${TranslationManager.getInstance().getString(
                "status_press_button_to_collect",
            )} - ${TranslationManager.getInstance().getString("status_last_win", this._outcomePayload.lastWin)}`;
            this._statusLine.setText(statusLineText);
        }

        this._betPanel.hideButtons(["spin", "speedUp", "autoplay"]);
        this._betPanel1.hideButtons(["spin", "speedUp", "autoplay"]);
    }

    /**
     * Sets the bet panel help state.
     * Only shows and enables the exit button.
     */
    private setBetPanelHelpState(): void {
        this._betPanel.disableAllButtons();
        this._betPanel1.disableAllButtons();
        this._console.disableButtons();
        this.enableFloatingButtons(["exitGame", "menu", "help"], false);
        this._betPanel.enableButtons(["exitGame"]);
        this._betPanel1.enableButtons(["exitGame"]);
        this._console.enableButtons(["exitGame"]);
        this._betPanel.hideButtons(["spin"]);
        this._betPanel1.hideButtons(["spin"]);

        this.enableFloatingButtons(["exitGame"], true);
        this.showFloatingButtons(["exitGame", "menu", "help"], false);

        this._statusLine.clearText();
    }

    /**
     * Sets the bet panel gamble mode.
     * Only shows the collect button.
     */
    private setBetPanelGambleState(): void {
        this._betPanel.disableAllButtons();
        this._betPanel1.disableAllButtons();
        this._console.disableButtons();
        this.enableFloatingButtons(["exitGame", "menu", "help"], false);
        this._betPanel.enableButtons(["collect"]);
        this._betPanel1.enableButtons(["collect"]);
        this._betPanel.showButtons(["collect"]);
        this._betPanel1.showButtons(["collect"]);

        this._betPanel.hideButtons(["exitGame", "help", "menu"]);
        this._betPanel1.hideButtons(["exitGame", "help", "menu"]);
        this._console.hideButtons(["exitGame", "help", "menu"]);
        this.showFloatingButtons(["exitGame", "help", "menu", "soundOn", "soundOff"], false);

        this._statusLine.clearText();
    }

    private callAutoplaySpin(): void {
        window.setTimeout((): void => {
            this.handleSpinAction();
        }, 500);
    }

    private showFloatingButtons(buttonIDs: string[], show: boolean): void {
        buttonIDs.forEach((buttonId: string) => {
            switch (buttonId) {
                case "exitGame":
                    if (show) {
                        this._floatingButtonHome.showButtons([buttonId]);
                        this._floatingButtonHome.showButtons([this._isSoundEnabled === true ? "soundOn" : "soundOff"]);
                    } else {
                        this._floatingButtonHome.hideButtons([buttonId]);
                        // this._floatingButtonHome.hideButtons(["soundOn", "soundOff"]);
                    }
                    break;

                case "help":
                    if (show) {
                        this._floatingButtonHelp.showButtons([buttonId]);
                    } else {
                        this._floatingButtonHelp.hideButtons([buttonId]);
                    }
                    break;

                case "menu":
                    if (show) {
                        this._floatingButtonGamble.showButtons([
                            this._isGambleEnabled === true ? "gambleOn" : "gambleOff",
                        ]);
                    } else {
                        this._floatingButtonGamble.hideButtons(["gambleOn", "gambleOff"]);
                    }
                    break;

                case "soundOn":
                case "soundOff":
                    this._floatingButtonHome.hideButtons([buttonId]);
                    break;

                default:
                    break;
            }
        });
    }

    private enableFloatingButtons(buttonIDs: string[], enable: boolean): void {
        buttonIDs.forEach((buttonId: string) => {
            switch (buttonId) {
                case "exitGame":
                    if (enable) {
                        this._floatingButtonHome.enableButtons([buttonId]);
                        this._floatingButtonHome.enableButtons(["soundOn", "soundOff"]);
                    } else {
                        this._floatingButtonHome.disableButtons([buttonId]);
                        // this.floatingButtonHome.disableButtons(["soundOn", "soundOff"]);
                    }
                    break;

                case "help":
                    if (enable) {
                        this._floatingButtonHelp.enableButtons([buttonId]);
                    } else {
                        this._floatingButtonHelp.disableButtons([buttonId]);
                    }
                    break;

                case "menu":
                    if (enable) {
                        this._floatingButtonGamble.enableButtons(["gambleOn", "gambleOff"]);
                    } else {
                        this._floatingButtonGamble.disableButtons(["gambleOn", "gambleOff"]);
                    }
                    break;

                default:
                    break;
            }
        });
    }
}
