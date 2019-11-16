import { Component, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material';

@Component({
    selector: 'single-file',
    templateUrl: './single-file.component.html',
    styleUrls: ['./single-file.component.scss']
})
export class SingleFile {
    @Input() file: File;
    message: string = '';
    progress_mode: string = '';
    completed: boolean = false;
    @Input() passwd: string;
    constructor(private snackbar: MatSnackBar) {
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
        fetch('/api/v1/upload/file', {
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
            this.completed = true;
            if (res.status === 200) {
                this.message = 'アップロードしました';
                this.toggle_progress_bar(false);
            } else {
                this.message = 'アップロードに失敗しました';
                this.toggle_progress_bar(false);
                this.snackbar.open('アップロードに失敗しました', 'OK', { duration: 2000 });
            }
        });
    }
}