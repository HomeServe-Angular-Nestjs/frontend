import { AfterViewInit, Component, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerBreadcrumbsComponent } from "../../../shared/partials/sections/customer/breadcrumbs/customer-breadcrumbs.component";

@Component({
  selector: 'app-customer-pick-a-service',
  standalone: true,
  imports: [CommonModule, CustomerBreadcrumbsComponent],
  templateUrl: './customer-pick-a-service.component.html',
})
export class CustomerPickAServiceComponent implements AfterViewInit {
  constructor(private renderer: Renderer2, private elRef: ElementRef) { }

  ngAfterViewInit(): void {
    // Category selection
    const categoryItems = this.elRef.nativeElement.querySelectorAll('.category-item');
    categoryItems.forEach((item: HTMLElement) => {
      this.renderer.listen(item, 'click', () => {
        categoryItems.forEach((el: HTMLElement) => el.classList.remove('active'));
        item.classList.add('active');
      });
    });

    const buttons = Array.from(this.elRef.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];

    const addButtons = buttons.filter(btn => btn.textContent?.trim() === 'Add');

    addButtons.forEach(button => {
      this.renderer.listen(button, 'click', () => {
        alert('Service added to cart!');
      });
    });
  }
}
