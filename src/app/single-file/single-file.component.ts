import { Component, Input } from '@angular/core';

@Component({
    selector: 'single-file',
    templateUrl: './single-file.component.html',
    styleUrls: ['./single-file.component.scss']
})
export class SingleFile {
    @Input() file: File;
    message: string = '';
    progress_mode: string = '';
    @Input() passwd: string;
    constructor() {
    }

    // progress bar
    toggle_progress_bar(start: boolean) {
        this.progress_mode = start ? 'indeterminate' : 'determinate';
    }

    ngOnInit() {
        this.upload();
    }

    readAsBase64(file: File): Promise<string | ArrayBuffer> {
        return new Promise((res, rej) => {
            const fr = new FileReader();
            fr.onload = (e: ProgressEvent) => {
                res((<FileReader>e.target).result);
            };
            fr.readAsDataURL(file);
        });
    }

    async upload() {
        this.toggle_progress_bar(true);
        this.message = 'アップロードしています...';
        console.log(this.passwd, this.file.name);
        fetch('http://localhost:8082/api/v1/upload/file', {
            method: 'post',
            body: JSON.stringify({
                passwd: this.passwd,
                filename: this.file.name,
                data: await this.readAsBase64(this.file)
            }),
            headers: {
                'content-type': 'application/json'
            }
        }).then(res => {
            this.message = 'アップロードしました';
            this.toggle_progress_bar(false);
        });
    }
}