import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// import { TagsComponent } from '@app/tags/tags/tags.component';

import { WeShopComponent } from '@app/admin/weshop/we-shop/we-shop.component';

//host线上店
import { HostOnlineStoreComponent } from '@app/admin/weshop/host-online-store/online-store.component';


@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: 'hostOnlineStore', component: HostOnlineStoreComponent },
                    { path: 'weshop', component: WeShopComponent },
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class WeshopRoutingModule { }
