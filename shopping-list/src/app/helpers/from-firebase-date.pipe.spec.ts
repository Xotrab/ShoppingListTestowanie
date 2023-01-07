import { Timestamp } from '@angular/fire/firestore';
import { FromFirebaseDatePipe } from './from-firebase-date.pipe';

fdescribe('FromFirebaseDatePipe', () => {
  const pipe = new FromFirebaseDatePipe();

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('transforms firebase timestamp to miliseconds', () => {
    const input = new Timestamp(1000,0);
    expect(pipe.transform(input)).toBe(1000000);
  });

  it('returns the input unchanged if it is not a firebase timestamp', () => {
    const input = new Date();
    expect(pipe.transform(input)).toBe(input);
  });
});
