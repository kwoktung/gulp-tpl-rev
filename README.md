# gulp-tpl-rev [![Build Status](https://api.travis-ci.org/kwoktung/gulp-tpl-rev.svg?branch=master)](https://travis-ci.org/kwoktung/gulp-tpl-rev)

> Static asset revisioning by appending content hash to filenames
> ``unicorn.css` → `unicorn.css?_v=995025`

## Install

```
$ npm install --save-dev gulp-tpl-rev
```

## Usage

```js
const gulp = require('gulp');
const tpl = require('gulp-tpl-rev');
const crypto = require('crypto');
const path = require('path');
const fs= require('fs')

exports.default = () => (
	gulp.src('src/*.html')
		.pipe(tpl({
			name: '_v',
			hash: function(pathname) {
				const { ext } = path.parse(pathname)
				const fullpath = path.join(__dirname, 'wwwroot', pathname)
				if (fs.existsSync(fullpath)) {
					const file = fs.readFileSync(fullpath, 'utf8')
					const md5 = crypto.createHash('md5');
					md5.update(file);
					return md5.digest('hex').slice(0, 6)
				}
				return ""
			}
		}))
		.pipe(gulp.dest('dist'))
);
```