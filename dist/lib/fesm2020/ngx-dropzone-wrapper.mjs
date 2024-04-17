import * as i0 from '@angular/core';
import { InjectionToken, EventEmitter, PLATFORM_ID, Directive, Inject, Optional, Input, Output, Component, ViewEncapsulation, ViewChild, NgModule } from '@angular/core';
import * as i1 from '@angular/common';
import { isPlatformBrowser, CommonModule } from '@angular/common';

const DROPZONE_CONFIG = new InjectionToken('DROPZONE_CONFIG');
const DropzoneEvents = [
    'error',
    'success',
    'sending',
    'canceled',
    'complete',
    'processing',
    'drop',
    'dragStart',
    'dragEnd',
    'dragEnter',
    'dragOver',
    'dragLeave',
    'thumbnail',
    'addedFile',
    'addedFiles',
    'removedFile',
    'uploadProgress',
    'maxFilesReached',
    'maxFilesExceeded',
    'errorMultiple',
    'successMultiple',
    'sendingMultiple',
    'canceledMultiple',
    'completeMultiple',
    'processingMultiple',
    'reset',
    'queueComplete',
    'totalUploadProgress'
];
class DropzoneConfig {
    constructor(config = {}) {
        this.assign(config);
    }
    assign(config = {}, target) {
        target = target || this;
        for (const key in config) {
            if (config[key] != null && !(Array.isArray(config[key])) &&
                typeof config[key] === 'object' && !(config[key] instanceof HTMLElement)) {
                target[key] = {};
                this.assign(config[key], target[key]);
            }
            else {
                target[key] = config[key];
            }
        }
    }
}

