import { Component } from '@angular/core';
import fx from 'glfx';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  defaultCornerCoords = {
    topLeft: [0.0, 0.0],
    topRight: [1.0, 0.0],
    bottomLeft: [0.0, 1.0],
    bottomRight: [1.0, 1.0],
  };
  advancedEditorImage = "";
  maxWidth = 500;
  maxHeight = null;
  canvas;
  texture;
  a = { x: 0, y: 0 };
  b = { x: 0, y: 0 };
  c = { x: 0, y: 0 };
  d = { x: 0, y: 0 };

  ngAfterViewInit() {
    var image = new Image();
    image.onload = () => {
      this.init(image);
    };
    image.src = './assets/perspective.jpg';
  }

  init(image) {
    const smallCanvas = this.createSmallCanvas(
      image,
      this.maxWidth,
      this.maxHeight
    );

    let c = document.getElementById('image-original') as any;
    let context = c.getContext('2d');
    c.width = smallCanvas.width;
    c.height = smallCanvas.height;

    this.maxWidth = c.width;
    this.maxHeight = c.height;

    this.a = { x: 0, y: 0 };
    this.b = { x: this.maxWidth, y: 0 };
    this.c = { x: 0, y: this.maxHeight };
    this.d = { x: this.maxWidth, y: this.maxHeight };

    context.drawImage(smallCanvas, 0, 0, smallCanvas.width, smallCanvas.height);

    let placeholder = document.getElementById('placeholder') as any;

    try {
      this.canvas = fx.canvas();
    } catch (e) {
      placeholder.innerHTML = e;
      return;
    }

    this.texture = this.canvas.texture(smallCanvas);
    this.canvas.draw(this.texture).update().replace(placeholder);
    this.canvas.draw(this.texture).update();
    this.advancedEditorImage = this.canvas.toDataURL('image/png');
  }

  pointMoved(event, point) {
    let { x, y } = event.source.getFreeDragPosition();
    switch (point) {
      case 1:
        this.a = event.source.getFreeDragPosition();
        break;
      case 2:
        this.b = { x: this.maxWidth + x, y: y };
        break;
      case 3:
        this.c = { x: x, y: this.maxHeight + y };
        break;
      case 4:
        this.d = { x: this.maxWidth + x, y: this.maxHeight + y };
        break;
    }

    this.applyEffects();
  }

  createSmallCanvas = (source, maxWidth, maxHeight) => {
    const sourceW = source.width;
    const sourceH = source.height;

    const wToHRatio = sourceH / sourceW;
    const hToWRatio = sourceW / sourceH;

    if (!maxWidth) maxWidth = source.width;
    if (!maxHeight) maxHeight = source.height;

    let targetW = maxWidth;
    let targetH = targetW * wToHRatio;

    if (sourceH > maxHeight) {
      targetH = maxHeight;
      targetW = targetH * hToWRatio;
    }

    const smallCanvas = document.createElement('canvas');
    const ctx = smallCanvas.getContext('2d');
    smallCanvas.width = targetW;
    smallCanvas.height = targetH;

    ctx.drawImage(source, 0, 0, sourceW, sourceH, 0, 0, targetW, targetH);

    return smallCanvas;
  };

  brightnessValue: number = 0;
  contrastValue: number = 0;
  hueValue: number = 0;
  saturationValue: number = 0;

  sliderChange(event, id) {
    switch (id) {
      case 1:
        this.brightnessValue = event;
        break;
      case 2:
        this.contrastValue = event;
        break;
      case 3:
        this.hueValue = event;
        break;
      case 4:
        this.saturationValue = event;
        break;
    }
    this.applyEffects();
  }

  applyEffects() {
    this.canvas.draw(this.texture)
    .perspective(
      [
        this.a.x, this.a.y,
        this.b.x, this.b.y,
        this.c.x, this.c.y,
        this.d.x, this.d.y,
      ],
      [
        0, 0, this.maxWidth, 0, 0, this.maxHeight, this.maxWidth, this.maxHeight,
      ]
    )
    .brightnessContrast(this.brightnessValue, this.contrastValue)
    .hueSaturation(this.hueValue, this.saturationValue).update();
    this.advancedEditorImage = this.canvas.toDataURL('image/png');
  }

  // downloadImage() {
  //   const linkSource = this.advancedEditorImage;
  //   const downloadLink = document.createElement("a");
  //   downloadLink.href = linkSource;
  //   downloadLink.download = 'edited-image';
  //   downloadLink.click();
  // }
}
