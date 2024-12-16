export {}
declare global {
    export interface IObjectOptions {
        ktype?: string,
    }

    export interface IGroupOptions {
        ktype?: string
    }

    export interface IText {
        abc?: string,
        setBold(): void
    }
}

declare var IObjectOptions: {
    ktype?: any,
}
declare var IGroupOptions: {
    ktype?: string
}
declare var IText: {
    abc?: string,
    setBold(): void
}

declare var textCurved: any