class DropzoneDirective {
    constructor(zone, renderer, elementRef, differs, platformId, defaults) {
        this.zone = zone;
        this.renderer = renderer;
        this.elementRef = elementRef;
        this.differs = differs;
        this.platformId = platformId;
        this.defaults = defaults;
        this.configDiff = null;
        this.disabled = false;
        this.DZ_INIT = new EventEmitter();
        this.DZ_ERROR = new EventEmitter();
        this.DZ_SUCCESS = new EventEmitter();
        this.DZ_SENDING = new EventEmitter();
        this.DZ_CANCELED = new EventEmitter();
        this.DZ_COMPLETE = new EventEmitter();
        this.DZ_PROCESSING = new EventEmitter();
        this.DZ_DROP = new EventEmitter();
        this.DZ_DRAGSTART = new EventEmitter();
        this.DZ_DRAGEND = new EventEmitter();
        this.DZ_DRAGENTER = new EventEmitter();
        this.DZ_DRAGOVER = new EventEmitter();
        this.DZ_DRAGLEAVE = new EventEmitter();
        this.DZ_THUMBNAIL = new EventEmitter();
        this.DZ_ADDEDFILE = new EventEmitter();
        this.DZ_ADDEDFILES = new EventEmitter();
        this.DZ_REMOVEDFILE = new EventEmitter();
        this.DZ_UPLOADPROGRESS = new EventEmitter();
        this.DZ_MAXFILESREACHED = new EventEmitter();
        this.DZ_MAXFILESEXCEEDED = new EventEmitter();
        this.DZ_ERRORMULTIPLE = new EventEmitter();
        this.DZ_SUCCESSMULTIPLE = new EventEmitter();
        this.DZ_SENDINGMULTIPLE = new EventEmitter();
        this.DZ_CANCELEDMULTIPLE = new EventEmitter();
        this.DZ_COMPLETEMULTIPLE = new EventEmitter();
        this.DZ_PROCESSINGMULTIPLE = new EventEmitter();
        this.DZ_RESET = new EventEmitter();
        this.DZ_QUEUECOMPLETE = new EventEmitter();
        this.DZ_TOTALUPLOADPROGRESS = new EventEmitter();
        if (isPlatformBrowser(this.platformId)) {
            import('dropzone').then(dropzone => {
                this.Dropzone = dropzone;
                this.Dropzone.autoDiscover = false;
            });
        }
    }
    ngOnInit() {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }
        const params = new DropzoneConfig(this.defaults);
        params.assign(this.config); // Custom configuration
        this.renderer.addClass(this.elementRef.nativeElement, (params.maxFiles === 1) ? 'dz-single' : 'dz-multiple');
        this.renderer.removeClass(this.elementRef.nativeElement, (params.maxFiles === 1) ? 'dz-multiple' : 'dz-single');
        this.zone.runOutsideAngular(() => {
            this.instance = new this.Dropzone(this.elementRef.nativeElement, params);
        });
        if (this.disabled) {
            this.instance.disable();
        }
        if (this.DZ_INIT.observers.length) {
            this.zone.run(() => {
                this.DZ_INIT.emit(this.instance);
            });
        }
        // Add auto reset handling for events
        this.instance.on('success', () => {
            if (params.autoReset != null) {
                setTimeout(() => this.reset(), params.autoReset);
            }
        });
        this.instance.on('error', () => {
            if (params.errorReset != null) {
                setTimeout(() => this.reset(), params.errorReset);
            }
        });
        this.instance.on('canceled', () => {
            if (params.cancelReset != null) {
                setTimeout(() => this.reset(), params.cancelReset);
            }
        });
        // Add native Dropzone event handling
        DropzoneEvents.forEach((eventName) => {
            this.instance.on(eventName.toLowerCase(), (...args) => {
                args = (args.length === 1) ? args[0] : args;
                const output = `DZ_${eventName.toUpperCase()}`;
                const emitter = this[output];
                if (emitter.observers.length > 0) {
                    this.zone.run(() => {
                        emitter.emit(args);
                    });
                }
            });
        });
        if (!this.configDiff) {
            this.configDiff = this.differs.find(this.config || {}).create();
            this.configDiff.diff(this.config || {});
        }
    }
    ngOnDestroy() {
        if (this.instance) {
            this.zone.runOutsideAngular(() => {
                this.instance.destroy();
            });
            this.instance = null;
        }
    }
    ngDoCheck() {
        if (!this.disabled && this.configDiff) {
            const changes = this.configDiff.diff(this.config || {});
            if (changes && this.instance) {
                this.ngOnDestroy();
                this.ngOnInit();
            }
        }
    }
    ngOnChanges(changes) {
        if (this.instance && changes['disabled']) {
            if (changes['disabled'].currentValue !== changes['disabled'].previousValue) {
                if (changes['disabled'].currentValue === false) {
                    this.zone.runOutsideAngular(() => {
                        this.instance.enable();
                    });
                }
                else if (changes['disabled'].currentValue === true) {
                    this.zone.runOutsideAngular(() => {
                        this.instance.disable();
                    });
                }
            }
        }
    }
    dropzone() {
        return this.instance;
    }
    reset(cancel) {
        if (this.instance) {
            this.zone.runOutsideAngular(() => {
                this.instance.removeAllFiles(cancel);
            });
        }
    }
}
DropzoneDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: DropzoneDirective, deps: [{ token: i0.NgZone }, { token: i0.Renderer2 }, { token: i0.ElementRef }, { token: i0.KeyValueDiffers }, { token: PLATFORM_ID }, { token: DROPZONE_CONFIG, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
DropzoneDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.12", type: DropzoneDirective, selector: "[dropzone]", inputs: { disabled: "disabled", config: ["dropzone", "config"] }, outputs: { DZ_INIT: "init", DZ_ERROR: "error", DZ_SUCCESS: "success", DZ_SENDING: "sending", DZ_CANCELED: "canceled", DZ_COMPLETE: "complete", DZ_PROCESSING: "processing", DZ_DROP: "drop", DZ_DRAGSTART: "dragStart", DZ_DRAGEND: "dragEnd", DZ_DRAGENTER: "dragEnter", DZ_DRAGOVER: "dragOver", DZ_DRAGLEAVE: "dragLeave", DZ_THUMBNAIL: "thumbnail", DZ_ADDEDFILE: "addedFile", DZ_ADDEDFILES: "addedFiles", DZ_REMOVEDFILE: "removedFile", DZ_UPLOADPROGRESS: "uploadProgress", DZ_MAXFILESREACHED: "maxFilesReached", DZ_MAXFILESEXCEEDED: "maxFilesExceeded", DZ_ERRORMULTIPLE: "errorMultiple", DZ_SUCCESSMULTIPLE: "successMultiple", DZ_SENDINGMULTIPLE: "sendingMultiple", DZ_CANCELEDMULTIPLE: "canceledMultiple", DZ_COMPLETEMULTIPLE: "completeMultiple", DZ_PROCESSINGMULTIPLE: "processingMultiple", DZ_RESET: "reset", DZ_QUEUECOMPLETE: "queueComplete", DZ_TOTALUPLOADPROGRESS: "totalUploadProgress" }, exportAs: ["ngxDropzone"], usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: DropzoneDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[dropzone]',
                    exportAs: 'ngxDropzone'
                }]
        }], ctorParameters: function () { return [{ type: i0.NgZone }, { type: i0.Renderer2 }, { type: i0.ElementRef }, { type: i0.KeyValueDiffers }, { type: Object, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [DROPZONE_CONFIG]
                }] }]; }, propDecorators: { disabled: [{
                type: Input
            }], config: [{
                type: Input,
                args: ['dropzone']
            }], DZ_INIT: [{
                type: Output,
                args: ['init']
            }], DZ_ERROR: [{
                type: Output,
                args: ['error']
            }], DZ_SUCCESS: [{
                type: Output,
                args: ['success']
            }], DZ_SENDING: [{
                type: Output,
                args: ['sending']
            }], DZ_CANCELED: [{
                type: Output,
                args: ['canceled']
            }], DZ_COMPLETE: [{
                type: Output,
                args: ['complete']
            }], DZ_PROCESSING: [{
                type: Output,
                args: ['processing']
            }], DZ_DROP: [{
                type: Output,
                args: ['drop']
            }], DZ_DRAGSTART: [{
                type: Output,
                args: ['dragStart']
            }], DZ_DRAGEND: [{
                type: Output,
                args: ['dragEnd']
            }], DZ_DRAGENTER: [{
                type: Output,
                args: ['dragEnter']
            }], DZ_DRAGOVER: [{
                type: Output,
                args: ['dragOver']
            }], DZ_DRAGLEAVE: [{
                type: Output,
                args: ['dragLeave']
            }], DZ_THUMBNAIL: [{
                type: Output,
                args: ['thumbnail']
            }], DZ_ADDEDFILE: [{
                type: Output,
                args: ['addedFile']
            }], DZ_ADDEDFILES: [{
                type: Output,
                args: ['addedFiles']
            }], DZ_REMOVEDFILE: [{
                type: Output,
                args: ['removedFile']
            }], DZ_UPLOADPROGRESS: [{
                type: Output,
                args: ['uploadProgress']
            }], DZ_MAXFILESREACHED: [{
                type: Output,
                args: ['maxFilesReached']
            }], DZ_MAXFILESEXCEEDED: [{
                type: Output,
                args: ['maxFilesExceeded']
            }], DZ_ERRORMULTIPLE: [{
                type: Output,
                args: ['errorMultiple']
            }], DZ_SUCCESSMULTIPLE: [{
                type: Output,
                args: ['successMultiple']
            }], DZ_SENDINGMULTIPLE: [{
                type: Output,
                args: ['sendingMultiple']
            }], DZ_CANCELEDMULTIPLE: [{
                type: Output,
                args: ['canceledMultiple']
            }], DZ_COMPLETEMULTIPLE: [{
                type: Output,
                args: ['completeMultiple']
            }], DZ_PROCESSINGMULTIPLE: [{
                type: Output,
                args: ['processingMultiple']
            }], DZ_RESET: [{
                type: Output,
                args: ['reset']
            }], DZ_QUEUECOMPLETE: [{
                type: Output,
                args: ['queueComplete']
            }], DZ_TOTALUPLOADPROGRESS: [{
                type: Output,
                args: ['totalUploadProgress']
            }] } });

