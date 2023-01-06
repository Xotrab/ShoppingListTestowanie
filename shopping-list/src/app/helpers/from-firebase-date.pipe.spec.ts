import { FromFirebaseDatePipe } from './from-firebase-date.pipe';

describe('FromFirebaseDatePipe', () => {
  it('create an instance', () => {
    const pipe = new FromFirebaseDatePipe();
    expect(pipe).toBeTruthy();
  });
});
