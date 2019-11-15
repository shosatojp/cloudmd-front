import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HelpComponent } from './help/help.component';
import { TopComponent } from './top/top.component';


const routes: Routes = [
    { path: '', component: TopComponent },
    { path: 'help', component: HelpComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
