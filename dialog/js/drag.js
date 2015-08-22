/*
 * drag 1.0
 * Date: 2012-10-26 18:30
 * author : qianmingwei
 * Email : qianmingwei@izptec.com
 */
 
;(function($, undefined){
	var doc = document,
		win = window;
		
	$.drag = function(opt){
		return new Drag(opt);	
	}
	
	$.fn.drag = function(opt){
		opt = opt || {};
		opt.selfElem = this[0];
		return $.drag(opt);	
	}
	
	/**
	*Drag构造函数
	*/
	function Drag(opt){
		this.setting = {}; //配置信息
		this.defaultSetting = {//默认配置信息
				selfElem : null,
				container : null,
				clsName : 'drag',
				containment : 'document',//拖动范围  false没有限制、parent在父节点内、document在整个document内、win在视口内
				dir : false,	//拖动方向 x轴或y轴
			};
		this.drag = {
				flag : false,
				containerX : 0,
				containerY : 0,
				mouseOrigX : 0,
				mouseOrigY : 0,
				mouseCurrX : 0,
				mouseCurrY : 0
			};
		if(opt.container == null) opt.container = opt.selfElem;
		$.extend(this.setting, this.defaultSetting, opt, true);
		this.init();
	}
	
	/**
	*Drag原型对象
	*/
	Drag.prototype = {
		constructor : Drag,
		init : function(){
			var that = this,
				setting = this.setting;
			this.selfElem = $(setting.selfElem);
			this.container = $(setting.container);
			if(!/^(?:r|a|f)/.test(this.container.css("position"))){
				this.container.css('position', 'relative');
			}
			
			this.addClass(setting.clsName);
			this.start();
			this.move();
			this.end();
		},
		
		/**
		*添加class name
		*@param string clsName
		*/
		addClass : function(clsName){
			this.selfElem.addClass(clsName);
		},
		
		/**
		*拖拽开始
		*/
		start : function(){
			var that = this,
				setting = this.setting;
			this.selfElem.mousedown(function(e){
				that.addClass('drag_start');
				
				if(that.setting.containment) that.setContainment(that.setting.containment);
				if(!/^(?:r|a|f)/.test(that.container.css("position"))){
					that.container.css('position', 'relative');
				}
				var left = that.container.css('left') !== 'auto' ? parseInt(that.container.css('left')) : that.container.position().left;
				var top = that.container.css('top') !== 'auto' ? parseInt(that.container.css('top')) : that.container.position().top;
				that.drag = {
						flag : true,
						/*containerLeft : that.container.offset().left - parseInt(that.container.css('margin-left')),
						containerTop : that.container.offset().top - parseInt(that.container.css('margin-top')),*/
						containerLeft : left,
						containerTop : top,
						containerWidth : that.container.outerWidth(),
						containerHeight : that.container.outerHeight(),
						mouseOrigX : e.clientX,
						mouseOrigY : e.clientY,
						mouseCurrX : e.clientX,
						mouseCurrY : e.clientY,
					};
			});
		},
		
		/**
		*拖拽
		*/
		move : function(){
			var that = this;
			$(document).mousemove(function(e){
				var drag = that.drag;
				if(!drag.flag) return false;
				var x = 0,
					y = 0,
					min_x = 0,
					min_y = 0,
					max_x = 0,
					max_y = 0,
					props = {},
					containment,
					setting = that.setting;
				
				drag.mouseCurrX = e.clientX;
				drag.mouseCurrY = e.clientY;
				x = drag.mouseCurrX - drag.mouseOrigX + drag.containerLeft;
				y = drag.mouseCurrY - drag.mouseOrigY + drag.containerTop;
				if(setting.containment){
					containment = that.containment;
					min_x = containment.min_x;
					min_y = containment.min_y;
					max_x = containment.max_x - drag.containerWidth;
					max_y = containment.max_y - drag.containerHeight;
					x = x < min_x ? min_x : x > max_x ? max_x : x;
					y = y < min_y ? min_y : y > max_y ? max_y : y;
				}
				if(!setting.dir){
					props = {left : x + 'px', top : y + 'px'};
				}else if(setting.dir == 'x'){
					props.left = x + 'px';
				}else if(setting.dir == 'y'){
					props.top = y + 'px';
				}
				that.container.css(props);
			});
			
		},
		
		/**
		*拖拽结束
		*/
		end : function(){
			var that = this;
			/*that.selfElem.mouseout(function(){
				that.drag = false;	
			});*/
			$(doc).mouseup(function(){
				that.drag = false;	
			});
		},
		/**
		*设置拖动范围
		*@param string containment (window, document, parent, #id)
		*/
		setContainment : function(containment){
			var min_x = 0,
				min_y = 0,
				max_x = 0,
				max_y = 0,
				$o = null;
				
			if(containment == 'parent'){
				$o = this.container.parent();
				if(!/^(?:r|a|f)/.test($o.css("position"))){
					$o.css('position', 'relative');
				}
				max_x = $o.innerWidth();
				max_y = $o.innerHeight();
			}else if(containment == 'window'){
				min_x = $(doc).scrollLeft();
				min_y = $(doc).scrollTop();
				max_x = min_x + $(win).width();
				max_y = min_y + $(win).height();
			}else if(containment == 'document'){
				min_x = 0;
				min_y = 0;
				max_x = $(doc).width();
				max_y = $(doc).height();
			}else if(/^#/.test(containment)){
				$o = $(containment);
				if(!/^(?:r|a|f)/.test($o.css("position"))){
					$o.css('position', 'relative');
				}
				max_x = $o.innerWidth();
				max_y = $o.innerHeight();
			}
			this.containment = {min_x : min_x, min_y : min_y, max_x : max_x, max_y : max_y};
		},
		
		getClientWidth : function(){
			return $(doc).width() - this.container.width();	
		},
		
		getClientHeight : function(){
			return $(doc).height() - this.container.height();
		}
	
		
	}
})(jQuery);

function log(s){
	console.log(s);	
}
 
//挂载到izp命名空间
izp = izp || {};
izp.dialog = $.dialog;