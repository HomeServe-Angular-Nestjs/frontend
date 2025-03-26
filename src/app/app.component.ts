import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignupBaseComponent } from "./modules/shared/components/signup/signup-base/signup-base.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend';
}
