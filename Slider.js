/*
 * project: Slider  Model
 * version: 1.0.0
 * create: 2015-03-23
 * author: zhangyun
 */
(function(win, doc) {

	var defaults = {
		wrapNode: 'p-wrap',
		autoScroll: false     // 是够自动滚动
		,hasSmallPic: true    // 是否有小图
		,picNumber: 4         // 轮播图个数
		,gapTime  : 5000	  // 轮播时间
		,direction: 'right'	  // 滚动方向
		,imageData: {		  // 图片数据
			
		}
	};

	var Slider = function(settings) {

		this.timer = 0;       	// 定时器
		this.currentPage = 0;	// 当前页页数
		
		this.settings = this.paramInit(settings);
		this.init();
		this.initDom()

		if(this.autoScroll) {
			this.initScroll();
		}
		
		this.eventBind();

	};


	Slider.prototype = {

		// getElementsByClassName(兼容IE8)
		$: function (className, parentNode) {

			if(!(parentNode && typeof parentNode !== 'undefined')) {
				parentNode = doc;
			}

			if(doc.getElementsByClassName) {
				return parentNode.getElementsByClassName(className);
			} else {
				var nodes = doc.getElementsByTagName("*");
				var arr = [];			//用来保存符合的className；    
	            for(var i = 0; i < nodes.length; i++){    
	                if(this.hasClass(nodes[i],className)) arr.push(nodes[i]);    
	            }    
	            return arr;
			}

		},

		// 判断是否有某个class
		hasClass: function (node,className){    
            var cNames=node.className.split(/\s+/);//根据空格来分割node里的元素；    
            for(var i=0;i<cNames.length;i++){    
                if(cNames[i]==className) return true;    
            }    
            return false;    
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
			var theme = this.hasSmallPic ? 'smallPic-theme' : '';

			arr.push('<div class="mod-slider-ctrl ' + theme + '">');
			arr.push('<ul class="mod-slider-ctrl-ul">');

			for(; i < len; i++) {
				var item = imageData[i];
				arr.push(i === 0 ? '<li class="current" data-index="' + i + '">' : '<li data-index="' + i + '">');
				if(this.hasSmallPic) {
					arr.push(	'<div class="w-smallPic">');
					arr.push(		'<a href="#" target="_blank">')	;	
					arr.push(			'<img src="' + item.smallPic + '"  data-index="' + i + '">');			
					arr.push(		'</a>');
					arr.push(	'</div>');
				}
				
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

 		// 获取dom
		initDom: function () {

			this.sliderPics = this.$('mod-slider-pics')[0];
			this.sliderCtrl = this.$('mod-slider-ctrl')[0];
			this.sliderCtrlUl = this.$('mod-slider-ctrl-ul', this.sliderCtrl)[0];

			this.bigPics = this.$('w-bigPic', this.sliderPics);
			// this.sliderPics.getElementsByClassName('w-bigPic');
			this.sliderCtrlLi = this.sliderCtrlUl.getElementsByTagName('li');

		},

		// 大图滚动
		scrollPics: function () {

			var _this = this;
			var sliderPics = this.sliderPics;

			this.timer = setInterval(function () {

				var picWidth = _this.bigPics[0].clientWidth;
				var marginLeft = parseInt(_this.getCurrentStyle(sliderPics)['margin-left']) ;
				
				_this.currentPage = (parseInt(_this.currentPage) + 1) % _this.picNumber === 0 ? 0 : ++_this.currentPage;

				var moveLeft = (_this.currentPage) % _this.picNumber === 0 ? 0 :  marginLeft - picWidth;
				
				// 大图滚动(兼容IE)
				if(sliderPics.style.marginLef) {
					sliderPics.style.marginLeft = moveLeft + 'px';
				} else {
					sliderPics.style.cssText = 'margin-left:' + moveLeft + 'px';
				}
				
				
				// 触发小图高亮改变
				var sliderCtrlLi = _this.sliderCtrlLi;
				var i = 0, len = sliderCtrlLi.length;
				for(; i < len; i++) {
					sliderCtrlLi[i].setAttribute('class', '');
				}

				sliderCtrlLi[_this.currentPage].setAttribute('class', 'current'); 

			}, _this.gapTime);
		},

		// 初始化滚动事件
		initScroll: function () {

			// var _this = this;
			// var sliderPics = this.sliderPics;
			this.scrollPics();
			
		},

		
		// 事件绑定
		eventBind: function () {

			var _this = this;

			// 绑定鼠标移上事件
			this.addEvent(_this.sliderCtrlUl, 'mouseover', function (e) {
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

					ctrls[index].setAttribute('class', 'current');  // 小图高亮

					_this.sliderPics.style.marginLeft = (0-_this.currentPage * picWidth) + 'px';
					clearInterval(_this.timer);
				}

				_this.preventDefault(e);
			});

			// 绑定鼠标移出事件
			this.addEvent(_this.sliderCtrlUl, 'mouseout', function (e) {
				var e = e || win.event;
				var target =  e.target || e.srcElement;
				var tagName = target.tagName.toLowerCase();
				
				if(tagName === 'li' || tagName === 'img') { 
					
					if(_this.autoScroll) {
						_this.scrollPics();
					}
					

				}
			});

			// 大图鼠标事件
		
		}

	};


	Slider.prototype.init = function () {


		doc.getElementById(this.wrapNode).innerHTML = this.initWholeDom();

	}

	window.Slider = Slider;

} )(window, document);