import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

@Component({
  selector: 'app-image-avatar',
  templateUrl: './image-avatar.html',
  styleUrl: './image-avatar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageAvatar {
  readonly src = input<string | null | undefined>();
  readonly alt = input('');
  readonly fallback = input('JG');

  readonly maxWidth = input('100px');
  readonly height = input('40px');

  private readonly failedSrc = signal<string | null>(null);

  readonly showImage = computed(() => {
    const src = this.src();
    return !!src && src !== this.failedSrc();
  });

  onImageError(): void {
    this.failedSrc.set(this.src() ?? null);
  }
}
