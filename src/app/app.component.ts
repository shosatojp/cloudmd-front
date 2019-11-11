import { Component } from '@angular/core';
import { SingleFile } from './single-file/single-file.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'cloudmd-front';
    files: File[] = [];
    constructor() {
    }
    classlist = [];
    onDragover(e) {
        if (!~this.classlist.indexOf('ondrag')) {
            this.classlist = this.classlist.concat('ondrag');
        }
        e.preventDefault();
    }

    onDragleave(e) {
        this.classlist = this.classlist.filter(e => e != 'ondrag');
        e.preventDefault();
    }
    onDragEnter(e) {
        e.preventDefault();
    }

    onDrop(e: DragEvent) {
        e.preventDefault();
        console.log(e.dataTransfer.files);
        const files = e.dataTransfer.files;
        for (const key in files) {
            if (files.hasOwnProperty(key)) {
                this.files = this.files.concat(files[key]);
            }
        }
    }

    hoge() {
        console.log('hige');
    }
}
