// global variables
;var browser, elemIsHidden, ajax, animate;

(function () {
	'use strict';

	// Get useragent

	document.documentElement.setAttribute('data-useragent', navigator.userAgent.toLowerCase());

	// Browser identify
	browser = function (userAgent) {
		userAgent = userAgent.toLowerCase();

		if (/(msie|rv:11\.0)/.test(userAgent)) {
			return 'ie';
		} else if (/firefox/.test(userAgent)) {
			return 'ff';
		}
	}(navigator.userAgent);

	// Add support CustomEvent constructor for IE
	try {
		new CustomEvent("IE has CustomEvent, but doesn't support constructor");
	} catch (e) {
		window.CustomEvent = function (event, params) {
			var evt = document.createEvent("CustomEvent");

			params = params || {
				bubbles: false,
				cancelable: false,
				detail: undefined
			};

			evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);

			return evt;
		};

		CustomEvent.prototype = Object.create(window.Event.prototype);
	}

	// Window Resized Event
	var winResizedEvent = new CustomEvent('winResized'),
	    winWidthResizedEvent = new CustomEvent('winWidthResized');

	var rsz = true,
	    beginWidth = window.innerWidth;

	window.addEventListener('resize', function () {
		if (rsz) {
			rsz = false;

			setTimeout(function () {
				window.dispatchEvent(winResizedEvent);

				if (beginWidth != window.innerWidth) {
					window.dispatchEvent(winWidthResizedEvent);

					beginWidth = window.innerWidth;
				}

				rsz = true;
			}, 1021);
		}
	});

	// Closest polyfill
	if (!Element.prototype.closest) {
		(function (ElProto) {
			ElProto.matches = ElProto.matches || ElProto.mozMatchesSelector || ElProto.msMatchesSelector || ElProto.oMatchesSelector || ElProto.webkitMatchesSelector;

			ElProto.closest = ElProto.closest || function closest(selector) {
				if (!this) {
					return null;
				}

				if (this.matches(selector)) {
					return this;
				}

				if (!this.parentElement) {
					return null;
				} else {
					return this.parentElement.closest(selector);
				}
			};
		})(Element.prototype);
	}

	// Check element for hidden
	elemIsHidden = function elemIsHidden(elem) {
		while (elem) {
			if (!elem) break;

			var compStyle = getComputedStyle(elem);

			if (compStyle.display == 'none' || compStyle.visibility == 'hidden' || compStyle.opacity == '0') return true;

			elem = elem.parentElement;
		}

		return false;
	};

	// Ajax
	ajax = function ajax(options) {
		var xhr = new XMLHttpRequest();

		if (options.method == 'GET') {
			xhr.open('GET', options.url);

			options.send = null;
		} else {
			xhr.open('POST', options.url);

			if (typeof options.send == 'string') {
				xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			}
		}

		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4 && xhr.status == 200) {
				if (options.success) {
					options.success(xhr.response);
				}
			} else if (xhr.readyState == 4 && xhr.status != 200) {
				if (options.error) {
					options.error(xhr.response);
				}
			}
		};

		xhr.send(options.send);
	};

	/*
 Animation
 animate(function(takes 0...1) {}, Int duration in ms[, Str easing[, Fun animation complete]]);
 */
	animate = function animate(draw, duration, ease, complete) {
		var start = performance.now();

		requestAnimationFrame(function anim(time) {
			var timeFraction = (time - start) / duration;

			if (timeFraction > 1) {
				timeFraction = 1;
			}

			draw(ease ? easing(timeFraction, ease) : timeFraction);

			if (timeFraction < 1) {
				requestAnimationFrame(anim);
			} else {
				if (complete !== undefined) {
					complete();
				}
			}
		});
	};

	function easing(timeFraction, ease) {
		switch (ease) {
			case 'easeInQuad':
				return quad(timeFraction);

			case 'easeOutQuad':
				return 1 - quad(1 - timeFraction);

			case 'easeInOutQuad':
				if (timeFraction <= 0.5) {
					return quad(2 * timeFraction) / 2;
				} else {
					return (2 - quad(2 * (1 - timeFraction))) / 2;
				}
		}
	}

	function quad(timeFraction) {
		return Math.pow(timeFraction, 2);
	}
})();
/* 
	MobNav.init({
		openBtn: '.js-open-menu',
		closeBtn: '.js-close-menu',
		headerId: 'header',
		closeLink: '.menu a.js-anchor'
	});
*/

;var MobNav;

