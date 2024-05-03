import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { BComponent } from '../../../b/src/app/b/b.component'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'a';
}
