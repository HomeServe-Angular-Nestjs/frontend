import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-incoming-call-floating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed bottom-6 right-6 bg-white shadow-2xl rounded-2xl p-4 w-72 border border-gray-200 cursor-move transition-all"
      cdkDrag
    >
      <h2 class="text-lg font-semibold text-gray-800 mb-2">📞 Incoming Call</h2>
      <p class="text-gray-600 mb-4">Caller: <strong>{{ callerId }}</strong></p>
      <div class="flex justify-between">
        <button
          class="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 w-[45%]"
          (click)="decline.emit()"
        >
          Decline
        </button>
        <button
          class="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 w-[45%]"
          (click)="accept.emit()"
        >
          Accept
        </button>
      </div>
    </div>
  `,
})
export class IncomingCallFloatingComponent {
  @Input() callerId!: string;
  @Output() accept = new EventEmitter<void>();
  @Output() decline = new EventEmitter<void>();
}