(function () {
	'use strict';

	// fix header

	var headerElem = document.getElementById('header');

	function fixHeader() {
		if (window.pageYOffset > 0) {
			headerElem.classList.add('header_fixed');
		} else if (!document.body.classList.contains('popup-is-opened') && !document.body.classList.contains('mob-nav-is-opened')) {
			headerElem.classList.remove('header_fixed');
		}
	}

	fixHeader();

	window.addEventListener('scroll', fixHeader);

	//mob menu
	MobNav = {
		options: null,
		winScrollTop: 0,

		fixBody: function fixBody(st) {
			if (st) {
				this.winScrollTop = window.pageYOffset;
				
				

				document.body.classList.add('mob-nav-is-opened');
				document.body.style.top = -this.winScrollTop + 'px';
			} else {
				document.body.classList.remove('mob-nav-is-opened');
				if (this.winScrollTop > 0) {
					window.scrollTo(0, this.winScrollTop);
				} 
				document.body.style.top = '';


			}
		},

		open: function open(btnElem) {
			var headerElem = document.getElementById(this.options.headerId);

			if (!headerElem) return;

			var offset = window.innerWidth - document.documentElement.clientWidth;
			headerElem.style.right = offset + 'px';
			document.body.style.right = offset + 'px';

			if (btnElem.classList.contains('opened')) {
				headerElem.style.right = '';
				document.body.style.right = '';
	
				this.close();
			} else {
				btnElem.classList.add('opened');
				headerElem.classList.add('opened');
				this.fixBody(true);
			}
		},

		close: function close(e) {
			var headerElem = document.getElementById(this.options.headerId);
			if (!headerElem) return;

			headerElem.classList.remove('opened');

			var openBtnElements = document.querySelectorAll(this.options.openBtn);

			for (var i = 0; i < openBtnElements.length; i++) {
				openBtnElements[i].classList.remove('opened');
			}
			headerElem.style.right = '';
			this.fixBody(false);
		},

		init: function init(options) {
			var _this = this;

			this.options = options;

			document.addEventListener('click', function (e) {
				var openElem = e.target.closest(options.openBtn);

				if (openElem) {
					e.preventDefault();
					_this.open(openElem);
				} else if (e.target.closest(options.closeBtn)) {
					e.preventDefault();
					_this.close();
				} else if (e.target.closest(options.closeLink)) {
					_this.close();
				}
			});
		}
	};
})();
/*
* call Menu.init(Str menu item selector, Str sub menu selector);
*/
var Menu;

(function () {
	'use strict';

	Menu = {
		toggle: function toggle(elem, elementStr, subMenuStr) {
			var subMenuElem = elem.querySelector(subMenuStr);

			if (!subMenuElem) {
				return;
			}

			if (elem.classList.contains('active')) {
				subMenuElem.style.height = 0;

				elem.classList.remove('active');
			} else {
				var mainElem = elem.closest('.menu'),
				    itemElements = mainElem.querySelectorAll(elementStr),
				    subMenuElements = mainElem.querySelectorAll(subMenuStr);

				for (var i = 0; i < itemElements.length; i++) {
					itemElements[i].classList.remove('accord__button_active');
					subMenuElements[i].style.height = 0;
				}

				subMenuElem.style.height = subMenuElem.scrollHeight + 'px';

				elem.classList.add('active');
			}
		},

		init: function init(elementStr, subMenuStr) {
			var _this = this;

			document.addEventListener('click', function (e) {
				var elem = e.target.closest(elementStr);

				if (!elem) {
					return;
				}

				_this.toggle(elem, elementStr, subMenuStr);
			});
		}
	};
})();
var Popup;

(function () {
	'use strict';

	//popup core

	Popup = {
		winScrollTop: 0,
		onClose: null,
		_onclose: null,
		onOpen: null,
		headerSelector: '.header',

		fixBody: function fixBody(st) {
			var headerElem = document.querySelector(this.headerSelector);

			if (st && !document.body.classList.contains('popup-is-opened')) {
				this.winScrollTop = window.pageYOffset;

				var offset = window.innerWidth - document.documentElement.clientWidth;

				document.body.classList.add('popup-is-opened');

				if (headerElem) {
					headerElem.style.right = offset + 'px';
				}

				document.body.style.right = offset + 'px';

				document.body.style.top = -this.winScrollTop + 'px';
			} else if (!st) {
				if (headerElem) {
					headerElem.style.right = '';
				}

				document.body.classList.remove('popup-is-opened');

				window.scrollTo(0, this.winScrollTop);
			}
		},

		open: function open(elementStr, callback, btnElem) {
			var elem = document.querySelector(elementStr);

			if (!elem || !elem.classList.contains('popup__window')) {
				return;
			}

			this.close();

			var elemParent = elem.parentElement;

			elemParent.classList.add('popup_visible');

			elemParent.scrollTop = 0;

			elem.classList.add('popup__window_visible');

			if (callback) {
				this._onclose = callback;
			}

			this.fixBody(true);

			if (this.onOpen) {
				this.onOpen(elementStr, btnElem);
			}

			return elem;
		},

		message: function message(msg, elementStr, callback) {
			var elemStr = elementStr || '#message-popup',
			    elem = this.open(elemStr, callback);

			elem.querySelector('.popup__inner').innerHTML = '<div class="popup__message m-0">' + msg + '</div>';
		},

		close: function close() {
			var elements = document.querySelectorAll('.popup__window');

			if (!elements.length) {
				return;
			}

			for (var i = 0; i < elements.length; i++) {
				var elem = elements[i];

				if (!elem.classList.contains('popup__window_visible')) {
					continue;
				}

				elem.classList.remove('popup__window_visible');

				elem.parentElement.classList.remove('popup_visible');
			}

			if (this._onclose) {
				this._onclose();
				this._onclose = null;
			} else if (this.onClose) {
				this.onClose();
			}
		},

		init: function init(elementStr) {
			var _this = this;

			document.addEventListener('click', function (e) {
				var btnElem = e.target.closest(elementStr),
				    closeBtnElem = e.target.closest('.js-popup-close');

				if (btnElem) {
					e.preventDefault();
					_this.open(btnElem.getAttribute('data-popup'), false, btnElem);
				} else if (closeBtnElem || !e.target.closest('.popup__window') && e.target.closest('.popup')) {
					_this.fixBody(false);
					_this.close();
				}
			});

			if (window.location.hash) {
				this.open(window.location.hash);
			}
		}
	};
})();
(function () {
	'use strict';

	//show element on checkbox change

	var ChangeCheckbox = {
		hideCssClass: 'hidden',

		change: function change(elem) {
			var targetElements = elem.hasAttribute('data-target-elements') ? document.querySelectorAll(elem.getAttribute('data-target-elements')) : {};

			if (!targetElements.length) {
				return;
			}

			for (var i = 0; i < targetElements.length; i++) {
				var targetElem = targetElements[i];

				targetElem.style.display = elem.checked ? 'block' : 'none';

				if (elem.checked) {
					targetElem.classList.remove(this.hideCssClass);
				} else {
					targetElem.classList.add(this.hideCssClass);
				}
			}
		},

		init: function init() {
			var _this = this;

			document.addEventListener('change', function (e) {
				var elem = e.target.closest('input[type="checkbox"]');

				if (elem) {
					_this.change(elem);
				}
			});
		}
	};

	//init scripts
	document.addEventListener('DOMContentLoaded', function () {
		ChangeCheckbox.init();
	});
})();
var Maskinput;

