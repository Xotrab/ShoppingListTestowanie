import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';

@Pipe({
  name: 'fromFirebaseDate'
})
export class FromFirebaseDatePipe implements PipeTransform {

  transform(date: any): any {
    if (date instanceof Timestamp) {
      return date.seconds * 1000;
    }

    return date;
  }

}
