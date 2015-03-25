/*
 * project: Slider  Model
 * version: 1.0.0
 * create: 2015-03-23
 * author: zhangyun
 */
(function(win, doc) {

	'use strict';

	var defaults = {
		
		autoScroll:   true,     // 是够自动滚动
		hasSmallPic:  false,      // 是否有小图
		hasAnimation: false,     // 自动切换时是否需要有动画
		picNumber:    4,         // 轮播图个数
		gapTime  :    5000,	     // 切换的时间间隔
		wrapNode: 	  'p-wrap', // 外部容器
		themeName:    '',		 // 更换皮肤：如果hasSmallPic为true或者将来作为扩展
		direction:    'left',	 // 如果hasAnimation为true时,图片滚动方向
		imageData:    []	 	 // 图片数据

	};

	var Slider = function(settings) {

		this.timer = 0;       	// 自动滚动定时器
		this.animateTimer = 0;  // 轮播动画定时器
		this.currentPage = 0;	// 当前页页数
		
		this.paramInit(settings);
		this.dataLength = this.imageData.length;
		this.init();
		
	};


	Slider.prototype = {

		// 初始化参数
		paramInit: function (settings) {
			
			for(var attr in defaults) {
				this[attr] = settings[attr];
			}
			
		},

		// getElementsByClassName(兼容IE8)
		$: function (className, parentNode) {

			if(!(parentNode && typeof parentNode !== 'undefined')) {
				parentNode = doc;
			}

			if(doc.getElementsByClassName) {
				return parentNode.getElementsByClassName(className);
			} else {
					
				var nodes = doc.getElementsByTagName('*');
				var arr = [], i = 0, len = nodes.length;
	            for(; i < len; i++){    
	                if(this.hasClass(nodes[i],className)) arr.push(nodes[i]);    
	            }    
	            return arr;
			}

		},

		// 判断是否有某个class
		hasClass: function (node,className){  

            var cNames = node.className.split(/\s+/);    
            var i = 0, len = cNames.length;
            for(; i < cNames.length; i++){    
                if(cNames[i] === className) return true;    
            }    
            return false;  

        },   


		// 参数node：将要获取其计算样式的元素节点
		getCurrentStyle: function(element) {
		    
		    var style = null;
		    
		    if(window.getComputedStyle) {
		        style = window.getComputedStyle(element, null)['margin-left'];
		    }else{
		        style = element.currentStyle.marginLeft;
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

		// 阻止默认事件
		preventDefault: function (event) {
			if(event.preventDefault) {
				event.preventDefault();
			} else {
				event.returnValue = false;
			}
		},

		// 获取事件触发元素的标签名
		getTarget: function (event) {

			var e = event || win.event;
			var target =  e.target || e.srcElement;
			return {
				target: target,
				tagName: target.tagName.toLowerCase()
			};

		},
	

		// 初始化大图dom
		initPicsDom: function () {

			var arr = [], imageData = this.imageData;
			var i = 0, len = imageData.length;

			arr.push('<div class="mod-slider-pics" style="margin-left:0px;">');

			for(; i < len; i++) {
				var item = imageData[i];
				arr.push(	'<div class="w-bigPic">');
				arr.push(		'<a href="' + item.link + '" target="_blank">')	;	
				arr.push(			'<img src="' + item.bigPic + '" title="' + item.title + '">');			
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
			var theme = this.hasSmallPic ? this.themeName : '';

			arr.push('<div class="mod-slider-ctrl ' + theme + '">');
			arr.push(	'<ul class="mod-slider-ctrl-ul">');

			for(; i < len; i++) {
				var item = imageData[i];
				arr.push(i === 0 ? '<li class="current" data-index="' + i + '">' : '<li data-index="' + i + '">');
				if(this.hasSmallPic) {
					arr.push(	'<div class="w-smallPic">');
					arr.push(		'<a href="' + item.link + '" target="_blank">')	;	
					arr.push(			'<img src="' + item.smallPic + '"  data-index="' + i + '">');			
					arr.push(		'</a>');
					arr.push(	'</div>');
				}
				
				arr.push('</li>');				
			}

			arr.push(	'</ul>');
			arr.push('</div>');

			return arr.join('');

		},

		// 插入至外部容器中
		initDom: function () {

			doc.getElementById(this.wrapNode).innerHTML = '<div class="mod-slider">' + this.initPicsDom() + this.initCtrlDom() + '</div>';

		},

 		// 获取dom
		getInitDom: function () {

			this.sliderPics   = this.$('mod-slider-pics')[0];
			this.sliderCtrl   = this.$('mod-slider-ctrl')[0];
			this.sliderCtrlUl = this.$('mod-slider-ctrl-ul', this.sliderCtrl)[0];
			this.bigPics      = this.$('w-bigPic', this.sliderPics);
			this.sliderCtrlLi = this.sliderCtrlUl.getElementsByTagName('li');

		},

		// 修正小图的位置
		resizeCtrlTop: function () {

			if(this.hasSmallPic) {
				this.sliderCtrl.style.top = (this.bigPics[0].clientHeight - this.sliderCtrlUl.clientHeight) / 2 + 'px';
			}

		},

		slideLeft: function (sliderPics, flag) {
			
			var _this = this;
			var marginLeft1 = parseInt(_this.getCurrentStyle(sliderPics)) ;
			var moveLeft = (_this.currentPage) % _this.dataLength === 0 ? 0 :  marginLeft1 - 25;

			if(flag || (!flag && marginLeft1 % _this.bigPics[0].clientWidth !== 0)) {

				_this.animateTimer = setTimeout(function () {
					sliderPics.style.marginLeft = moveLeft + 'px';
					_this.slideLeft(sliderPics, false);
				}, 20);

			} else {

				clearTimeout(_this.animateTimer);

			}
			

		},

		// 大图滚动
		scrollPics: function () {

			var _this = this;
			var sliderPics = this.sliderPics;
			
			this.timer = setInterval(function () {

				var picWidth = _this.bigPics[0].clientWidth;
				var marginLeft = parseInt(_this.getCurrentStyle(sliderPics)) ;
				_this.currentPage = (parseInt(_this.currentPage) + 1) % _this.dataLength === 0 ? 0 : ++_this.currentPage;
				var moveLeft = (_this.currentPage) % _this.dataLength === 0 ? 0 :  marginLeft - picWidth;

				var sliderCtrlLi = _this.sliderCtrlLi;
				var i = 0, len = sliderCtrlLi.length;
				
				// 大图滚动
				if(_this.hasAnimation) {
					_this.slideLeft(sliderPics, true);
				} else {
					sliderPics.style.marginLeft = moveLeft + 'px';
				}
				
				// 触发小图高亮改变
				for(; i < len; i++) {
					sliderCtrlLi[i].setAttribute('class', '');
				}

				sliderCtrlLi[_this.currentPage].setAttribute('class', 'current'); 

			}, _this.gapTime);
		},

		// 事件绑定
		eventBind: function () {

			var _this = this;

			// 绑定鼠标移上事件
			this.addEvent(_this.sliderCtrlUl, 'mouseover', function (event) {
				
				var target =  _this.getTarget(event).target;
				var tagName = _this.getTarget(event).tagName;
				
				var bigPics = _this.bigPics;
				var picWidth = bigPics[0].clientWidth;
				
				if(tagName === 'li' || tagName === 'img') {
					
					var index = target.getAttribute('data-index');
					var ctrls = _this.sliderCtrlLi;
					_this.currentPage = index;

					// 去掉小图原有高亮
					var i = 0, len = bigPics.length; 
					for(; i < len; i++) {
						ctrls[i].setAttribute('class', '');
					}

					// 小图高亮显示
					ctrls[index].setAttribute('class', 'current');  

					// 大图滚动
					_this.sliderPics.style.marginLeft = (0-_this.currentPage * picWidth) + 'px';
					clearInterval(_this.timer);
				}

				_this.preventDefault(event);

			});

			// 绑定鼠标移出事件
			this.addEvent(_this.sliderCtrlUl, 'mouseout', function (event) {

				var tagName = _this.getTarget(event).tagName;
				
				if(tagName === 'li' || tagName === 'img') { 
					
					if(_this.autoScroll) {
						_this.scrollPics();
					}

				}
			});

			// 大图鼠标事件
			this.addEvent(_this.sliderPics , 'mouseover', function (event) {

				var tagName = _this.getTarget(event).tagName;

				if(tagName === 'li' || tagName === 'img') {
					clearInterval(_this.timer);
				}

			});

			// 绑定鼠标移出事件
			this.addEvent(_this.sliderPics, 'mouseout', function (event) {
				
				var tagName = _this.getTarget(event).tagName;
				
				if(tagName === 'li' || tagName === 'img') { 
					
					if(_this.autoScroll) {
						_this.scrollPics();
					}

				}
			});
		
		}

	};


	Slider.prototype.init = function () {

		this.initDom();
		this.getInitDom();
		this.resizeCtrlTop();
		if(this.autoScroll) {
			this.scrollPics();
		}
		this.eventBind();

	};

	window.Slider = Slider;

} )(window, document);