class DropzoneComponent {
    constructor(platformId) {
        this.platformId = platformId;
        this.disabled = false;
        this.message = 'Click or drag files to upload';
        this.placeholder = '';
        this.useDropzoneClass = true;
        this.DZ_INIT = new EventEmitter();
        this.DZ_ERROR = new EventEmitter();
        this.DZ_SUCCESS = new EventEmitter();
        this.DZ_SENDING = new EventEmitter();
        this.DZ_CANCELED = new EventEmitter();
        this.DZ_COMPLETE = new EventEmitter();
        this.DZ_PROCESSING = new EventEmitter();
        this.DZ_DROP = new EventEmitter();
        this.DZ_DRAGSTART = new EventEmitter();
        this.DZ_DRAGEND = new EventEmitter();
        this.DZ_DRAGENTER = new EventEmitter();
        this.DZ_DRAGOVER = new EventEmitter();
        this.DZ_DRAGLEAVE = new EventEmitter();
        this.DZ_THUMBNAIL = new EventEmitter();
        this.DZ_ADDEDFILE = new EventEmitter();
        this.DZ_ADDEDFILES = new EventEmitter();
        this.DZ_REMOVEDFILE = new EventEmitter();
        this.DZ_UPLOADPROGRESS = new EventEmitter();
        this.DZ_MAXFILESREACHED = new EventEmitter();
        this.DZ_MAXFILESEXCEEDED = new EventEmitter();
        this.DZ_ERRORMULTIPLE = new EventEmitter();
        this.DZ_SUCCESSMULTIPLE = new EventEmitter();
        this.DZ_SENDINGMULTIPLE = new EventEmitter();
        this.DZ_CANCELEDMULTIPLE = new EventEmitter();
        this.DZ_COMPLETEMULTIPLE = new EventEmitter();
        this.DZ_PROCESSINGMULTIPLE = new EventEmitter();
        this.DZ_RESET = new EventEmitter();
        this.DZ_QUEUECOMPLETE = new EventEmitter();
        this.DZ_TOTALUPLOADPROGRESS = new EventEmitter();
    }
    ngOnInit() {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }
        window.setTimeout(() => {
            DropzoneEvents.forEach((eventName) => {
                if (this.directiveRef) {
                    const output = `DZ_${eventName.toUpperCase()}`;
                    const directiveOutput = output;
                    const componentOutput = output;
                    this.directiveRef[directiveOutput] = this[componentOutput];
                }
            });
        }, 0);
    }
    getPlaceholder() {
        return 'url(' + encodeURI(this.placeholder) + ')';
    }
}
DropzoneComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: DropzoneComponent, deps: [{ token: PLATFORM_ID }], target: i0.ɵɵFactoryTarget.Component });
DropzoneComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.12", type: DropzoneComponent, selector: "dropzone", inputs: { disabled: "disabled", config: "config", message: "message", placeholder: "placeholder", useDropzoneClass: "useDropzoneClass" }, outputs: { DZ_INIT: "init", DZ_ERROR: "error", DZ_SUCCESS: "success", DZ_SENDING: "sending", DZ_CANCELED: "canceled", DZ_COMPLETE: "complete", DZ_PROCESSING: "processing", DZ_DROP: "drop", DZ_DRAGSTART: "dragStart", DZ_DRAGEND: "dragEnd", DZ_DRAGENTER: "dragEnter", DZ_DRAGOVER: "dragOver", DZ_DRAGLEAVE: "dragLeave", DZ_THUMBNAIL: "thumbnail", DZ_ADDEDFILE: "addedFile", DZ_ADDEDFILES: "addedFiles", DZ_REMOVEDFILE: "removedFile", DZ_UPLOADPROGRESS: "uploadProgress", DZ_MAXFILESREACHED: "maxFilesReached", DZ_MAXFILESEXCEEDED: "maxFilesExceeded", DZ_ERRORMULTIPLE: "errorMultiple", DZ_SUCCESSMULTIPLE: "successMultiple", DZ_SENDINGMULTIPLE: "sendingMultiple", DZ_CANCELEDMULTIPLE: "canceledMultiple", DZ_COMPLETEMULTIPLE: "completeMultiple", DZ_PROCESSINGMULTIPLE: "processingMultiple", DZ_RESET: "reset", DZ_QUEUECOMPLETE: "queueComplete", DZ_TOTALUPLOADPROGRESS: "totalUploadProgress" }, viewQueries: [{ propertyName: "directiveRef", first: true, predicate: DropzoneDirective, descendants: true, static: true }], exportAs: ["ngxDropzone"], ngImport: i0, template: "<div class=\"dz-wrapper\" [class.dropzone]=\"useDropzoneClass\" [dropzone]=\"config\" [disabled]=\"disabled\" (init)=\"DZ_INIT.emit($event)\">\n  <div class=\"dz-message\" [class.disabled]=\"disabled\" [class.dz-placeholder]=\"placeholder\">\n    <div class=\"dz-text\" [innerHTML]=\"config?.dictDefaultMessage || message\"></div>\n\n    <div *ngIf=\"placeholder\" class=\"dz-image\" [style.background-image]=\"getPlaceholder()\"></div>\n  </div>\n\n  <ng-content></ng-content>\n</div>\n", styles: ["dropzone{display:block;width:100%;height:auto}dropzone[fxflex]{display:flex;flex-direction:inherit;min-width:0;min-height:0}dropzone[fxflex]>.dropzone.dz-wrapper{flex:1 1 auto;min-width:0;min-height:0;-webkit-box-flex:1}dropzone[fxlayout]{align-items:inherit;align-content:inherit;justify-content:inherit;-webkit-box-align:inherit;-webkit-box-pack:inherit}dropzone[fxlayout]>.dropzone.dz-wrapper.dz-single{display:flex;flex-direction:column;align-items:center;align-content:center;justify-content:center;-webkit-box-align:center;-webkit-box-pack:center}dropzone[fxlayout]>.dropzone.dz-wrapper.dz-multiple{display:flex;flex-flow:row wrap;align-items:flex-start;align-content:flex-start;justify-content:space-between;-webkit-box-align:flex-start;-webkit-box-pack:flex-start}dropzone>.dropzone.dz-wrapper{position:relative;overflow:auto;width:100%;min-height:0;max-height:100%;padding:0;border:none;color:#666;background:transparent}dropzone>.dropzone.dz-wrapper .dz-message{position:relative;display:inline-block;overflow:auto;width:calc(100% - 16px);min-width:calc(100% - 16px);min-height:40px;max-width:calc(100% - 16px);max-height:100%;margin:8px;border:2px dashed #aaa;background-color:#eee}dropzone>.dropzone.dz-wrapper .dz-message .dz-text{position:absolute;top:50%;width:100%;padding:8px 16px;text-align:center;transform:translateY(-50%)}dropzone>.dropzone.dz-wrapper .dz-message .dz-image{width:100%;height:100%;background-size:contain;background-repeat:no-repeat;background-position:50% 50%}dropzone>.dropzone.dz-wrapper .dz-message.disabled{cursor:not-allowed}dropzone>.dropzone.dz-wrapper .dz-message.disabled .dz-text{opacity:.5}dropzone>.dropzone.dz-wrapper .dz-message.dz-placeholder{border-color:rgba(#aaa,0)}dropzone>.dropzone.dz-wrapper .dz-message.dz-placeholder .dz-text{position:absolute;z-index:1;top:0;right:10%;left:10%;opacity:0;font-weight:700;background-color:rgba(#fff,.5);transform:translateY(-50%);transition:filter .25s ease-in-out,opacity .25s ease-in-out,border-color .25s ease-in-out}dropzone>.dropzone.dz-wrapper .dz-message.dz-placeholder:hover:not(.disabled){border-color:#aaa}dropzone>.dropzone.dz-wrapper .dz-message.dz-placeholder:hover:not(.disabled) .dz-text{opacity:1}dropzone>.dropzone.dz-wrapper .dz-message.dz-placeholder:hover:not(.disabled) .dz-image{filter:blur(8px)}dropzone>.dropzone.dz-wrapper .dz-preview{margin:8px}dropzone>.dropzone.dz-wrapper .dz-preview .dz-details{padding:24px}dropzone>.dropzone.dz-wrapper .dz-preview .dz-progress{width:80%;margin-left:-40%;border:1px solid #aaa;border-radius:4px}dropzone>.dropzone.dz-wrapper .dz-preview .dz-progress .dz-upload{background-color:#666}dropzone>.dropzone.dz-wrapper .dz-preview .dz-filename span{display:block;overflow:hidden;width:100%;max-width:100%;text-overflow:ellipsis}dropzone>.dropzone.dz-wrapper .dz-preview .dz-filename span:hover{overflow:visible;white-space:normal;word-wrap:break-word}dropzone>.dropzone.dz-wrapper.dz-single .dz-message{width:100%;height:100%}dropzone>.dropzone.dz-wrapper.dz-single.dz-started .dz-message{display:none}dropzone>.dropzone.dz-wrapper.dz-single .dz-preview{width:calc(100% - 16px);height:100%}dropzone>.dropzone.dz-wrapper.dz-single .dz-preview .dz-image{width:100%;height:100%;border-radius:0}dropzone>.dropzone.dz-wrapper.dz-single .dz-preview .dz-image img{display:block;width:100%;height:auto;margin:0}dropzone>.dropzone.dz-wrapper.dz-single .dz-error-message{top:50%;left:50%;transform:translate(-50%) translateY(100%)}dropzone>.dropzone.dz-wrapper.dz-multiple.dz-started .dz-message{display:inline-block}\n", "@keyframes passing-through{0%{opacity:0;transform:translateY(40px)}30%,70%{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-40px)}}@keyframes slide-in{0%{opacity:0;transform:translateY(40px)}30%{opacity:1;transform:translateY(0)}}@keyframes pulse{0%{transform:scale(1)}10%{transform:scale(1.1)}20%{transform:scale(1)}}.dropzone,.dropzone *{box-sizing:border-box}.dropzone{min-height:150px;border:2px solid rgba(0,0,0,.3);background:#fff;padding:20px}.dropzone.dz-clickable{cursor:pointer}.dropzone.dz-clickable *{cursor:default}.dropzone.dz-clickable .dz-message,.dropzone.dz-clickable .dz-message *{cursor:pointer}.dropzone.dz-started .dz-message{display:none}.dropzone.dz-drag-hover{border-style:solid}.dropzone.dz-drag-hover .dz-message{opacity:.5}.dropzone .dz-message{text-align:center;margin:2em 0}.dropzone .dz-message .dz-button{background:none;color:inherit;border:none;padding:0;font:inherit;cursor:pointer;outline:inherit}.dropzone .dz-preview{position:relative;display:inline-block;vertical-align:top;margin:16px;min-height:100px}.dropzone .dz-preview:hover{z-index:1000}.dropzone .dz-preview.dz-file-preview .dz-image{border-radius:20px;background:#999;background:linear-gradient(to bottom,#eee,#ddd)}.dropzone .dz-preview.dz-file-preview .dz-details{opacity:1}.dropzone .dz-preview.dz-image-preview{background:#fff}.dropzone .dz-preview.dz-image-preview .dz-details{transition:opacity .2s linear}.dropzone .dz-preview .dz-remove{font-size:14px;text-align:center;display:block;cursor:pointer;border:none}.dropzone .dz-preview .dz-remove:hover{text-decoration:underline}.dropzone .dz-preview:hover .dz-details{opacity:1}.dropzone .dz-preview .dz-details{z-index:20;position:absolute;top:0;left:0;opacity:0;font-size:13px;min-width:100%;max-width:100%;padding:2em 1em;text-align:center;color:#000000e6;line-height:150%}.dropzone .dz-preview .dz-details .dz-size{margin-bottom:1em;font-size:16px}.dropzone .dz-preview .dz-details .dz-filename{white-space:nowrap}.dropzone .dz-preview .dz-details .dz-filename:hover span{border:1px solid rgba(200,200,200,.8);background-color:#fffc}.dropzone .dz-preview .dz-details .dz-filename:not(:hover){overflow:hidden;text-overflow:ellipsis}.dropzone .dz-preview .dz-details .dz-filename:not(:hover) span{border:1px solid rgba(0,0,0,0)}.dropzone .dz-preview .dz-details .dz-filename span,.dropzone .dz-preview .dz-details .dz-size span{background-color:#fff6;padding:0 .4em;border-radius:3px}.dropzone .dz-preview:hover .dz-image img{transform:scale(1.05);filter:blur(8px)}.dropzone .dz-preview .dz-image{border-radius:20px;overflow:hidden;width:120px;height:120px;position:relative;display:block;z-index:10}.dropzone .dz-preview .dz-image img{display:block}.dropzone .dz-preview.dz-success .dz-success-mark{animation:passing-through 3s cubic-bezier(.77,0,.175,1)}.dropzone .dz-preview.dz-error .dz-error-mark{opacity:1;animation:slide-in 3s cubic-bezier(.77,0,.175,1)}.dropzone .dz-preview .dz-success-mark,.dropzone .dz-preview .dz-error-mark{pointer-events:none;opacity:0;z-index:500;position:absolute;display:block;top:50%;left:50%;margin-left:-27px;margin-top:-27px}.dropzone .dz-preview .dz-success-mark svg,.dropzone .dz-preview .dz-error-mark svg{display:block;width:54px;height:54px}.dropzone .dz-preview.dz-processing .dz-progress{opacity:1;transition:all .2s linear}.dropzone .dz-preview.dz-complete .dz-progress{opacity:0;transition:opacity .4s ease-in}.dropzone .dz-preview:not(.dz-processing) .dz-progress{animation:pulse 6s ease infinite}.dropzone .dz-preview .dz-progress{opacity:1;z-index:1000;pointer-events:none;position:absolute;height:16px;left:50%;top:50%;margin-top:-8px;width:80px;margin-left:-40px;background:rgba(255,255,255,.9);-webkit-transform:scale(1);border-radius:8px;overflow:hidden}.dropzone .dz-preview .dz-progress .dz-upload{background:#333;background:linear-gradient(to bottom,#666,#444);position:absolute;top:0;left:0;bottom:0;width:0;transition:width .3s ease-in-out}.dropzone .dz-preview.dz-error .dz-error-message{display:block}.dropzone .dz-preview.dz-error:hover .dz-error-message{opacity:1;pointer-events:auto}.dropzone .dz-preview .dz-error-message{pointer-events:none;z-index:1000;position:absolute;display:block;display:none;opacity:0;transition:opacity .3s ease;border-radius:8px;font-size:13px;top:130px;left:-10px;width:140px;background:#be2626;background:linear-gradient(to bottom,rgb(190,38,38),#a92222);padding:.5em 1.2em;color:#fff}.dropzone .dz-preview .dz-error-message:after{content:\"\";position:absolute;top:-6px;left:64px;width:0;height:0;border-left:6px solid rgba(0,0,0,0);border-right:6px solid rgba(0,0,0,0);border-bottom:6px solid #be2626}\n"], dependencies: [{ kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: DropzoneDirective, selector: "[dropzone]", inputs: ["disabled", "dropzone"], outputs: ["init", "error", "success", "sending", "canceled", "complete", "processing", "drop", "dragStart", "dragEnd", "dragEnter", "dragOver", "dragLeave", "thumbnail", "addedFile", "addedFiles", "removedFile", "uploadProgress", "maxFilesReached", "maxFilesExceeded", "errorMultiple", "successMultiple", "sendingMultiple", "canceledMultiple", "completeMultiple", "processingMultiple", "reset", "queueComplete", "totalUploadProgress"], exportAs: ["ngxDropzone"] }], encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: DropzoneComponent, decorators: [{
            type: Component,
            args: [{ selector: 'dropzone', exportAs: 'ngxDropzone', encapsulation: ViewEncapsulation.None, template: "<div class=\"dz-wrapper\" [class.dropzone]=\"useDropzoneClass\" [dropzone]=\"config\" [disabled]=\"disabled\" (init)=\"DZ_INIT.emit($event)\">\n  <div class=\"dz-message\" [class.disabled]=\"disabled\" [class.dz-placeholder]=\"placeholder\">\n    <div class=\"dz-text\" [innerHTML]=\"config?.dictDefaultMessage || message\"></div>\n\n    <div *ngIf=\"placeholder\" class=\"dz-image\" [style.background-image]=\"getPlaceholder()\"></div>\n  </div>\n\n  <ng-content></ng-content>\n</div>\n", styles: ["dropzone{display:block;width:100%;height:auto}dropzone[fxflex]{display:flex;flex-direction:inherit;min-width:0;min-height:0}dropzone[fxflex]>.dropzone.dz-wrapper{flex:1 1 auto;min-width:0;min-height:0;-webkit-box-flex:1}dropzone[fxlayout]{align-items:inherit;align-content:inherit;justify-content:inherit;-webkit-box-align:inherit;-webkit-box-pack:inherit}dropzone[fxlayout]>.dropzone.dz-wrapper.dz-single{display:flex;flex-direction:column;align-items:center;align-content:center;justify-content:center;-webkit-box-align:center;-webkit-box-pack:center}dropzone[fxlayout]>.dropzone.dz-wrapper.dz-multiple{display:flex;flex-flow:row wrap;align-items:flex-start;align-content:flex-start;justify-content:space-between;-webkit-box-align:flex-start;-webkit-box-pack:flex-start}dropzone>.dropzone.dz-wrapper{position:relative;overflow:auto;width:100%;min-height:0;max-height:100%;padding:0;border:none;color:#666;background:transparent}dropzone>.dropzone.dz-wrapper .dz-message{position:relative;display:inline-block;overflow:auto;width:calc(100% - 16px);min-width:calc(100% - 16px);min-height:40px;max-width:calc(100% - 16px);max-height:100%;margin:8px;border:2px dashed #aaa;background-color:#eee}dropzone>.dropzone.dz-wrapper .dz-message .dz-text{position:absolute;top:50%;width:100%;padding:8px 16px;text-align:center;transform:translateY(-50%)}dropzone>.dropzone.dz-wrapper .dz-message .dz-image{width:100%;height:100%;background-size:contain;background-repeat:no-repeat;background-position:50% 50%}dropzone>.dropzone.dz-wrapper .dz-message.disabled{cursor:not-allowed}dropzone>.dropzone.dz-wrapper .dz-message.disabled .dz-text{opacity:.5}dropzone>.dropzone.dz-wrapper .dz-message.dz-placeholder{border-color:rgba(#aaa,0)}dropzone>.dropzone.dz-wrapper .dz-message.dz-placeholder .dz-text{position:absolute;z-index:1;top:0;right:10%;left:10%;opacity:0;font-weight:700;background-color:rgba(#fff,.5);transform:translateY(-50%);transition:filter .25s ease-in-out,opacity .25s ease-in-out,border-color .25s ease-in-out}dropzone>.dropzone.dz-wrapper .dz-message.dz-placeholder:hover:not(.disabled){border-color:#aaa}dropzone>.dropzone.dz-wrapper .dz-message.dz-placeholder:hover:not(.disabled) .dz-text{opacity:1}dropzone>.dropzone.dz-wrapper .dz-message.dz-placeholder:hover:not(.disabled) .dz-image{filter:blur(8px)}dropzone>.dropzone.dz-wrapper .dz-preview{margin:8px}dropzone>.dropzone.dz-wrapper .dz-preview .dz-details{padding:24px}dropzone>.dropzone.dz-wrapper .dz-preview .dz-progress{width:80%;margin-left:-40%;border:1px solid #aaa;border-radius:4px}dropzone>.dropzone.dz-wrapper .dz-preview .dz-progress .dz-upload{background-color:#666}dropzone>.dropzone.dz-wrapper .dz-preview .dz-filename span{display:block;overflow:hidden;width:100%;max-width:100%;text-overflow:ellipsis}dropzone>.dropzone.dz-wrapper .dz-preview .dz-filename span:hover{overflow:visible;white-space:normal;word-wrap:break-word}dropzone>.dropzone.dz-wrapper.dz-single .dz-message{width:100%;height:100%}dropzone>.dropzone.dz-wrapper.dz-single.dz-started .dz-message{display:none}dropzone>.dropzone.dz-wrapper.dz-single .dz-preview{width:calc(100% - 16px);height:100%}dropzone>.dropzone.dz-wrapper.dz-single .dz-preview .dz-image{width:100%;height:100%;border-radius:0}dropzone>.dropzone.dz-wrapper.dz-single .dz-preview .dz-image img{display:block;width:100%;height:auto;margin:0}dropzone>.dropzone.dz-wrapper.dz-single .dz-error-message{top:50%;left:50%;transform:translate(-50%) translateY(100%)}dropzone>.dropzone.dz-wrapper.dz-multiple.dz-started .dz-message{display:inline-block}\n", "@keyframes passing-through{0%{opacity:0;transform:translateY(40px)}30%,70%{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-40px)}}@keyframes slide-in{0%{opacity:0;transform:translateY(40px)}30%{opacity:1;transform:translateY(0)}}@keyframes pulse{0%{transform:scale(1)}10%{transform:scale(1.1)}20%{transform:scale(1)}}.dropzone,.dropzone *{box-sizing:border-box}.dropzone{min-height:150px;border:2px solid rgba(0,0,0,.3);background:#fff;padding:20px}.dropzone.dz-clickable{cursor:pointer}.dropzone.dz-clickable *{cursor:default}.dropzone.dz-clickable .dz-message,.dropzone.dz-clickable .dz-message *{cursor:pointer}.dropzone.dz-started .dz-message{display:none}.dropzone.dz-drag-hover{border-style:solid}.dropzone.dz-drag-hover .dz-message{opacity:.5}.dropzone .dz-message{text-align:center;margin:2em 0}.dropzone .dz-message .dz-button{background:none;color:inherit;border:none;padding:0;font:inherit;cursor:pointer;outline:inherit}.dropzone .dz-preview{position:relative;display:inline-block;vertical-align:top;margin:16px;min-height:100px}.dropzone .dz-preview:hover{z-index:1000}.dropzone .dz-preview.dz-file-preview .dz-image{border-radius:20px;background:#999;background:linear-gradient(to bottom,#eee,#ddd)}.dropzone .dz-preview.dz-file-preview .dz-details{opacity:1}.dropzone .dz-preview.dz-image-preview{background:#fff}.dropzone .dz-preview.dz-image-preview .dz-details{transition:opacity .2s linear}.dropzone .dz-preview .dz-remove{font-size:14px;text-align:center;display:block;cursor:pointer;border:none}.dropzone .dz-preview .dz-remove:hover{text-decoration:underline}.dropzone .dz-preview:hover .dz-details{opacity:1}.dropzone .dz-preview .dz-details{z-index:20;position:absolute;top:0;left:0;opacity:0;font-size:13px;min-width:100%;max-width:100%;padding:2em 1em;text-align:center;color:#000000e6;line-height:150%}.dropzone .dz-preview .dz-details .dz-size{margin-bottom:1em;font-size:16px}.dropzone .dz-preview .dz-details .dz-filename{white-space:nowrap}.dropzone .dz-preview .dz-details .dz-filename:hover span{border:1px solid rgba(200,200,200,.8);background-color:#fffc}.dropzone .dz-preview .dz-details .dz-filename:not(:hover){overflow:hidden;text-overflow:ellipsis}.dropzone .dz-preview .dz-details .dz-filename:not(:hover) span{border:1px solid rgba(0,0,0,0)}.dropzone .dz-preview .dz-details .dz-filename span,.dropzone .dz-preview .dz-details .dz-size span{background-color:#fff6;padding:0 .4em;border-radius:3px}.dropzone .dz-preview:hover .dz-image img{transform:scale(1.05);filter:blur(8px)}.dropzone .dz-preview .dz-image{border-radius:20px;overflow:hidden;width:120px;height:120px;position:relative;display:block;z-index:10}.dropzone .dz-preview .dz-image img{display:block}.dropzone .dz-preview.dz-success .dz-success-mark{animation:passing-through 3s cubic-bezier(.77,0,.175,1)}.dropzone .dz-preview.dz-error .dz-error-mark{opacity:1;animation:slide-in 3s cubic-bezier(.77,0,.175,1)}.dropzone .dz-preview .dz-success-mark,.dropzone .dz-preview .dz-error-mark{pointer-events:none;opacity:0;z-index:500;position:absolute;display:block;top:50%;left:50%;margin-left:-27px;margin-top:-27px}.dropzone .dz-preview .dz-success-mark svg,.dropzone .dz-preview .dz-error-mark svg{display:block;width:54px;height:54px}.dropzone .dz-preview.dz-processing .dz-progress{opacity:1;transition:all .2s linear}.dropzone .dz-preview.dz-complete .dz-progress{opacity:0;transition:opacity .4s ease-in}.dropzone .dz-preview:not(.dz-processing) .dz-progress{animation:pulse 6s ease infinite}.dropzone .dz-preview .dz-progress{opacity:1;z-index:1000;pointer-events:none;position:absolute;height:16px;left:50%;top:50%;margin-top:-8px;width:80px;margin-left:-40px;background:rgba(255,255,255,.9);-webkit-transform:scale(1);border-radius:8px;overflow:hidden}.dropzone .dz-preview .dz-progress .dz-upload{background:#333;background:linear-gradient(to bottom,#666,#444);position:absolute;top:0;left:0;bottom:0;width:0;transition:width .3s ease-in-out}.dropzone .dz-preview.dz-error .dz-error-message{display:block}.dropzone .dz-preview.dz-error:hover .dz-error-message{opacity:1;pointer-events:auto}.dropzone .dz-preview .dz-error-message{pointer-events:none;z-index:1000;position:absolute;display:block;display:none;opacity:0;transition:opacity .3s ease;border-radius:8px;font-size:13px;top:130px;left:-10px;width:140px;background:#be2626;background:linear-gradient(to bottom,rgb(190,38,38),#a92222);padding:.5em 1.2em;color:#fff}.dropzone .dz-preview .dz-error-message:after{content:\"\";position:absolute;top:-6px;left:64px;width:0;height:0;border-left:6px solid rgba(0,0,0,0);border-right:6px solid rgba(0,0,0,0);border-bottom:6px solid #be2626}\n"] }]
        }], ctorParameters: function () { return [{ type: Object, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }]; }, propDecorators: { disabled: [{
                type: Input
            }], config: [{
                type: Input
            }], message: [{
                type: Input
            }], placeholder: [{
                type: Input
            }], useDropzoneClass: [{
                type: Input
            }], DZ_INIT: [{
                type: Output,
                args: ['init']
            }], DZ_ERROR: [{
                type: Output,
                args: ['error']
            }], DZ_SUCCESS: [{
                type: Output,
                args: ['success']
            }], DZ_SENDING: [{
                type: Output,
                args: ['sending']
            }], DZ_CANCELED: [{
                type: Output,
                args: ['canceled']
            }], DZ_COMPLETE: [{
                type: Output,
                args: ['complete']
            }], DZ_PROCESSING: [{
                type: Output,
                args: ['processing']
            }], DZ_DROP: [{
                type: Output,
                args: ['drop']
            }], DZ_DRAGSTART: [{
                type: Output,
                args: ['dragStart']
            }], DZ_DRAGEND: [{
                type: Output,
                args: ['dragEnd']
            }], DZ_DRAGENTER: [{
                type: Output,
                args: ['dragEnter']
            }], DZ_DRAGOVER: [{
                type: Output,
                args: ['dragOver']
            }], DZ_DRAGLEAVE: [{
                type: Output,
                args: ['dragLeave']
            }], DZ_THUMBNAIL: [{
                type: Output,
                args: ['thumbnail']
            }], DZ_ADDEDFILE: [{
                type: Output,
                args: ['addedFile']
            }], DZ_ADDEDFILES: [{
                type: Output,
                args: ['addedFiles']
            }], DZ_REMOVEDFILE: [{
                type: Output,
                args: ['removedFile']
            }], DZ_UPLOADPROGRESS: [{
                type: Output,
                args: ['uploadProgress']
            }], DZ_MAXFILESREACHED: [{
                type: Output,
                args: ['maxFilesReached']
            }], DZ_MAXFILESEXCEEDED: [{
                type: Output,
                args: ['maxFilesExceeded']
            }], DZ_ERRORMULTIPLE: [{
                type: Output,
                args: ['errorMultiple']
            }], DZ_SUCCESSMULTIPLE: [{
                type: Output,
                args: ['successMultiple']
            }], DZ_SENDINGMULTIPLE: [{
                type: Output,
                args: ['sendingMultiple']
            }], DZ_CANCELEDMULTIPLE: [{
                type: Output,
                args: ['canceledMultiple']
            }], DZ_COMPLETEMULTIPLE: [{
                type: Output,
                args: ['completeMultiple']
            }], DZ_PROCESSINGMULTIPLE: [{
                type: Output,
                args: ['processingMultiple']
            }], DZ_RESET: [{
                type: Output,
                args: ['reset']
            }], DZ_QUEUECOMPLETE: [{
                type: Output,
                args: ['queueComplete']
            }], DZ_TOTALUPLOADPROGRESS: [{
                type: Output,
                args: ['totalUploadProgress']
            }], directiveRef: [{
                type: ViewChild,
                args: [DropzoneDirective, { static: true }]
            }] } });

class DropzoneModule {
}
DropzoneModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: DropzoneModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
DropzoneModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "14.2.12", ngImport: i0, type: DropzoneModule, declarations: [DropzoneComponent, DropzoneDirective], imports: [CommonModule], exports: [CommonModule, DropzoneComponent, DropzoneDirective] });
DropzoneModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: DropzoneModule, imports: [CommonModule, CommonModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: DropzoneModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule],
                    declarations: [DropzoneComponent, DropzoneDirective],
                    exports: [CommonModule, DropzoneComponent, DropzoneDirective]
                }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { DROPZONE_CONFIG, DropzoneComponent, DropzoneConfig, DropzoneDirective, DropzoneModule };
//# sourceMappingURL=ngx-dropzone-wrapper.mjs.map
