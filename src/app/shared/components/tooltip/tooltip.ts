import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

let nextTooltipId = 0;

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.html',
  styleUrl: './tooltip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
    '(focusin)': 'show()',
    '(focusout)': 'hide()',
    '(document:keydown.escape)': 'hide()',
    '(window:resize)': 'hide()',
  },
})
export class Tooltip {
  readonly text = input.required<string>();
  readonly label = input('Más información');
  readonly position = input<'top' | 'bottom'>('top');
  readonly id = `app-tooltip-${nextTooltipId++}`;
  readonly visible = signal(false);
  readonly placement = signal<'top' | 'bottom'>('top');
  readonly left = signal(0);
  readonly top = signal(0);
  readonly arrowLeft = signal(0);

  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly bubble = viewChild.required<ElementRef<HTMLElement>>('bubble');

  constructor() {
    const document = inject(DOCUMENT);
    const hide = () => this.hide();
    document.addEventListener('scroll', hide, true);
    inject(DestroyRef).onDestroy(() => document.removeEventListener('scroll', hide, true));
  }

  show(): void {
    const trigger = this.trigger().nativeElement.getBoundingClientRect();
    const bubble = this.bubble().nativeElement.getBoundingClientRect();
    const margin = 8;
    const gap = 10;
    const center = trigger.left + trigger.width / 2;
    const left = Math.max(
      margin,
      Math.min(center - bubble.width / 2, window.innerWidth - bubble.width - margin),
    );
    let placement = this.position();
    if (placement === 'top' && trigger.top < bubble.height + gap + margin) placement = 'bottom';
    else if (
      placement === 'bottom' &&
      trigger.bottom + gap + bubble.height > window.innerHeight - margin
    )
      placement = 'top';

    this.placement.set(placement);
    this.left.set(left);
    this.top.set(placement === 'top' ? trigger.top - bubble.height - gap : trigger.bottom + gap);
    this.arrowLeft.set(Math.max(12, Math.min(center - left, bubble.width - 12)));
    this.visible.set(true);
  }

  hide(): void {
    this.visible.set(false);
  }
}
