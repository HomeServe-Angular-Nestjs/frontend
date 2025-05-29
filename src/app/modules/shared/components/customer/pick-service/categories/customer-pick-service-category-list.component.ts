import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customer-pick-service-category-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-pick-service-category-list.component.html',
})
export class CustomerPickServiceCategoryListComponent {
  @Input({ required: true }) serviceCategories: { title: string, image: string }[] = [];
  @Output() categorySelectEvent = new EventEmitter<string>();

  selectedCategory: string | null = null;

  selectCategory(categoryTitle: string) {
    this.selectedCategory = categoryTitle;
    this.categorySelectEvent.emit(categoryTitle);
  }
}

