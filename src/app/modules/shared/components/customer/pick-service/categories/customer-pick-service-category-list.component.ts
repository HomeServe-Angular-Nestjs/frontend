import { Component, effect, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-customer-pick-service-category-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-pick-service-category-list.component.html',
})
export class CustomerPickServiceCategoryListComponent implements OnInit {
  private readonly _route = inject(ActivatedRoute);

  private destroy$ = new Subject<void>();

  @Input({ required: true }) serviceCategories: { title: string, image: string, id: string }[] = [];
  @Output() categorySelectEvent = new EventEmitter<string>();

  selectedCategoryTitle: string | null = null;
  selectedCategoryId: string | null = null;

  ngOnInit(): void {
    this._route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(query => {

      });

    // effect(() => {
    //   const categoryId = this.selectedCategory();
    //   if (categoryId) { 

    //   }
    // })
  }

  selectCategory(selectedCategoryTitle: string) {
    this.selectedCategoryTitle = selectedCategoryTitle;
    this.categorySelectEvent.emit(selectedCategoryTitle);
  }
}

