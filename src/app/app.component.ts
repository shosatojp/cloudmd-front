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
    dragging: boolean = false;
    constructor() { }
    classlist = [];

    ngOnInit() {
        this.startAuth().then(value => {
            console.log('auth end', this.passwd);
        }).catch((err) => {
            console.log(err);
        });
    }

    passwd: string;
    socket: WebSocket;
    startAuth() {
        const self = this;
        return new Promise(async (resolve, reject) => {
            const res: Response = await fetch('http://localhost:8082/api/v1/ws/start');
            if (res.status == 200) {
                self.passwd = (await res.json())['passwd'];
                self.socket = new WebSocket('ws://localhost:8082');
                self.socket.addEventListener('open', function (event) {
                    self.socket.send(JSON.stringify({ passwd: self.passwd }));
                    resolve();
                });
            } else {
                reject();
            }
        });
    }

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
