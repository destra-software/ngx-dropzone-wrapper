import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Inject, Optional, Directive, Input, Output, EventEmitter } from '@angular/core';
import { DROPZONE_CONFIG, DropzoneConfig, DropzoneEvents } from './dropzone.interfaces';
import * as i0 from "@angular/core";
export class DropzoneDirective {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJvcHpvbmUuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvbGliL3NyYy9saWIvZHJvcHpvbmUuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDNUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDcEQsT0FBTyxFQUFVLE1BQU0sRUFBRSxRQUFRLEVBQXlCLFNBQVMsRUFDMUIsS0FBSyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQ2xCLE1BQU0sZUFBZSxDQUFDO0FBRXhFLE9BQU8sRUFBRSxlQUFlLEVBQUUsY0FBYyxFQUN2QixjQUFjLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQzs7QUFNL0QsTUFBTSxPQUFPLGlCQUFpQjtJQTZDNUIsWUFBb0IsSUFBWSxFQUFVLFFBQW1CLEVBQVUsVUFBc0IsRUFDbkYsT0FBd0IsRUFBK0IsVUFBa0IsRUFDcEMsUUFBaUM7UUFGNUQsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUFVLGFBQVEsR0FBUixRQUFRLENBQVc7UUFBVSxlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQ25GLFlBQU8sR0FBUCxPQUFPLENBQWlCO1FBQStCLGVBQVUsR0FBVixVQUFVLENBQVE7UUFDcEMsYUFBUSxHQUFSLFFBQVEsQ0FBeUI7UUEzQ3hFLGVBQVUsR0FBdUMsSUFBSSxDQUFDO1FBRXJELGFBQVEsR0FBWSxLQUFLLENBQUM7UUFJRCxZQUFPLEdBQXVCLElBQUksWUFBWSxFQUFPLENBQUM7UUFFdEQsYUFBUSxHQUFzQixJQUFJLFlBQVksRUFBTyxDQUFDO1FBQ3RELGVBQVUsR0FBb0IsSUFBSSxZQUFZLEVBQU8sQ0FBQztRQUN0RCxlQUFVLEdBQW9CLElBQUksWUFBWSxFQUFPLENBQUM7UUFDdEQsZ0JBQVcsR0FBbUIsSUFBSSxZQUFZLEVBQU8sQ0FBQztRQUN0RCxnQkFB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QkFDZ0IsWUFBWTtzQkFBN0MsTUFBTTt1QkFBQyxXQUFXO2dCQUVlLFlBQVk7c0JBQTdDLE1BQU07dUJBQUMsV0FBVztnQkFDZSxZQUFZO3NCQUE3QyxNQUFNO3VCQUFDLFdBQVc7Z0JBQ2UsYUFBYTtzQkFBOUMsTUFBTTt1QkFBQyxZQUFZO2dCQUNjLGNBQWM7c0JBQS9DLE1BQU07dUJBQUMsYUFBYTtnQkFDYSxpQkFBaUI7c0JBQWxELE1BQU07dUJBQUMsZ0JBQWdCO2dCQUNVLGtCQUFrQjtzQkFBbkQsTUFBTTt1QkFBQyxpQkFBaUI7Z0JBQ1MsbUJBQW1CO3NCQUFwRCxNQUFNO3VCQUFDLGtCQUFrQjtnQkFFUSxnQkFBZ0I7c0JBQWpELE1BQU07dUJBQUMsZUFBZTtnQkFDVyxrQkFBa0I7c0JBQW5ELE1BQU07dUJBQUMsaUJBQWlCO2dCQUNTLGtCQUFrQjtzQkFBbkQsTUFBTTt1QkFBQyxpQkFBaUI7Z0JBQ1MsbUJBQW1CO3NCQUFwRCxNQUFNO3VCQUFDLGtCQUFrQjtnQkFDUSxtQkFBbUI7c0JBQXBELE1BQU07dUJBQUMsa0JBQWtCO2dCQUNRLHFCQUFxQjtzQkFBdEQsTUFBTTt1QkFBQyxvQkFBb0I7Z0JBRU0sUUFBUTtzQkFBekMsTUFBTTt1QkFBQyxPQUFPO2dCQUNtQixnQkFBZ0I7c0JBQWpELE1BQU07dUJBQUMsZUFBZTtnQkFDVyxzQkFBc0I7c0JBQXZELE1BQU07dUJBQUMscUJBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUExBVEZPUk1fSUQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IGlzUGxhdGZvcm1Ccm93c2VyIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7IE5nWm9uZSwgSW5qZWN0LCBPcHRpb25hbCwgRWxlbWVudFJlZiwgUmVuZGVyZXIyLCBEaXJlY3RpdmUsXG4gIE9uSW5pdCwgT25EZXN0cm95LCBEb0NoZWNrLCBPbkNoYW5nZXMsIElucHV0LCBPdXRwdXQsIEV2ZW50RW1pdHRlcixcbiAgU2ltcGxlQ2hhbmdlcywgS2V5VmFsdWVEaWZmZXIsIEtleVZhbHVlRGlmZmVycyB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBEUk9QWk9ORV9DT05GSUcsIERyb3B6b25lQ29uZmlnLCBEcm9wem9uZUNvbmZpZ0ludGVyZmFjZSxcbiAgRHJvcHpvbmVFdmVudCwgRHJvcHpvbmVFdmVudHMgfSBmcm9tICcuL2Ryb3B6b25lLmludGVyZmFjZXMnO1xuXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdbZHJvcHpvbmVdJyxcbiAgZXhwb3J0QXM6ICduZ3hEcm9wem9uZSdcbn0pXG5leHBvcnQgY2xhc3MgRHJvcHpvbmVEaXJlY3RpdmUgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSwgRG9DaGVjaywgT25DaGFuZ2VzIHtcbiAgcHJpdmF0ZSBpbnN0YW5jZTogYW55O1xuICBwcml2YXRlIERyb3B6b25lOiBhbnk7XG5cbiAgcHJpdmF0ZSBjb25maWdEaWZmOiBLZXlWYWx1ZURpZmZlcjxzdHJpbmcsIGFueT4gfCBudWxsID0gbnVsbDtcblxuICBASW5wdXQoKSBkaXNhYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIEBJbnB1dCgnZHJvcHpvbmUnKSBjb25maWc/OiBEcm9wem9uZUNvbmZpZ0ludGVyZmFjZTtcblxuICBAT3V0cHV0KCdpbml0JyAgICAgICAgICAgICAgICAgICkgRFpfSU5JVCAgICAgICAgICAgICAgICAgICAgID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG5cbiAgQE91dHB1dCgnZXJyb3InICAgICAgICAgICAgICAgICApIERaX0VSUk9SICAgICAgICAgICAgICAgICAgICA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICBAT3V0cHV0KCdzdWNjZXNzJyAgICAgICAgICAgICAgICkgRFpfU1VDQ0VTUyAgICAgICAgICAgICAgICAgID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gIEBPdXRwdXQoJ3NlbmRpbmcnICAgICAgICAgICAgICAgKSBEWl9TRU5ESU5HICAgICAgICAgICAgICAgICAgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgQE91dHB1dCgnY2FuY2VsZWQnICAgICAgICAgICAgICApIERaX0NBTkNFTEVEICAgICAgICAgICAgICAgICA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICBAT3V0cHV0KCdjb21wbGV0ZScgICAgICAgICAgICAgICkgRFpfQ09NUExFVEUgICAgICAgICAgICAgICAgID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gIEBPdXRwdXQoJ3Byb2Nlc3NpbmcnICAgICAgICAgICAgKSBEWl9QUk9DRVNTSU5HICAgICAgICAgICAgICAgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcblxuICBAT3V0cHV0KCdkcm9wJyAgICAgICAgICAgICAgICAgICkgRFpfRFJPUCAgICAgICAgICAgICAgICAgICAgID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gIEBPdXRwdXQoJ2RyYWdTdGFydCcgICAgICAgICAgICAgKSBEWl9EUkFHU1RBUlQgICAgICAgICAgICAgICAgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgQE91dHB1dCgnZHJhZ0VuZCcgICAgICAgICAgICAgICApIERaX0RSQUdFTkQgICAgICAgICAgICAgICAgICA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICBAT3V0cHV0KCdkcmFnRW50ZXInICAgICAgICAgICAgICkgRFpfRFJBR0VOVEVSICAgICAgICAgICAgICAgID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gIEBPdXRwdXQoJ2RyYWdPdmVyJyAgICAgICAgICAgICAgKSBEWl9EUkFHT1ZFUiAgICAgICAgICAgICAgICAgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgQE91dHB1dCgnZHJhZ0xlYXZlJyAgICAgICAgICAgICApIERaX0RSQUdMRUFWRSAgICAgICAgICAgICAgICA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuXG4gIEBPdXRwdXQoJ3RodW1ibmFpbCcgICAgICAgICAgICAgKSBEWl9USFVNQk5BSUwgICAgICAgICAgICAgICAgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgQE91dHB1dCgnYWRkZWRGaWxlJyAgICAgICAgICAgICApIERaX0FEREVERklMRSAgICAgICAgICAgICAgICA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICBAT3V0cHV0KCdhZGRlZEZpbGVzJyAgICAgICAgICAgICkgRFpfQURERURGSUxFUyAgICAgICAgICAgICAgID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gIEBPdXRwdXQoJ3JlbW92ZWRGaWxlJyAgICAgICAgICAgKSBEWl9SRU1PVkVERklMRSAgICAgICAgICAgICAgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgQE91dHB1dCgndXBsb2FkUHJvZ3Jlc3MnICAgICAgICApIERaX1VQTE9BRFBST0dSRVNTICAgICAgICAgICA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICBAT3V0cHV0KCdtYXhGaWxlc1JlYWNoZWQnICAgICAgICkgRFpfTUFYRklMRVNSRUFDSEVEICAgICAgICAgID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gIEBPdXRwdXQoJ21heEZpbGVzRXhjZWVkZWQnICAgICAgKSBEWl9NQVhGSUxFU0VYQ0VFREVEICAgICAgICAgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcblxuICBAT3V0cHV0KCdlcnJvck11bHRpcGxlJyAgICAgICAgICkgRFpfRVJST1JNVUxUSVBMRSAgICAgICAgICAgID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gIEBPdXRwdXQoJ3N1Y2Nlc3NNdWx0aXBsZScgICAgICAgKSBEWl9TVUNDRVNTTVVMVElQTEUgICAgICAgICAgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgQE91dHB1dCgnc2VuZGluZ011bHRpcGxlJyAgICAgICApIERaX1NFTkRJTkdNVUxUSVBMRSAgICAgICAgICA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICBAT3V0cHV0KCdjYW5jZWxlZE11bHRpcGxlJyAgICAgICkgRFpfQ0FOQ0VMRURNVUxUSVBMRSAgICAgICAgID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gIEBPdXRwdXQoJ2NvbXBsZXRlTXVsdGlwbGUnICAgICAgKSBEWl9DT01QTEVURU1VTFRJUExFICAgICAgICAgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgQE91dHB1dCgncHJvY2Vzc2luZ011bHRpcGxlJyAgICApIERaX1BST0NFU1NJTkdNVUxUSVBMRSAgICAgICA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuXG4gIEBPdXRwdXQoJ3Jlc2V0JyAgICAgICAgICAgICAgICAgKSBEWl9SRVNFVCAgICAgICAgICAgICAgICAgICAgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgQE91dHB1dCgncXVldWVDb21wbGV0ZScgICAgICAgICApIERaX1FVRVVFQ09NUExFVEUgICAgICAgICAgICA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICBAT3V0cHV0KCd0b3RhbFVwbG9hZFByb2dyZXNzJyAgICkgRFpfVE9UQUxVUExPQURQUk9HUkVTUyAgICAgID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSB6b25lOiBOZ1pvbmUsIHByaXZhdGUgcmVuZGVyZXI6IFJlbmRlcmVyMiwgcHJpdmF0ZSBlbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuICAgIHByaXZhdGUgZGlmZmVyczogS2V5VmFsdWVEaWZmZXJzLCBASW5qZWN0KFBMQVRGT1JNX0lEKSBwcml2YXRlIHBsYXRmb3JtSWQ6IE9iamVjdCxcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KERST1BaT05FX0NPTkZJRykgcHJpdmF0ZSBkZWZhdWx0czogRHJvcHpvbmVDb25maWdJbnRlcmZhY2UpXG4gIHtcbiAgICBpZiAoaXNQbGF0Zm9ybUJyb3dzZXIodGhpcy5wbGF0Zm9ybUlkKSkge1xuICAgICAgaW1wb3J0KCdkcm9wem9uZScpLnRoZW4oZHJvcHpvbmUgPT4ge1xuICAgICAgICB0aGlzLkRyb3B6b25lID0gZHJvcHpvbmU7XG4gICAgICAgIHRoaXMuRHJvcHpvbmUuYXV0b0Rpc2NvdmVyID0gZmFsc2U7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICBpZiAoIWlzUGxhdGZvcm1Ccm93c2VyKHRoaXMucGxhdGZvcm1JZCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwYXJhbXMgPSBuZXcgRHJvcHpvbmVDb25maWcodGhpcy5kZWZhdWx0cyk7XG5cbiAgICBwYXJhbXMuYXNzaWduKHRoaXMuY29uZmlnKTsgLy8gQ3VzdG9tIGNvbmZpZ3VyYXRpb25cblxuICAgIHRoaXMucmVuZGVyZXIuYWRkQ2xhc3ModGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsXG4gICAgICAocGFyYW1zLm1heEZpbGVzID09PSAxKSA/ICdkei1zaW5nbGUnIDogJ2R6LW11bHRpcGxlJyk7XG5cbiAgICB0aGlzLnJlbmRlcmVyLnJlbW92ZUNsYXNzKHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LFxuICAgICAgKHBhcmFtcy5tYXhGaWxlcyA9PT0gMSkgPyAnZHotbXVsdGlwbGUnIDogJ2R6LXNpbmdsZScpO1xuXG4gICAgdGhpcy56b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgIHRoaXMuaW5zdGFuY2UgPSBuZXcgdGhpcy5Ecm9wem9uZSh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgcGFyYW1zKTtcbiAgICB9KTtcblxuICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XG4gICAgICB0aGlzLmluc3RhbmNlLmRpc2FibGUoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5EWl9JTklULm9ic2VydmVycy5sZW5ndGgpIHtcbiAgICAgIHRoaXMuem9uZS5ydW4oKCkgPT4ge1xuICAgICAgICB0aGlzLkRaX0lOSVQuZW1pdCh0aGlzLmluc3RhbmNlKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEFkZCBhdXRvIHJlc2V0IGhhbmRsaW5nIGZvciBldmVudHNcbiAgICB0aGlzLmluc3RhbmNlLm9uKCdzdWNjZXNzJywgKCkgPT4ge1xuICAgICAgaWYgKHBhcmFtcy5hdXRvUmVzZXQgIT0gbnVsbCkge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMucmVzZXQoKSwgcGFyYW1zLmF1dG9SZXNldCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmluc3RhbmNlLm9uKCdlcnJvcicsICgpID0+IHtcbiAgICAgIGlmIChwYXJhbXMuZXJyb3JSZXNldCAhPSBudWxsKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5yZXNldCgpLCBwYXJhbXMuZXJyb3JSZXNldCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmluc3RhbmNlLm9uKCdjYW5jZWxlZCcsICgpID0+IHtcbiAgICAgIGlmIChwYXJhbXMuY2FuY2VsUmVzZXQgIT0gbnVsbCkge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMucmVzZXQoKSwgcGFyYW1zLmNhbmNlbFJlc2V0KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIEFkZCBuYXRpdmUgRHJvcHpvbmUgZXZlbnQgaGFuZGxpbmdcbiAgICBEcm9wem9uZUV2ZW50cy5mb3JFYWNoKChldmVudE5hbWU6IERyb3B6b25lRXZlbnQpID0+IHtcbiAgICAgIHRoaXMuaW5zdGFuY2Uub24oZXZlbnROYW1lLnRvTG93ZXJDYXNlKCksICguLi5hcmdzOiBhbnlbXSkgPT4ge1xuICAgICAgICBhcmdzID0gKGFyZ3MubGVuZ3RoID09PSAxKSA/IGFyZ3NbMF0gOiBhcmdzO1xuXG4gICAgICAgIGNvbnN0IG91dHB1dCA9IGBEWl8ke2V2ZW50TmFtZS50b1VwcGVyQ2FzZSgpfWA7XG5cbiAgICAgICAgY29uc3QgZW1pdHRlciA9IHRoaXNbb3V0cHV0IGFzIGtleW9mIERyb3B6b25lRGlyZWN0aXZlXSBhcyBFdmVudEVtaXR0ZXI8YW55PjtcblxuICAgICAgICBpZiAoZW1pdHRlci5vYnNlcnZlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHRoaXMuem9uZS5ydW4oKCkgPT4ge1xuICAgICAgICAgICAgZW1pdHRlci5lbWl0KGFyZ3MpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGlmICghdGhpcy5jb25maWdEaWZmKSB7XG4gICAgICB0aGlzLmNvbmZpZ0RpZmYgPSB0aGlzLmRpZmZlcnMuZmluZCh0aGlzLmNvbmZpZyB8fCB7fSkuY3JlYXRlKCk7XG5cbiAgICAgIHRoaXMuY29uZmlnRGlmZi5kaWZmKHRoaXMuY29uZmlnIHx8IHt9KTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5pbnN0YW5jZSkge1xuICAgICAgdGhpcy56b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgdGhpcy5pbnN0YW5jZS5kZXN0cm95KCk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5pbnN0YW5jZSA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgbmdEb0NoZWNrKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5kaXNhYmxlZCAmJiB0aGlzLmNvbmZpZ0RpZmYpIHtcbiAgICAgIGNvbnN0IGNoYW5nZXMgPSB0aGlzLmNvbmZpZ0RpZmYuZGlmZih0aGlzLmNvbmZpZyB8fCB7fSk7XG5cbiAgICAgIGlmIChjaGFuZ2VzICYmIHRoaXMuaW5zdGFuY2UpIHtcbiAgICAgICAgdGhpcy5uZ09uRGVzdHJveSgpO1xuXG4gICAgICAgIHRoaXMubmdPbkluaXQoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaW5zdGFuY2UgJiYgY2hhbmdlc1snZGlzYWJsZWQnXSkge1xuICAgICAgaWYgKGNoYW5nZXNbJ2Rpc2FibGVkJ10uY3VycmVudFZhbHVlICE9PSBjaGFuZ2VzWydkaXNhYmxlZCddLnByZXZpb3VzVmFsdWUpIHtcbiAgICAgICAgaWYgKGNoYW5nZXNbJ2Rpc2FibGVkJ10uY3VycmVudFZhbHVlID09PSBmYWxzZSkge1xuICAgICAgICAgIHRoaXMuem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmluc3RhbmNlLmVuYWJsZSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGNoYW5nZXNbJ2Rpc2FibGVkJ10uY3VycmVudFZhbHVlID09PSB0cnVlKSB7XG4gICAgICAgICAgdGhpcy56b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaW5zdGFuY2UuZGlzYWJsZSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGRyb3B6b25lKCk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuaW5zdGFuY2U7XG4gIH1cblxuICBwdWJsaWMgcmVzZXQoY2FuY2VsPzogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICh0aGlzLmluc3RhbmNlKSB7XG4gICAgICB0aGlzLnpvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICB0aGlzLmluc3RhbmNlLnJlbW92ZUFsbEZpbGVzKGNhbmNlbCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==