import { Component, OnInit, ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-top',
  templateUrl: './top.component.html',
  styleUrls: ['./top.component.scss']
})
export class TopComponent implements OnInit {
    @ViewChild('stepper', { static: false }) private stepper: MatStepper;
    compile_type: string = 'markdown';
    title = 'cloudmd-front';
    files: File[] = [];
    dragging: boolean = false;
    constructor() { }
    classlist = [];

    logs: {
        type: string,
        body: string
    }[] = [];
    compiled: boolean = false;

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
        let buffer: string = '';
        return new Promise(async (resolve, reject) => {
            const res: Response = await fetch('/api/v1/ws/start');
            if (res.status == 200) {
                const logs_element = document.querySelector('#logs');
                self.passwd = (await res.json())['passwd'];
                self.socket = new WebSocket(`wss://${location.host}`);
                self.socket.addEventListener('open', function (event) {
                    self.socket.send(JSON.stringify({ passwd: self.passwd }));
                    resolve();
                });
                self.socket.onmessage = (e: MessageEvent) => {
                    const data = JSON.parse(e.data);
                    if (data.type == 'logend') {
                        if (buffer) this.logs.push({ type: data.type, body: buffer });
                        if (data.body === 0) {
                            this.stepper.steps.last.select();
                            this.compiled = true;
                        }
                    } else {
                        for (const c of data.body) {
                            switch (c) {
                                case '\n':
                                    this.logs.push({ type: data.type, body: buffer });
                                    logs_element.scrollTop = logs_element.scrollHeight;
                                    buffer = '';
                                    break;
                                default:
                                    buffer += c;
                                    break;
                            }
                        }
                    }
                };
            } else {
                reject();
            }
        });
    }

    async compile() {
        console.log(this.compile_type);
        this.compiled = false;
        this.logs = [];
        const res = await fetch('/api/v1/exec/compile', {
            method: 'post',
            body: JSON.stringify({
                passwd: this.passwd,
                type: this.compile_type
            }),
            headers: {
                'content-type': 'application/json',
            }
        });
        if (res.status !== 200) {
            console.log('failed to compile');
        }
    }

    download(ext) {
        const link = document.createElement('a');
        link.href = `/data/${this.passwd}/main${ext}`;
        link.download = `main${ext}`;
        link.click();
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
        const files = e.dataTransfer.files;
        for (const key in files) {
            if (files.hasOwnProperty(key)) {
                if (key in this.files) {
                    this.files = this.files.filter(e => e.name != files[key].name);
                }
                this.files = this.files.concat(files[key]);
            }
        }
    }
}
