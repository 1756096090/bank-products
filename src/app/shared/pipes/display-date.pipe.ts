import { formatDate } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'displayDate' })
export class DisplayDatePipe implements PipeTransform {
  transform(value: string | number | Date | null | undefined): string {
    if (value == null || value === '') return '';

    return formatDate(value, 'dd/MM/yyyy', 'en-US', 'UTC');
  }
}
