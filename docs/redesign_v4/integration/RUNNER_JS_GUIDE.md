# Runner JS Guide

```html
<div id="loading-scene">
  <img class="loading-bg" src="screens/loading/loading_pc_1920x1080.png" alt="">
  <img id="runner" src="assets/characters/main_character_runner.png" alt="">
</div>
```

```css
#loading-scene { position: relative; overflow: hidden; }
.loading-bg { display: block; width: 100%; height: 100%; object-fit: cover; }
#runner {
  position: absolute;
  width: clamp(86px, 10vw, 190px);
  transform: translate(-50%, -86%);
  transform-origin: 50% 86%;
  pointer-events: none;
}
```

```js
const routes = {
  pc: [
    {x:18,y:72}, {x:39,y:64}, {x:51,y:55},
    {x:64,y:47}, {x:71,y:40}, {x:75,y:30}
  ],
  mobile: [
    {x:50,y:87}, {x:49,y:68}, {x:72,y:58},
    {x:49,y:51}, {x:59,y:44}, {x:66,y:33}
  ]
};

function pointAt(points, progress) {
  const t = Math.max(0, Math.min(1, progress)) * (points.length - 1);
  const index = Math.min(Math.floor(t), points.length - 2);
  const ratio = t - index;
  return {
    x: points[index].x + (points[index + 1].x - points[index].x) * ratio,
    y: points[index].y + (points[index + 1].y - points[index].y) * ratio
  };
}

function setLoadingProgress(progress) {
  const mode = matchMedia('(orientation: portrait)').matches ? 'mobile' : 'pc';
  const point = pointAt(routes[mode], progress);
  const runner = document.querySelector('#runner');
  runner.style.left = point.x + '%';
  runner.style.top = point.y + '%';
}
```

`progress` nhận giá trị từ `0` đến `1`. Track và fill của progress bar được đặt riêng để cắt chiều rộng theo phần trăm tải.

