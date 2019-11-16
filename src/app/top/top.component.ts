import { Component, OnInit, ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { MatDialog, MatSnackBar } from '@angular/material';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
    selector: 'app-top',
    templateUrl: './top.component.html',
    styleUrls: ['./top.component.scss']
})
export class TopComponent implements OnInit {
    @ViewChild('stepper', { static: false }) private stepper: MatStepper;
    compile_type: string = 'markdown';
    template_type: string = 'report';
    title = 'cloudmd-front';
    files: File[] = [];
    dragging: boolean = false;
    constructor(
        public matDialog: MatDialog,
        public snackbar: MatSnackBar) { }
    classlist = [];

    logs: {
        type: string,
        body: string
    }[] = [];
    compiled: boolean = false;

    ngOnInit() {
        const self = this;
        this.consent = JSON.parse(localStorage.getItem('consent'));
        this.startAuth().then(value => {
            console.log('Authorized: ', this.passwd);
            self.snackbar.open('サーバーと接続しました！', 'OK', { duration: 2000 });
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
                self.socket.onclose = (e: CloseEvent) => {
                    self.matDialog.open(DialogComponent, {
                        data: {
                            message: `サーバーとの接続が切断されました(${e.code})`,
                            content: 'このページをリロードしてください',
                            actions: [{ label: 'リロード', fn: () => { location.reload() } }]
                        }
                    });
                };
                self.socket.onerror = (e: Event) => {
                    self.matDialog.open(DialogComponent, {
                        data: {
                            message: 'サーバーとの接続に失敗しました',
                            content: 'このページをリロードするか、時間が立ってからもう一度お試しください',
                            actions: [{ label: 'リロード', fn: () => { location.reload() } }]
                        }
                    });
                };
                self.socket.onmessage = (e: MessageEvent) => {
                    const data = JSON.parse(e.data);
                    if (data.type == 'logend') {
                        if (buffer) self.logs.push({ type: data.type, body: buffer });
                        if (data.body === 0) {
                            self.stepper.steps.last.select();
                            self.compiled = true;
                            self.snackbar.open('コンパイルに成功しました！PDFをダウンロードしてください', 'OK', { duration: 2000 });
                        } else {
                            self.snackbar.open('コンパイルに失敗しました。ログを確認してください', 'OK', { duration: 2000 });
                        }
                    } else {
                        for (const c of data.body) {
                            switch (c) {
                                case '\n':
                                    self.logs.push({ type: data.type, body: buffer });
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

    async  compile() {
        this.compiled = false;
        this.logs = [];
        const res = await fetch('/api/v1/exec/compile', {
            method: 'post',
            body: JSON.stringify({
                passwd: this.passwd,
                type: this.compile_type,
                template: this.template_type
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

    consent: boolean = false;

    onConsent() {
        localStorage.setItem('consent', JSON.stringify(this.consent));
    }

    onDragComes(){
        this.stepper.steps.first.select();
    }
}
