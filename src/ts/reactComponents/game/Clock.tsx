import * as React from 'react';

interface IProps {}

interface IState {
    time: string;
}

export class Clock extends React.Component<IProps, IState>
{
    private _intervalId: number | undefined = undefined;

    constructor(props: IProps)
    {
        super(props);

        this.state = {
            time: this.getCurrentTime()
        };
    }

    private getCurrentTime(): string
    {
        let time = new Date();
        let hours: string = time.getHours().toString();
        let minutes: string = time.getMinutes().toString();

        if (hours.length < 2) hours = `0${hours}`;
        if (minutes.length < 2) minutes = `0${minutes}`;

        return `${hours}:${minutes}`;
    }

    private updateCurrentTime(): void
    {
        this.setState({ time: this.getCurrentTime() });
    }

    componentDidMount()
    {
        this._intervalId = window.setInterval((): void =>
        {
            this.updateCurrentTime();
        }, 3000);
    }

    componentWillUnmount()
    {
        if (this._intervalId !== undefined)
        {
            window.clearInterval(this._intervalId);
            this._intervalId = undefined;
        }
    }

    render()
    {
        return (
            <div className="clock">{ this.state.time }</div>
        );
    }
}
