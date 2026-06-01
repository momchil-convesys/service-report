import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { finalize } from 'rxjs';
import { LocalAuthService } from './local-auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, NzAlertModule, NzButtonModule, NzCardModule, NzFormModule, NzInputModule],
})
export class LoginComponent {
  username = 'user';
  password = 'user';
  isLoading = false;
  error: string | undefined;

  constructor(
    private auth: LocalAuthService,
    private router: Router,
  ) {}

  onSubmit(): void {
    this.error = undefined;
    this.isLoading = true;

    this.auth
      .login(this.username, this.password)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => this.router.navigate(['/service-reports/mock-plant-1']),
        error: () => {
          this.error = 'Invalid username or password.';
        },
      });
  }
}
