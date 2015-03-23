/*
 * project: Slider  Model
 * version: 1.0.0
 * create: 2015-03-23
 * author: zhangyun
 */
(function(win, doc) {

	var defaults = {
		wrapNode: 'wrap',
		autoScroll: false     // 是够自动滚动
		,hasSmallPic: true    // 是否有小图
		,picNumber: 4         // 轮播图个数
		,direction: 'right'
		,imageData: {		  // 图片数据
			bigPic: [],
			smallPic: []
		}
	};

	var Slider = function(settings) {

		this.currentPage = 0;
		
		this.settings = this.paramInit(settings);
		this.init();
		this.initDom()
		this.eventBind();
		this.initScroll();

	};


	Slider.prototype = {

		$: function (className, parentNode) {
			if(parentNode && typeof parentNode !== 'undefined') {
				return parentNode.getElementsByClassName(className)[0]
			} 
			return doc.getElementsByClassName(className)[0];
		},

		// 初始化参数
		paramInit: function (settings) {
			
			for(var attr in defaults) {
				
				this[attr] = settings[attr];
			}
			
		},


		// 初始化大图dom
		initPicsDom: function () {

			var arr = [], imageData = this.imageData;
			var i = 0, len = imageData.length;

			arr.push('<div class="mod-slider-pics">');

			for(; i < len; i++) {
				var item = imageData[i];
				arr.push(	'<div class="w-bigPic">');
				arr.push(		'<a href="' + item.link + '" target="_blank">')	;	
				arr.push(			'<img src="' + item.bigPic + '">');			
				arr.push(		'</a>');
				arr.push(	'</div>');
			}

			arr.push('</div>');

			return arr.join('');

		},
		
		// 初始化小图dom 
		initCtrlDom: function () {

			var arr = [], imageData = this.imageData;
			var i = 0, len = imageData.length;

			arr.push('<div class="mod-slider-ctrl">');
			arr.push('<ul class="mod-slider-ctrl-ul">');

			for(; i < len; i++) {
				var item = imageData[i];
				arr.push('<li>');
				arr.push(	'<div class="w-smallPic">');
				arr.push(		'<a href="#" target="_blank">')	;	
				arr.push(			'<img src="' + item.smallPic + '"  data-index="' + i + '">');			
				arr.push(		'</a>');
				arr.push(	'</div>');
				arr.push('</li>')				
			}

			arr.push('</ul>')
			arr.push('</div>');

			return arr.join('');

		},

		// 插入至外部容器中
		initWholeDom: function () {

			return '<div class="mod-slider">' + this.initPicsDom() + this.initCtrlDom() + '</div>';

		},


		// 参数node：将要获取其计算样式的元素节点
		getCurrentStyle: function(element) {
		    var style = null;
		    
		    if(window.getComputedStyle) {
		        style = window.getComputedStyle(element, null);
		    }else{
		        style = element.currentStyle;
		    }
		    
		    return style;
		},

		// DOM0|DOM2|IE
		addEvent: function (element, type, handler) {
			if (element.addEventListener) {
				element.addEventListener(type, handler, false);
			} else if (element.attachEvent) {
				element.attachEvent('on' + type, handler);
			} else {
				element['on' + type] = handler;
			}
		},

		// 移除事件
		removeEvent: function (element, type, handler) {
			if(element.removeEventListener) {
				element.removeEventListener(type, handler, false);
			} else if (element.detachEvent) {
				element.detachEvent('on' + type, handler);
			} else {
				element['on' + type] = null;
			}
		},

		// 阻止默认事件
		preventDefault: function (event) {
			if(event.preventDefault) {
				event.preventDefault();
			} else {
				event.returnValue = false;
			}
		},

 		// 获取dom
		initDom: function () {

			this.sliderPics = this.$('mod-slider-pics');
			this.sliderCtrl = this.$('mod-slider-ctrl');
			this.sliderCtrlUl = this.$('mod-slider-ctrl-ul', this.sliderCtrl);

			this.bigPics = this.sliderPics.getElementsByClassName('w-bigPic');
			this.sliderCtrlLi = this.sliderCtrlUl.getElementsByTagName('li');

		},

		// 初始化滚动事件
		initScroll: function () {

			var _this = this;
			this.timer = 0;

			var sliderPics = this.sliderPics;

			this.timer = setInterval(function () {

				var picWidth = _this.bigPics.clientWidth;
				var marginLeft = parseInt(_this.getCurrentStyle(sliderPics)['margin-left']) ;
				
				sliderPics.style.marginLeft = (marginLeft - picWidth) + 'px';
				currentPage = (currentPage + 1) % 5 === 0 ? 0 : currentPage + 1;

				// 触发小图高亮改变
				

			}, 50000);

		},

		
		// 事件绑定
		eventBind: function () {

			var _this = this;

			this.addEvent(_this.sliderCtrlUl, 'click', function (e) {
				var e = e || win.event;
				var target =  e.target || e.srcElement;
				var tagName = target.tagName.toLowerCase();
				
				var bigPics = _this.bigPics;
				var picWidth = bigPics[0].clientWidth;
				
				if(tagName === 'li' || tagName === 'img') {
					
					var index = target.getAttribute('data-index');
					var ctrls = _this.sliderCtrlLi;

					_this.currentPage = index;

					var i = 0, len = bigPics.length; 
					for(; i < len; i++) {
						// bigPics[i].style.display = 'none';
						ctrls[i].setAttribute('class', '');
					}

					// bigPics[index].style.display = 'block';
					ctrls[index].setAttribute('class', 'current');

					_this.sliderPics.style.marginLeft = (0-_this.currentPage * picWidth) + 'px';

				}

				_this.preventDefault(e);
			})
		
		}

	};



	Slider.prototype.init = function () {


		doc.getElementById(this.wrapNode).innerHTML = this.initWholeDom();

	}

	window.Slider = Slider;

} )(window, document);