(function () {
	'use strict';

	Maskinput = function Maskinput(inputElem, type) {
		var _this = this;

		if (!inputElem) {
			return;
		}

		var defValue = '';

		this.tel = function (evStr) {
			if (evStr == 'focus' && !inputElem.value.length) {
				inputElem.value = '+7(';
			}

			if (!/[\+\d\(\)\-]*/.test(inputElem.value)) {
				inputElem.value = defValue;
			} else {
				var reg = /^(\+7?)?(\(\d{0,3})?(\)\d{0,3})?(\-\d{0,2}){0,2}$/,
				    cursPos = inputElem.selectionStart;

				if (!reg.test(inputElem.value)) {
					inputElem.value = inputElem.value.replace(/^(?:\+7?)?\(?(\d{0,3})\)?(\d{0,3})\-?(\d{0,2})\-?(\d{0,2})$/, function (str, p1, p2, p3, p4) {
						var res = '';

						if (p4 != '') {
							res = '+7(' + p1 + ')' + p2 + '-' + p3 + '-' + p4;
						} else if (p3 != '') {
							res = '+7(' + p1 + ')' + p2 + '-' + p3;
						} else if (p2 != '') {
							res = '+7(' + p1 + ')' + p2;
						} else if (p1 != '') {
							res = '+7(' + p1;
						}

						return res;
					});
				}

				if (!reg.test(inputElem.value)) {
					inputElem.value = defValue;
				} else {
					defValue = inputElem.value;
				}
			}
		};

		inputElem.addEventListener('input', function () {
			_this[type]();
		});

		inputElem.addEventListener('focus', function () {
			_this[type]('focus');
		}, true);
	};
})();
var ValidateForm, Form;

