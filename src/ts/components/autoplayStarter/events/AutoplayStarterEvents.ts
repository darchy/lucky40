import { BaseEvent } from "nzl_fwk";

export class AutoplayStarterEvents extends BaseEvent {
    public static PROGRESS_BEGIN: string = "APLS:PROGRESS_BEGIN";

    public static PROGRESS_END: string = "APLS:PROGRESS_END";

    public static PROGRESS_CANCEL: string = "APLS:PROGRESS_CANCEL";
}
