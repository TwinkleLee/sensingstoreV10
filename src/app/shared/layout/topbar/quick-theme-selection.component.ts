import { Component, Injector, Input } from '@angular/core';
import { DateTimeService } from '@app/shared/common/timing/date-time.service';
import { ThemesLayoutBaseComponent } from '../themes/themes-layout-base.component';
import { AppConsts } from '@shared/AppConsts';

@Component({
    selector: 'quick-theme-selection',
    templateUrl: './quick-theme-selection.component.html'
})
export class QuickThemeSelectionComponent extends ThemesLayoutBaseComponent {

    //V3
    // isQuickThemeSelectEnabled: boolean = this.setting.getBoolean('App.UserManagement.IsQuickThemeSelectEnabled');
    isQuickThemeSelectEnabled = true;
    customTheme = AppConsts.customTheme;

    @Input() customStyle = 'btn btn-icon btn-clean btn-lg mr-1';

    public constructor(
        injector: Injector,
        _dateTimeService: DateTimeService
    ) {
        super(injector, _dateTimeService);
    }
}
