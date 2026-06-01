import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { NzUploadFile, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { CustomError } from '../../../constants';
import { ApiService } from '../../../data/api';
import { MonbatPowerLimitScheduleDTO } from '../_data/dto';
import { MonbatService } from '../_data/monbat-sync.service';

@Component({
  selector: 'app-monbat-file-upload',
  templateUrl: './monbat-file-upload.component.html',
  styleUrls: ['./monbat-file-upload.component.less'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class MonbatFileUploadComponent implements OnChanges, OnInit, OnDestroy {
  @Input() context: { plantId: string; deviceId: string } | undefined;
  @Output() fileUpload = new EventEmitter<MonbatPowerLimitScheduleDTO>();

  fileList: NzUploadFile[] = [];

  customError$ = new BehaviorSubject<CustomError | undefined>(undefined);

  private _subscription: Subscription | undefined;

  constructor(
    private api: ApiService,
    private monbatService: MonbatService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.fileList = [];
  }

  ngOnInit(): void {
    this._subscription = this.monbatService.resetFileList$.subscribe((plantId) => {
      if (plantId === this.context?.plantId) {
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
    this.customError$.next(undefined);

    if (this.context === undefined) {
      throw `${this.constructor.name}: Missing context!`;
    }

    const url = this.constructFileUrl(this.context.plantId, this.context.deviceId);

    const formData = new FormData();
    formData.append(item.file.name, item.postFile as File);

    return this.api.http
      .post<MonbatPowerLimitScheduleDTO>(url, formData, {
        reportProgress: true,
        withCredentials: false,
        observe: 'response',
      })
      .subscribe({
        next: (event: HttpEvent<MonbatPowerLimitScheduleDTO>) => {
          switch (event.type) {
            case HttpEventType.Sent:
              break;

            case HttpEventType.UploadProgress:
              item.onProgress && item.onProgress(event, item.file);
              break;

            case HttpEventType.Response:
              {
                const scheduleItem: MonbatPowerLimitScheduleDTO | null = event.body;
                item.onSuccess && item.onSuccess(event.body, item.file, event);

                if (scheduleItem) {
                  this.fileUpload.next(scheduleItem);
                }
              }

              break;
          }
        },
        error: (errResponse: HttpErrorResponse) => {
          console.error('Failed to upload file! ERROR:', errResponse, item);

          item.onError && item.onError(errResponse.error || errResponse, item.file);

          this.customError$.next({
            title: `Failed to upload file "${item.file.name}"`,
            error: errResponse,
          });

          this.fileList = [];
        },
        complete: () => {},
      });
  };

  onUpload = (file: NzUploadFile): string | Observable<string> => {
    if (this.context === undefined) {
      throw `${this.constructor.name}: Missing context!`;
    }

    return this.constructFileUrl(this.context.plantId, this.context.deviceId);
  };

  private constructFileUrl(plantId: string, deviceId: string): string {
    return `${this.api.baseUrl}/monbat/power-limit-schedules/${plantId}/${deviceId}/upload`;
  }
}
