import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { NzUploadFile, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { ApiService } from 'src/app/data/api';
import { CustomError } from '../../../constants';
import { PowerScheduleSyncService } from '../_data/power-schedule-sync.service';
import { PowerScheduleDTO } from '../_data/power-schedule.dto';
@Component({
  selector: 'app-power-schedule-file-upload',
  templateUrl: './power-schedule-file-upload.component.html',
  styleUrls: ['./power-schedule-file-upload.component.less'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class PowerScheduleFileUploadComponent implements OnChanges {
  @Input() plantId: string | undefined;
  @Output() fileUpload = new EventEmitter<PowerScheduleDTO>();

  fileList: NzUploadFile[] = [];

  customError$ = new BehaviorSubject<CustomError | null>(null);

  private _subscription: Subscription | undefined;

  constructor(
    private baseApi: ApiService,
    private powerScheduleSyncService: PowerScheduleSyncService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.fileList = [];
  }

  ngOnInit(): void {
    this._subscription = this.powerScheduleSyncService.resetFileList$.subscribe((plantId) => {
      if (plantId === this.plantId) {
        this.fileList = [];
      }
    });
  }
  ngOnDestroy(): void {
    this._subscription?.unsubscribe();
  }

  setUploadHeaders = (file: any) => {
    return {
      'Content-Type': 'multipart/form-data',
      Accept: 'application/json',
    };
  };

  customRequest = (item: NzUploadXHRArgs): Subscription => {
    this.customError$.next(null);

    if (this.plantId === undefined) {
      throw `${this.constructor.name}: Missing plant ID!`;
    }

    const url = this.constructFileUrl(this.plantId);

    const formData = new FormData();
    formData.append(item.file.name, item.postFile as File);

    return this.baseApi.http
      .post<PowerScheduleDTO>(url, formData, {
        reportProgress: true,
        withCredentials: false,
        observe: 'response',
      })
      .subscribe({
        next: (event: HttpEvent<PowerScheduleDTO>) => {
          switch (event.type) {
            case HttpEventType.Sent:
              break;

            case HttpEventType.UploadProgress:
              item.onProgress && item.onProgress(event, item.file);
              break;

            case HttpEventType.Response:
              {
                const scheduleItem: PowerScheduleDTO | null = event.body;
                item.onSuccess && item.onSuccess(event.body, item.file, event);

                if (scheduleItem) {
                  this.fileUpload.next(scheduleItem);
                }
              }

              break;
          }
        },
        error: (err: HttpErrorResponse) => {
          console.error('Failed to upload file! ERROR:', err, item);

          item.onError && item.onError(err.error || err, item.file);

          this.customError$.next({
            title: `Failed to upload file "${item.file.name}"`,
            error: err,
          });

          this.fileList = [];
        },
        complete: () => {},
      });
  };

  onUpload = (file: NzUploadFile): string | Observable<string> => {
    if (this.plantId === undefined) {
      throw `${this.constructor.name}: Missing plant ID!`;
    }

    return this.constructFileUrl(this.plantId);
  };

  private constructFileUrl(plantId: string): string {
    return `${this.baseApi.baseUrl}/power-schedules/${plantId}/upload`;
  }
}
