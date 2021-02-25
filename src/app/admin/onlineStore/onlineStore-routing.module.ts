import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { OnlineStoreComponent } from '@app/admin/onlineStore/online-store/online-store.component';
import { OnlineStoreHistoryComponent } from '@app/admin/onlineStore/online-store/online-store-history.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: 'onlineStore', component: OnlineStoreComponent, data: { permission: 'Pages.Tenant.OnlineStores' } },
                    { path: 'onlineStoreHistory', component: OnlineStoreHistoryComponent, data: { permission: 'Pages.Tenant.OnlineStores' } },
                    
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class OnlineStoreRoutingModule { }
