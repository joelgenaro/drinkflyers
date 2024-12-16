export { }
declare global {
    namespace fabric {
        export interface textCurved {

        }
        export interface IObjectOptions {
            ktype?: string,
            parentWidth?: any,
            parentHight?: any,
            parentX?: any,
            parentY?: any,
            sepod_box_id?: any,
            sepod_id?: any,
            formFixLength?: any,
            fromLabel?: any,
            formRequired?: any,
            formDefaultText?: any,
            formMaxSize?: any,
            formAllowType?: any,
            lib_file_id?: any,
            fontId?: any,
            pFontId?: any,
            fpersonalize?: any,
            imgScaleX?: any,
            imgScaleY?: any,
            imgWidth?: any,
            imgHeight?: any
            textLimit?: any
            personalize?: any
            originalLeft?: number
            originalTop?: number
            resolution?: number
            fileName?: any

        }
        export interface IGroupOptions {
            ktype?: string
            parentX?: any,
            parentY?: any,
            sepod_id?: any,
            clipName?: any,
        }
    }
}

// declare var IObjectOptions: {
//     ktype: string
// }
// declare var IGroupOptions: {
//     ktype: string
// }
