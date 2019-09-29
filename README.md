> Static asset revisioning by appending content hash to filenames
> ``unicorn.css` → `unicorn.css?_v=1`

## Install

```
$ npm install --save-dev gulp-tpl-rev
```

## Usage

```js
const gulp = require('gulp');
const rev = require('gulp-tpl-rev');

exports.default = () => (
	gulp.src('src/*.html')
		.pipe(rev({ name: '_v', hash: function() { return '1' }}))
		.pipe(gulp.dest('dist'))
);
```