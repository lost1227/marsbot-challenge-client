import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BehaviorSubject, interval, map, ReplaySubject, Subject, take, takeUntil, timer } from 'rxjs';

@Component({
  selector: 'app-mars-upload-animation',
  templateUrl: './mars-upload-animation.component.html',
  styleUrls: ['./mars-upload-animation.component.scss']
})
export class MarsUploadAnimationComponent implements OnInit, OnDestroy {
  @Input() animationTimeSeconds!: number
  @Output() animationDoneEvent = new EventEmitter<void>();

  protected transmissionPos = new BehaviorSubject<number>(0);
  protected transmissionRot = new BehaviorSubject<string>("rotate(90deg)");

  private unsub = new Subject<void>();

  ngOnInit() {
    const steps = 9;
    timer(0, this.animationTimeSeconds * 1000 / (steps * 2)).pipe(
      takeUntil(this.unsub)
    ).subscribe(frame => {
      frame = frame % (steps * 2);
      if(frame < steps) {
        this.transmissionPos.next(frame / (steps-1));
        this.transmissionRot.next("rotate(90deg)");
      } else {
        this.transmissionPos.next(((steps*2 - 1) - frame) / (steps-1));
        this.transmissionRot.next("rotate(-90deg)")
      }
    })

    timer(this.animationTimeSeconds * 1000).subscribe(_ => {
      this.animationDoneEvent.emit();
    });
  }

  ngOnDestroy(): void {
    this.unsub.next();
  }
}