(function () {
	'use strict';

	// validate form

	ValidateForm = {
		input: null,

		errorTip: function errorTip(err, errInd, errorTxt) {
			var field = this.input.closest('.form__field') || this.input.parentElement,
			    errTip = field.querySelector('.field-error-tip');

			if (err) {
				field.classList.remove('field-success');
				field.classList.add('field-error');

				if (!errTip) return;

				if (errInd) {
					if (!errTip.hasAttribute('data-error-text')) {
						errTip.setAttribute('data-error-text', errTip.innerHTML);
					}
					errTip.innerHTML = errInd != 'custom' ? errTip.getAttribute('data-error-text-' + errInd) : errorTxt;
				} else if (errTip.hasAttribute('data-error-text')) {
					errTip.innerHTML = errTip.getAttribute('data-error-text');
				}
			} else {
				field.classList.remove('field-error');
				field.classList.add('field-success');
			}
		},

		customErrorTip: function customErrorTip(input, errorTxt) {
			if (!input) return;

			this.input = input;

			this.errorTip(true, 'custom', errorTxt);
		},

		formError: function formError(formElem, err, errTxt) {
			var errTipElem = formElem.querySelector('.form-error-tip');

			if (err) {
				formElem.classList.add('form-error');

				if (!errTipElem) return;

				if (errTxt) {
					if (!errTipElem.hasAttribute('data-error-text')) {
						errTipElem.setAttribute('data-error-text', errTipElem.innerHTML);
					}

					errTipElem.innerHTML = errTxt;
				} else if (errTipElem.hasAttribute('data-error-text')) {
					errTipElem.innerHTML = errTipElem.getAttribute('data-error-text');
				}
			} else {
				formElem.classList.remove('form-error');
			}
		},

		customFormErrorTip: function customFormErrorTip(formElem, errorTxt) {
			if (!formElem) return;

			this.formError(formElem, true, errorTxt);
		},

		txt: function txt() {
			var err = false;

			if (!/^[0-9a-zа-яё_,.:;/@-\s]*$/i.test(this.input.value)) {
				this.errorTip(true, 2);
				err = true;
			} else {
				this.errorTip(false);
			}

			return err;
		},

		num: function num() {
			var err = false;

			if (!/^[0-9.,-]*$/.test(this.input.value)) {
				this.errorTip(true, 2);
				err = true;
			} else {
				this.errorTip(false);
			}

			return err;
		},

		name: function name() {
			var err = false;

			if (!/^[a-zа-яё'\s-]{2,21}(\s[a-zа-яё'\s-]{2,21})?(\s[a-zа-яё'\s-]{2,21})?$/i.test(this.input.value)) {
				this.errorTip(true, 2);
				err = true;
			} else {
				this.errorTip(false);
			}

			return err;
		},

		// date: function date() {
		// 	var err = false,
		// 	    errDate = false,
		// 	    matches = this.input.value.match(/^(\d{2}).(\d{2}).(\d{4})$/);

		// 	if (!matches) {
		// 		errDate = 1;
		// 	} else {
		// 		var compDate = new Date(matches[3], matches[2] - 1, matches[1]),
		// 		    curDate = new Date();

		// 		if (this.input.hasAttribute('data-min-years-passed')) {
		// 			var interval = curDate.valueOf() - new Date(curDate.getFullYear() - +this.input.getAttribute('data-min-years-passed'), curDate.getMonth(), curDate.getDate()).valueOf();

		// 			if (curDate.valueOf() < compDate.valueOf() || curDate.getFullYear() - matches[3] > 100) {
		// 				errDate = 1;
		// 			} else if (curDate.valueOf() - compDate.valueOf() < interval) {
		// 				errDate = 2;
		// 			}
		// 		}

		// 		if (compDate.getFullYear() != matches[3] || compDate.getMonth() != matches[2] - 1 || compDate.getDate() != matches[1]) {
		// 			errDate = 1;
		// 		}
		// 	}

		// 	if (errDate == 1) {
		// 		this.errorTip(true, 2);
		// 		err = true;
		// 	} else if (errDate == 2) {
		// 		this.errorTip(true, 3);
		// 		err = true;
		// 	} else {
		// 		this.errorTip(false);
		// 	}

		// 	return err;
		// },

		email: function email() {
			var err = false;

			if (!/^[a-z0-9]+[\w\-\.]*@([\w\-]{2,}\.)+[a-z]{2,6}$/i.test(this.input.value)) {
				this.errorTip(true, 2);
				err = true;
			} else {
				this.errorTip(false);
			}

			return err;
		},

		url: function url() {
			var err = false;

			if (!/^(https?\:\/\/)?[a-zа-я0-9\-\.]+\.[a-zа-я]{2,11}$/i.test(this.input.value)) {
				this.errorTip(true, 2);
				err = true;
			} else {
				this.errorTip(false);
			}

			return err;
		},

		tel: function tel() {
			var err = false;

			if (!/^\+7\([0-9]{3}\)[0-9]{3}-[0-9]{2}-[0-9]{2}$/.test(this.input.value)) {
				this.errorTip(true, 2);
				err = true;
			} else {
				this.errorTip(false);
			}

			return err;
		},

		pass: function pass() {
			var err = false,
			    minLng = this.input.getAttribute('data-min-length');

			if (minLng && this.input.value.length < minLng) {
				this.errorTip(true, 2);
				err = true;
			} else {
				this.errorTip(false);
			}

			return err;
		},

		checkbox: function checkbox(elem) {
			this.input = elem;

			var group = elem.closest('.form__chbox-group');

			if (group && group.getAttribute('data-tested')) {
				var checkedElements = 0,
				    elements = group.querySelectorAll('input[type="checkbox"]');

				for (var i = 0; i < elements.length; i++) {
					if (elements[i].checked) {
						checkedElements++;
					}
				}

				if (checkedElements < group.getAttribute('data-min')) {
					group.classList.add('form__chbox-group_error');
				} else {
					group.classList.remove('form__chbox-group_error');
				}
			} else if (elem.getAttribute('data-tested')) {
				if (elem.getAttribute('data-required') && !elem.checked) {
					this.errorTip(true);
				} else {
					this.errorTip(false);
				}
			}
		},

		radio: function radio(elem) {
			this.input = elem;

			var checkedElement = false,
			    group = elem.closest('.form__radio-group'),
			    elements = group.querySelectorAll('input[type="radio"]');

			for (var i = 0; i < elements.length; i++) {
				if (elements[i].checked) {
					checkedElement = true;
				}
			}

			if (!checkedElement) {
				group.classList.add('form__radio-group_error');
			} else {
				group.classList.remove('form__radio-group_error');
			}
		},

		select: function select(elem) {
			var err = false;

			this.input = elem;

			if (elem.getAttribute('data-required') && !elem.value.length) {
				this.errorTip(true);
				err = true;
			} else {
				this.errorTip(false);
			}

			return err;
		},

		file: function file(elem, filesArr) {
			this.input = elem;

			var err = false,
			    errCount = { ext: 0, size: 0 },
			    maxFiles = +this.input.getAttribute('data-max-files'),
			    extRegExp = new RegExp('(?:\\.' + this.input.getAttribute('data-ext').replace(/,/g, '|\\.') + ')$', 'i'),
			    maxSize = +this.input.getAttribute('data-max-size'),
			    fileItemElements = this.input.closest('.custom-file').querySelectorAll('.custom-file__item');;

			for (var i = 0; i < filesArr.length; i++) {
				var file = filesArr[i];

				if (!file.name.match(extRegExp)) {
					errCount.ext++;

					if (fileItemElements[i]) {
						fileItemElements[i].classList.add('file-error');
					}

					continue;
				}

				if (file.size > maxSize) {
					errCount.size++;

					if (fileItemElements[i]) {
						fileItemElements[i].classList.add('file-error');
					}
				}
			}

			if (maxFiles && filesArr.length > maxFiles) {
				this.errorTip(true, 4);
				err = true;
			} else if (errCount.ext) {
				this.errorTip(true, 2);
				err = true;
			} else if (errCount.size) {
				this.errorTip(true, 3);
				err = true;
			} else {
				this.errorTip(false);
			}

			return err;
		},

		validateOnInput: function validateOnInput(elem) {
			this.input = elem;

			var dataType = elem.getAttribute('data-type');

			if (elem.getAttribute('data-required') && !elem.value.length) {
				this.errorTip(true);
			} else if (elem.value.length) {
				if (dataType) {
					this[dataType]();
				} else {
					this.errorTip(false);
				}
			} else {
				this.errorTip(false);
			}
		},

		validate: function validate(formElem) {
			var err = 0;

			// text, password, textarea
			var elements = formElem.querySelectorAll('input[type="text"], input[type="password"], textarea');

			for (var i = 0; i < elements.length; i++) {
				var elem = elements[i];

				if (elemIsHidden(elem)) {
					continue;
				}

				this.input = elem;

				elem.setAttribute('data-tested', 'true');

				var dataType = elem.getAttribute('data-type');

				if (elem.getAttribute('data-required') && !elem.value.length) {
					this.errorTip(true);
					err++;
				} else if (elem.value.length) {
					if (dataType) {
						if (this[dataType]()) {
							err++;
						}
					} else {
						this.errorTip(false);
					}
				} else {
					this.errorTip(false);
				}
			}

			// select
			var selectElements = formElem.querySelectorAll('.select__input');

			for (var _i = 0; _i < selectElements.length; _i++) {
				var selectElem = selectElements[_i];

				if (elemIsHidden(selectElem.parentElement)) continue;

				if (this.select(selectElem)) {
					err++;
				}
			}

			// checkboxes
			var elements = formElem.querySelectorAll('input[type="checkbox"]');

			for (var i = 0; i < elements.length; i++) {
				var elem = elements[i];

				if (elemIsHidden(elem)) {
					continue;
				}

				this.input = elem;

				elem.setAttribute('data-tested', 'true');

				if (elem.getAttribute('data-required') && !elem.checked) {
					this.errorTip(true);
					err++;
				} else {
					this.errorTip(false);
				}
			}

			// checkbox group
			var groups = formElem.querySelectorAll('.form__chbox-group');

			for (var _i2 = 0; _i2 < groups.length; _i2++) {
				var group = groups[_i2],
				    checkedElements = 0;

				if (elemIsHidden(group)) {
					continue;
				}

				group.setAttribute('data-tested', 'true');

				var elements = group.querySelectorAll('input[type="checkbox"]');

				for (var _i3 = 0; _i3 < elements.length; _i3++) {
					if (elements[_i3].checked) {
						checkedElements++;
					}
				}

				if (checkedElements < group.getAttribute('data-min')) {
					group.classList.add('form__chbox-group_error');
					err++;
				} else {
					group.classList.remove('form__chbox-group_error');
				}
			}

			// radio group
			var groups = formElem.querySelectorAll('.form__radio-group');

			for (var _i4 = 0; _i4 < groups.length; _i4++) {
				var group = groups[_i4],
				    checkedElement = false;

				if (elemIsHidden(group)) {
					continue;
				}

				group.setAttribute('data-tested', 'true');

				var elements = group.querySelectorAll('input[type="radio"]');

				for (var _i5 = 0; _i5 < elements.length; _i5++) {
					if (elements[_i5].checked) {
						checkedElement = true;
					}
				}

				if (!checkedElement) {
					group.classList.add('form__radio-group_error');
					err++;
				} else {
					group.classList.remove('form__radio-group_error');
				}
			}

			// file
			var elements = formElem.querySelectorAll('input[type="file"]');

			for (var i = 0; i < elements.length; i++) {
				var elem = elements[i];

				if (elemIsHidden(elem)) {
					continue;
				}

				this.input = elem;

				if (CustomFile.inputFiles(elem).length) {
					if (this.file(elem, CustomFile.inputFiles(elem))) {
						err++;
					}
				} else if (elem.getAttribute('data-required')) {
					this.errorTip(true);
					err++;
				} else {
					this.errorTip(false);
				}
			}

			// passwords compare
			var elements = formElem.querySelectorAll('input[data-pass-compare-input]');

			for (var i = 0; i < elements.length; i++) {
				var elem = elements[i];

				if (elemIsHidden(elem)) {
					continue;
				}

				this.input = elem;

				var val = elem.value;

				if (val.length) {
					var compElemVal = formElem.querySelector(elem.getAttribute('data-pass-compare-input')).value;

					if (val !== compElemVal) {
						this.errorTip(true, 2);
						err++;
					} else {
						this.errorTip(false);
					}
				}
			}

			this.formError(formElem, err);

			return err ? false : true;
		},

		init: function init(formSelector) {
			var _this = this;

			document.addEventListener('input', function (e) {
				var elem = e.target.closest(formSelector + ' input[type="text"],' + formSelector + ' input[type="password"],' + formSelector + ' textarea');

				if (elem && elem.hasAttribute('data-tested')) {
					_this.validateOnInput(elem);
				}
			});

			document.addEventListener('change', function (e) {
				var elem = e.target.closest(formSelector + ' input[type="radio"],' + formSelector + ' input[type="checkbox"]');

				if (elem) {
					_this[elem.type](elem);
				}
			});
		}
	};

	// variable height textarea
	var varHeightTextarea = {
		setHeight: function setHeight(elem) {
			var mirror = elem.parentElement.querySelector('.var-height-textarea__mirror'),
			    mirrorOutput = elem.value.replace(/\n/g, '<br>');

			mirror.innerHTML = mirrorOutput + '&nbsp;';
		},

		init: function init() {
			var _this2 = this;

			document.addEventListener('input', function (e) {
				var elem = e.target.closest('.var-height-textarea__textarea');

				if (!elem) {
					return;
				}

				_this2.setHeight(elem);
			});
		}
	};

	// next fieldset
	var NextFieldset = {
		next: function next(btnElem, fwd) {
			var nextFieldset = btnElem.hasAttribute('data-go-to-fieldset') ? document.querySelector(btnElem.getAttribute('data-go-to-fieldset')) : null;

			if (!nextFieldset) return;

			var currentFieldset = btnElem.closest('.fieldset__item'),
			    goTo = fwd ? ValidateForm.validate(currentFieldset) : true;

			if (goTo) {
				currentFieldset.classList.add('fieldset__item_hidden');
				nextFieldset.classList.remove('fieldset__item_hidden');
			}
		},

		init: function init(nextBtnSelector, prevBtnSelector) {
			var _this3 = this;

			document.addEventListener('click', function (e) {
				var nextBtnElem = e.target.closest(nextBtnSelector),
				    prevBtnElem = e.target.closest(prevBtnSelector);

				if (nextBtnElem) {
					_this3.next(nextBtnElem, true);
				} else if (prevBtnElem) {
					_this3.next(prevBtnElem, false);
				}
			});
		}
	};

	// form
	Form = {
		onSubmit: null,

		clearForm: function clearForm(formElem) {
			var elements = formElem.querySelectorAll('input[type="text"], input[type="password"], textarea');

			for (var i = 0; i < elements.length; i++) {
				var elem = elements[i];
				elem.value = '';

				if (window.Placeholder) {
					Placeholder.hide(elem, false);
				}
			}

			if (window.Select) {
				Select.reset();
			}

			var textareaMirrors = formElem.querySelectorAll('.form__textarea-mirror');

			for (var i = 0; i < textareaMirrors.length; i++) {
				textareaMirrors[i].innerHTML = '';
			}
		},

		actSubmitBtn: function actSubmitBtn(state, formElem) {
			var elements = formElem.querySelectorAll('button[type="submit"], input[type="submit"]');

			for (var i = 0; i < elements.length; i++) {
				var elem = elements[i];

				if (state) {
					elem.removeAttribute('disabled');
				} else {
					elem.setAttribute('disabled', 'disable');
				}
			}
		},

		submitForm: function submitForm(formElem, e) {
			var _this4 = this;

			if (!ValidateForm.validate(formElem)) {
				if (e) {
					e.preventDefault();
				}

				return;
			}

			formElem.classList.add('form_sending');

			if (!this.onSubmit) {
				formElem.submit();
				return;
			}

			// call onSubmit
			var ret = this.onSubmit(formElem, function (obj) {
				obj = obj || {};

				setTimeout(function () {
					_this4.actSubmitBtn(obj.unlockSubmitButton, formElem);
				}, 321);

				formElem.classList.remove('form_sending');

				if (obj.clearForm == true) {
					_this4.clearForm(formElem);
				}
			});

			if (ret === false) {
				if (e) e.preventDefault();

				this.actSubmitBtn(false, formElem);
			} else {
				formElem.submit();
			}
		},

		init: function init(formSelector) {
			var _this5 = this;

			if (!document.querySelector(formSelector)) return;

			ValidateForm.init(formSelector);

			// submit event
			document.addEventListener('submit', function (e) {
				var formElem = e.target.closest(formSelector);

				if (formElem) {
					_this5.submitForm(formElem, e);
				}
			});

			// keyboard event
			document.addEventListener('keydown', function (e) {
				var formElem = e.target.closest(formSelector);

				if (!formElem) return;

				var key = e.which || e.keyCode || 0;

				if (e.ctrlKey && key == 13) {
					e.preventDefault();
					_this5.submitForm(formElem, e);
				}
			});
		}
	};

	// bind labels
	function BindLabels(elementsStr) {
		var elements = document.querySelectorAll(elementsStr);

		for (var i = 0; i < elements.length; i++) {
			var elem = elements[i],
			    label = elem.parentElement.querySelector('label'),
			    forID = elem.hasAttribute('id') ? elem.id : 'keylabel-' + i;

			if (label && !label.hasAttribute('for')) {
				label.htmlFor = forID;
				elem.id = forID;
			}
		}
	}

	// duplicate form
	var DuplicateForm = {
		add: function add(btnElem) {
			var modelElem = btnElem.hasAttribute('data-form-model') ? document.querySelector(btnElem.getAttribute('data-form-model')) : null,
			    destElem = btnElem.hasAttribute('data-duplicated-dest') ? document.querySelector(btnElem.getAttribute('data-duplicated-dest')) : null;

			if (!modelElem || !destElem) return;

			var duplicatedDiv = document.createElement('div');

			duplicatedDiv.className = 'duplicated';

			duplicatedDiv.innerHTML = modelElem.innerHTML;

			destElem.appendChild(duplicatedDiv);

			var dupicatedElements = destElem.querySelectorAll('.duplicated');

			for (var i = 0; i < dupicatedElements.length; i++) {
				var dupicatedElem = dupicatedElements[i],
				    labelElements = dupicatedElem.querySelectorAll('label'),
				    inputElements = dupicatedElem.querySelectorAll('input');

				for (var j = 0; j < labelElements.length; j++) {
					var elem = labelElements[j];

					if (elem.htmlFor != '') {
						elem.htmlFor += '-' + i + '-' + j;
					}
				}

				for (var j = 0; j < inputElements.length; j++) {
					var elem = inputElements[j];

					if (elem.id != '') {
						elem.id += '-' + i + '-' + j;
					}
				}
			}
		},

		remove: function remove(btnElem) {
			var duplElem = btnElem.closest('.duplicated');

			if (duplElem) {
				duplElem.innerHTML = '';
			}
		},

		init: function init(addBtnSelector, removeBtnSelector) {
			var _this6 = this;

			document.addEventListener('click', function (e) {
				var addBtnElem = e.target.closest(addBtnSelector),
				    removeBtnElem = e.target.closest(removeBtnSelector);

				if (addBtnElem) {
					_this6.add(addBtnElem);
				} else if (removeBtnElem) {
					_this6.remove(removeBtnElem);
				}
			});
		}
	};

	// set tabindex
	/*function SetTabindex(elementsStr) {
 	var elements = document.querySelectorAll(elementsStr);
 	
 	for (let i = 0; i < elements.length; i++) {
 		var elem = elements[i];
 		
 		if (!elemIsHidden(elem)) {
 			elem.setAttribute('tabindex', i + 1);
 		}
 	}
 }*/

	// init scripts
	document.addEventListener('DOMContentLoaded', function () {
		BindLabels('input[type="text"], input[type="checkbox"], input[type="radio"]');
		// SetTabindex('input[type="text"], input[type="password"], textarea');
		varHeightTextarea.init();
		NextFieldset.init('.js-next-fieldset-btn', '.js-prev-fieldset-btn');
		DuplicateForm.init('.js-dupicate-form-btn', '.js-remove-dupicated-form-btn');
	});
})();
(function () {
   'use strict';

   // animate when is visible

   var animationOnVisible = {
      animElements: [],

      scroll: function scroll() {
         var winBotEdge = window.pageYOffset + window.innerHeight;

         for (var i = 0; i < this.animElements.length; i++) {
            var animElem = this.animElements[i],
                animElemOffsetTop = animElem.offsetTop,
                animElemOffsetBot = animElem.offsetTop + animElem.offsetHeight;

            if (winBotEdge > animElemOffsetBot && window.pageYOffset < animElemOffsetTop) {
               animElem.classList.add('animated');
            } else {
               animElem.classList.remove('animated');
            }
         }
      },

      init: function init() {
         var animElements = document.querySelectorAll('.animate');

         if (animElements.length) {
            var elems = [];

            for (var i = 0; i < animElements.length; i++) {
               var el = animElements[i];

               elems.push({
                  elem: el,
                  offsetTop: el.getBoundingClientRect().top
               });
            }

            this.animElements = animElements;
            this.scroll();
         }
      }
   };

   // document ready
   window.addEventListener('load', function () {
      animationOnVisible.init();

      if (animationOnVisible.animElements.length) {
         window.addEventListener('scroll', animationOnVisible.scroll.bind(animationOnVisible));
      }
   });
})();
function Mouseparallax(elem, options) {
	var _ = this,
	    defaultOpt = {
		listener: document,
		deltaX: 21,
		deltaY: 21,
		rangeX: [],
		rangeY: []
	},
	    options = options || {},
	    opt = $.extend({}, defaultOpt, options),
	    $elem = $(elem),
	    startMousePos = { X: 0, Y: 0 },
	    listenerW = $(opt.listener).innerWidth(),
	    listenerH = $(opt.listener).innerHeight(),
	    cursorPos = { X: 0, Y: 0 },
	    direct = {};

	_.translateElement = { X: 0, Y: 0 };
	_.startElementPos = { X: 0, Y: 0 };

	if ($elem.attr('data-delta-x') != undefined) {
		opt.deltaX = +$elem.attr('data-delta-x');
	}

	if ($elem.attr('data-delta-y') != undefined) {
		opt.deltaY = +$elem.attr('data-delta-y');
	}

	if ($elem.attr('data-range-x') != undefined) {
		opt.rangeX = $elem.attr('data-range-x').split(',');
	}

	if ($elem.attr('data-range-y') != undefined) {
		opt.rangeY = $elem.attr('data-range-y').split(',');
	}

	$(document).on('mouseenter', opt.listener, function (e) {
		startMousePos.X = e.clientX;
		startMousePos.Y = e.clientY;
	});

	$(document).on('mousemove', opt.listener, function (e) {

		if (e.clientX > cursorPos.X) {
			direct.X = 'right';
		} else {
			direct.X = 'left';
		}
		cursorPos.X = e.clientX;

		if (e.clientY > cursorPos.Y) {
			direct.Y = 'up';
		} else {
			direct.Y = 'down';
		}
		cursorPos.Y = e.clientY;

		var deltaMouse = {
			X: e.clientX - startMousePos.X,
			Y: e.clientY - startMousePos.Y
		};

		_.translateElement = {
			X: deltaMouse.X * (opt.deltaX / listenerW) + _.startElementPos.X,
			Y: deltaMouse.Y * (opt.deltaY / listenerH) + _.startElementPos.Y
		};

		var translateX = _.translateElement.X,
		    translateY = _.translateElement.Y;

		if (opt.rangeX) {
			if (_.translateElement.X >= opt.rangeX[0]) {
				if (direct.X == 'left') {
					startMousePos.X = e.clientX;
					_.startElementPos.X = +opt.rangeX[0];
				}
				translateX = opt.rangeX[0];
			} else if (_.translateElement.X <= opt.rangeX[1]) {
				if (direct.X == 'right') {
					startMousePos.X = e.clientX;
					_.startElementPos.X = +opt.rangeX[1];
				}
				translateX = opt.rangeX[1];
			}
		}

		if (opt.rangeY) {
			if (_.translateElement.Y >= opt.rangeY[0]) {
				if (direct.Y == 'down') {
					startMousePos.Y = e.clientY;
					_.startElementPos.Y = +opt.rangeY[0];
				}
				translateY = opt.rangeY[0];
			} else if (_.translateElement.Y <= opt.rangeY[1]) {
				if (direct.Y == 'up') {
					startMousePos.Y = e.clientY;
					_.startElementPos.Y = +opt.rangeY[1];
				}
				translateY = opt.rangeY[1];
			}
		}

		$elem.css('transform', 'translate(' + translateX + 'px, ' + translateY + 'px)');
	});

	$(document).on('mouseleave', opt.listener, function (e) {
		_.startElementPos.X = _.translateElement.X;
		_.startElementPos.Y = _.translateElement.Y;
	});
}

var mousePlxObj = [],
    i = 0,
    ind;
function mouseparallax(elem, options) {

	if ($(elem)[0].ind == undefined) {
		$(elem)[0].ind = ind = i;
	} else {
		ind = $(elem)[0].ind;
	}

	i++;

	if (!(mousePlxObj[elem + ind] instanceof Mouseparallax)) {
		mousePlxObj[elem + ind] = new Mouseparallax(elem, options);
	}

	return mousePlxObj[elem + ind];
}
/*
Anchor.init(Str anchor selector[, Int duration ms[, Int shift px]]);
*/

var Anchor;

(function() {
	"use strict";

	Anchor = {
		duration: 1000,
		shift: 0,

		scroll: function(anchorId, e) {
			const anchorSectionElem = document.getElementById(anchorId +'-anchor');

			if (!anchorSectionElem) {
				return;
			}

			if (e) {
				e.preventDefault();
			}

			let scrollTo = anchorSectionElem.getBoundingClientRect().top + window.pageYOffset,
			ownShift = +anchorSectionElem.getAttribute('data-shift') || 0;

			if (window.innerWidth < 1000 && anchorSectionElem.hasAttribute('data-sm-shift')) {
				ownShift = +anchorSectionElem.getAttribute('data-sm-shift');
			}
			
			scrollTo = scrollTo - this.shift - ownShift;

			animate(function(progress) {
				window.scrollTo(0, ((scrollTo * progress) + ((1 - progress) * window.pageYOffset)));
			}, this.duration, 'easeInOutQuad');
		},

		init: function(elementStr, duration, shift) {
			if (duration) {
				this.duration = duration;
			}

			if (shift) {
				this.shift = shift;
			}

			//click anchor
			document.addEventListener('click', (e) => {
				var elem = e.target.closest(elementStr);

				if (elem) {
					const anchId = (elem.hasAttribute('href')) ? elem.getAttribute('href').split('#')[1] : elem.getAttribute('data-anchor-id');
					
					this.scroll(anchId, e);
				}
			});

			//hash anchor
			if (window.location.hash) {
				window.addEventListener('load', () => {
					this.scroll(window.location.hash.split('#')[1]);
				});
			}
		}
	};
})();