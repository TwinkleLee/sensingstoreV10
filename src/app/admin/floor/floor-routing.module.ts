import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BuildingComponent } from './building/building.component'
import { FloorComponent } from './floor/floor.component'
import { RoomComponent } from './room/room.component'


@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    // { path: 'application', component: PageStatisticsComponent },
                    // { path: 'application/pagelist/:id', component: PageListComponent },
                    { path: 'building', component: BuildingComponent },
                    { path: 'floor', component: FloorComponent },
                    { path: 'room', component: RoomComponent },
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class FloorRoutingModule { }
