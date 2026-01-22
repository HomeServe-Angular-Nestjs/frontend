import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-incoming-call-floating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed bottom-6 right-6 bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl p-6 w-80 border border-white/20 ring-1 ring-black/5 cursor-move transition-all animate-bounce-in"
      cdkDrag
    >
      <div class="flex items-center gap-4 mb-6">
        <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
           <i class="fa-solid fa-phone-volume text-xl animate-pulse"></i>
        </div>
        <div>
           <h2 class="text-lg font-bold text-gray-900 leading-none">Incoming Call</h2>
           <p class="text-sm text-gray-500 mt-1 truncate max-w-[10rem]">{{ callerId }}</p>
        </div>
      </div>

      <div class="flex justify-between gap-3">
        <button
          class="flex-1 bg-red-100 hover:bg-red-200 text-red-600 font-medium rounded-xl py-2.5 transition-colors flex items-center justify-center gap-2"
          (click)="decline.emit()"
        >
          <i class="fa-solid fa-xmark"></i> Decline
        </button>
        <button
          class="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-xl py-2.5 shadow-lg shadow-green-500/30 transition-all flex items-center justify-center gap-2"
          (click)="accept.emit()"
        >
          <i class="fa-solid fa-phone"></i> Accept
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
