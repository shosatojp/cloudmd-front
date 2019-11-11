import { Component, Input } from '@angular/core';

@Component({
    selector: 'single-file',
    templateUrl: './single-file.component.html',
    styleUrls: ['./single-file.component.scss']
})
export class SingleFile {
    @Input() file: File;
    constructor() {
    }
    setFile(file: File) {

        this.file = file;
    }
}