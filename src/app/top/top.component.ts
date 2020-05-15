import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { MatDialog, MatSnackBar } from '@angular/material';
import { DialogComponent } from '../dialog/dialog.component';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-top',
    templateUrl: './top.component.html',
    styleUrls: ['./top.component.scss']
})
export class TopComponent implements OnInit {
    @ViewChild('stepper', { static: false }) private stepper: MatStepper;
    browser: string;
    compile_type: string = 'markdown';
    template_type: string = 'report';
    title = 'cloudmd-front';
    files: File[] = [];
    dragging: boolean = false;
    pdf_minorversion: string = localStorage.getItem('pdfminorversion') || '5';
    constructor(
        public matDialog: MatDialog,
        public snackbar: MatSnackBar,
        private sanitizer: DomSanitizer) {
        if (~navigator.appVersion.indexOf('Edge')) {
            // this.browser = 'edge';
        }
    }

    logs: {
        type: string,
        body: string
    }[] = [];
    compiled: boolean = false;
    safepdfurl: SafeResourceUrl = undefined;

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

    connectWebSocket(): Promise<WebSocket> {
        return new Promise((res, rej) => {
            const self = this;
            let buffer: string = '';
            const logs_element = document.querySelector('#logs');

            const socket: WebSocket = new WebSocket(`${location.protocol.replace('http', 'ws')}//${location.host}`);
            self.socket = socket;
            socket.addEventListener('open', function (event) {
                socket.send(JSON.stringify({ passwd: self.passwd }));
                res(socket);
            });
            let haserror = false;
            socket.onclose = async (e: CloseEvent) => {
                if (!haserror) {
                    console.log('trying reconnect to server.');
                    self.socket = await this.connectWebSocket();
                }
                // self.matDialog.open(DialogComponent, {
                //     data: {
                //         message: `サーバーとの接続が切断されました(${e.code})`,
                //         content: 'このページをリロードしてください',
                //         actions: [{ label: 'リロード', fn: () => { location.reload() } }]
                //     }
                // });
            };
            socket.onerror = (e: Event) => {
                haserror = true;
                self.matDialog.open(DialogComponent, {
                    data: {
                        message: 'サーバーとの接続に失敗しました',
                        content: 'このページをリロードするか、時間が立ってからもう一度お試しください',
                        actions: [{ label: 'リロード', fn: () => { location.reload() } }]
                    }
                });
            };
            socket.onmessage = (e: MessageEvent) => {
                const data = JSON.parse(e.data);
                if (data.type == 'logend') {
                    if (buffer) self.logs.push({ type: data.type, body: buffer });
                    if (data.body === 0) {
                        self.stepper.steps.last.select();
                        self.compiled = true;
                        self.snackbar.open('コンパイルに成功しました！PDFをダウンロードしてください', 'OK', { duration: 2000 });
                        // self.safepdfurl = self.sanitizer.bypassSecurityTrustResourceUrl(`data/${self.passwd}/main.pdf`);
                        self.safepdfurl = self.sanitizer.bypassSecurityTrustResourceUrl(`/pdfjs/web/viewer.html?file=/data/${self.passwd}/main.pdf`);
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
        });
    }
    async startAuth() {
        const res: Response = await fetch('/api/v1/ws/start');
        if (res.status == 200) {
            this.passwd = (await res.json())['passwd'];
            this.socket = await this.connectWebSocket();
        } else {
            throw new Error();
        }
    }

    async  compile() {
        this.compiled = false;
        this.logs = [];
        const res = await fetch('/api/v1/exec/compile', {
            method: 'post',
            body: JSON.stringify({
                passwd: this.passwd,
                type: this.compile_type,
                template: this.template_type,
                pdf_minorversion: this.pdf_minorversion,
            }),
            headers: {
                'content-type': 'application/json',
            }
        });
        if (res.status !== 200) {
            console.log('failed to compile');
        }
    }

    async download(filename: string) {
        const path = `/api/v1/download/file/${this.passwd}/${filename}`;
        const res = await fetch(path, { method: 'head' });
        if (res.status === 200) {
            const link = document.createElement('a');
            if (link.download !== undefined) {
                link.href = path;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                window.open(location.origin + path, '_blank');
            }
        } else {
            this.snackbar.open('ファイルは存在しません', 'OK', { duration: 2000 });
        }
    }

    onDragover(e) {
        this.dragging = true;
        e.preventDefault();
    }
    onDragleave(e) {
        this.dragging = false;
        e.preventDefault();
    }
    onDragEnd(e) {
        this.dragging = false;
        e.preventDefault();
    }
    onDragEnter(e) {
        this.dragging = true;
        e.preventDefault();
    }

    onDrop(e: DragEvent) {
        this.dragging = false;
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

        // count md
        this.compile_type = (this.files.filter(e => e.name.endsWith('.md')).length) ? 'markdown' : 'tex';
    }



    consent: boolean = false;

    onConsent() {
        localStorage.setItem('consent', JSON.stringify(this.consent));
    }

    onDragComes() {
        this.stepper.steps.first.select();
    }

    onPDFMinorVersionChanged() {
        localStorage.setItem('pdfminorversion', this.pdf_minorversion);
    }
}
