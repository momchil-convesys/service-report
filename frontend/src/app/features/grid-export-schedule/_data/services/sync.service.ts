import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { AccessControlPermission } from '../../../../constants';
import { UsersService } from '../../../../data/services/users.service';

@Injectable()
export class GridExportScheduleSyncService {
  private usersService = inject(UsersService);

  listNeedsUpdate$ = new BehaviorSubject<string | undefined>(undefined); // plantId
  resetFileList$ = new Subject<string>(); // plantId

  hasPermissionToToggleScheduleStatus = this.usersService.hasCurrentUserPermission(
    AccessControlPermission.GridExportSchedule_Manage,
  );
}
