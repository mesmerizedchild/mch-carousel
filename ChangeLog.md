# MCh Carousel Change Log

## 1.1 [January 2016]
* Features:
** Changed the attribute for the on-hover image from data-img-over to data-src-hover. data-img-over is still accepted for backwards compatibility with release 1.0.
** Added support for srcset and size attributes for responsive images.
** Added support for responsive on-hover images; data-srcset-hover and data-sizes-hover will be used for the on-hover image.
** Automatic integration with [picturefill](http://scottjehl.github.io/picturefill/) for responsive on-hover images [neeeded for browsers that do not support responsive images natively].
** Updated to use jQuery 2.2.0. Considering the limited scope of the changes in this release, MCh Carousel 1.1 should still work with jQuery 2.1.4, but that has not been tested.
* Improvements:
** Internet Explorer and Edge do not resize images correctly if the height of the carousel is expressed as a relative unit [for example, vw or vh]. MCh Carousel now implements a workaround to this browser problem.
** Changed documentation to adapt to the latest release of [fancytree](https://github.com/mar10/fancytree).
* Minor changes:
** Moved source directory src/doc/css to src/doc/less.

## 1.0 [September 10th 2015]
* Initial release.
