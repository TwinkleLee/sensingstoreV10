import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { DownloadLogsComponent } from '@app/admin/downloadLogs/download-logs/download-logs.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: 'downloadLogs', component: DownloadLogsComponent },
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class DownloadLogsRoutingModule { }
