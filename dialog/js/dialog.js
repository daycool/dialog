/*
 * @version dialog 1.0
 * @date 2012-10-26 18:30
 * @author qianmingwei
 * @email qianmingwei@izptec.com
 * @description 这是一个弹出框插件
 */
 
(function($){
	"use strict";//严格模式
	//挂载到izp命名空间
	var izp = window.izp = window.izp || {};
	izp.dialog = {};
	var G = {};
	G.win = window;
	G.doc = document;
	G.docElem = G.doc.documentElement;
	G.isSetCapture = 'setCapture' in G.docElem;
	G.isLoseCapture = 'onlosecapture' in G.docElem;
	G.isIE = !-[1,];
	G.isIE6 = G.isIE && !G.win.XMLHttpRequest;
	//G.isIE6 = !('minWidth' in docElem.style);
	//显示语言
	G.lang = {
			confirm : '\u786e\u5b9a',
			cancel : '\u53d6\u6d88',
			close : '\u5173\u95ed',
			tips : '\u63d0\u793a',
			loading : '\u52a0\u8f7d\u4e2d',
			succ : '\u6210\u529f',
			warn : '\u8b66\u544a',
			error : '\u9519\u8bef',
			isConfirm : '\u60a8\u786e\u5b9a\u5417\uff1f'
		};
	if(izp.dialog && izp.dialog.lang){
		G.lang = izp.dialog.lang;
	}
	
	insertCss('dialog');//动态引入css
	
	/**
	*jQuery对象调用dialog
	*@param opt 配置参数
	*@return dialog对象
	*/
	$.fn.dialog = function(opt){
		opt = opt || {};
		opt.follow = this[0];
		return $.dialog(opt);
	}
	
	/**
	*jQuery命名空间上调用dialog
	*@param opt 配置参数
	*@return dialog对象
	*/
	$.dialog = function(opt) {
		var dialog,
			follow;
		opt = opt || {};
		follow = $(opt.follow)[0];
		if(dialog = opt.noRepeatId && $(G.doc).data('noRepeatId_' + opt.noRepeatId)){
			return dialog;
		}
		if(follow && $.data(follow, 'dialog')){
			return dialog.follow(follow);
		}
		dialog = new Dialog().init(opt);
		if(opt.noRepeatId){
			$(G.doc).data('noRepeatId_' + opt.noRepeatId, dialog);
		}
		
		if(follow){
			$.data(follow, 'dialog', dialog);
		}
		return dialog;
	}
	
	/**
	*@constructor
	*/
	function Dialog(){
		this.setting = {};//配置信息
		this._defaultConfig = {
			id : parseInt(Math.random() * 100000),	//窗口id后缀
			icon : '',								//消息图标名称
			title : 'izp Dialog',					//标题
			content : '',				//内容
			btn : {									//按钮
				ok : {val : G.lang.confirm, callback : function(self){this.close();}, isShow : true},	//确定按钮callback函数参数self是按钮自己
				cancel : {val : G.lang.cancel, callback : function(self){this.close();}, isShow : true},//取消按钮
				close : {val : '\xd7', callback : function(self){this.close();}, isShow : true}	//窗口X关闭按钮
				//btn1 : {val : '自定义按钮1', callback : function(){}, isShow : true},		//以下是自定义按钮
				//btn2 : {val : '自定义按钮2', callback : function(){}, isShow : true}
			},
			init : function(ss){ },	//窗口创建完毕后执行
			minWidth : '250px',
			minHeight : '200px',
			width : 'auto',	//窗口宽度（不包括边）
			height : 'auto',	//窗口高度（不包括边）
			left : 'center',	//X轴坐标
			top : 'center',		//Y轴坐标
			padding : '20px',	//内容与边界填充距离
			timeout : 0,		//窗口显示多少毫秒后自动关闭,如果设置为0,则不自动关闭
			timeoutCallback : $.noop, //窗口关闭后回调函数
			opacity : 0.5 ,		//遮罩透明度
			border : 10, 		//窗口的外边框像素大小(目前内部使用)
			maskColor : '#000', //遮罩颜色
			isMask : false, 		//是否遮罩
			isShowLogo : true,	//是否显示Logo即 标题前面的图标
			isShowClose : true, //是否显示右上角的关闭
			isFixed : true,		//是否静止定位
			isDrag : true,		//是否拖拽
			isResize : true,	//未实现
			noRepeatId : false,	//是否重复出现窗口
			zIndex : 2000,		//窗口高度
			follow : null, 		//跟随某元素(即让对话框在元素附近)
			esc : true,			//是否按esc关闭窗口
			showType: 'slide',	//未实现/* 窗口显示的类型,可选值有:show、fade、slide */
			showSpeed: 'fast', 	//未实现/* 窗口显示的速度,可选值有:'slow'、'fast'、表示毫秒的整数 */
			skin : 'default'	//未实现（换皮肤）
			
		}
		this.dialogHtml = function(id){
			return  '\
						<div id="izp_dialog_' + id +'" class="izp_dialog">\
							<table class="izp_d_border">\
								  <tr>\
									<td class="izp_d_tl izp_d_h izp_d_w"></td>\
									<td class="izp_d_c izp_d_h"></td>\
									<td class="izp_d_tr izp_d_h izp_d_w"></td>\
								  </tr>\
								  <tr>\
									<td class="izp_d_ml izp_d_w"><span style=" width:10px;"></span></td>\
									<td class="">\
										<div class="izp_d_main">\
											<div class="izp_d_header"><span class="izp_d_title izp_d_title_logo">'+ G.lang.tips +'</span><a class="izp_d_close">\xd7</a></div>\
											<div class="izp_d_content">\
											</div>\
											<div class="izp_d_footer">\
												<div class="izp_d_btn izp_d_main_btn">\
												</div>\
											</div>\
										</div>\
									</td>\
									<td class="izp_d_mr izp_d_w"></td>\
								  </tr>\
								  <tr>\
									<td class="izp_d_bl izp_d_h izp_d_w"></td>\
									<td class="izp_d_c izp_d_h"></td>\
									<td class="izp_d_br izp_d_h izp_d_w"></td>\
								  </tr>\
								</table>\
								</div>';
		}
		
	}
	
	
	Dialog.listDialog = [];	//所有实例化的dialog对象
	Dialog.listDialogObj = {};//所有实例化的dialog对象键值对形式（key为dialog的id）

	/**
	*设置某窗口对象为最上一层
	*@param o 窗口对象
	*/
	Dialog.focus = function(o){
		if(o){
			if(Dialog.focusObj == o){
				return ;	
			}
			
			Dialog.focusObj = o;
			Dialog.pushDialog(o);	
		}else{
			Dialog.removeDialog(Dialog.focusObj);
			//Dialog.focusObj = Dialog.getFocusObj();//按Esc可以连续关闭窗口
		}
		
		Dialog.focusObj && Dialog.focusObj.dialog && Dialog.focusObj.dialog.css('z-index', Dialog.zIndex++);
	}
	
	/**
	*获取焦点对象
	*/
	Dialog.getFocusObj = function(){
		return Dialog.focusObj || Dialog.listDialog.pop();
	}
	
	/**
	*保存dialog对象
	*/
	Dialog.pushDialog = function(dialog){
		if(dialog == null){return ;}
		Dialog.listDialogObj[dialog.id] = dialog;
		$.each(Dialog.listDialog, function(i){
			if(dialog.id == this.id){
				Dialog.listDialog.splice(i, 1);
				return false;
			}
		});
		Dialog.listDialog.push(dialog);
	}
	
	/**
	*删除dialog对象
	*/
	Dialog.removeDialog = function(dialog){
		Dialog.focusObj = null;
		delete Dialog.listDialogObj[dialog.id];
		$.each(Dialog.listDialog, function(i){
			if(dialog.id == this.id){
				Dialog.listDialog.splice(i, 1);
				return false;
			}
		});
	}
	
	/**
	*扩展Dialog类方法
	*/
	Dialog.prototype = {
		constructor : Dialog,
		version : '1.0',
		/**
		*窗口初始化函数
		*@param opt 配置参数
		*@return this 返回窗口对象本身
		*/
		init : function(opt){
			
			var that = this,
				setting = this.setting,
				dialog = this.dialog,
				followObj = null;
			
			$.extend(true, setting, this._defaultConfig, opt);
			//当指定对话框在某元素附近时设无遮罩非fixed
			if($(setting.follow).length > 0){
				this.followObj = followObj = $(setting.follow);
				setting.isMask = false;
				setting.isFixed = false;
				if(!this.followObj[0].id){
					this.followObj[0].id = setting.id;
				}
				setting.id = this.followObj[0].id;
				setting.noRepeatId = setting.id;
			}
			this.id = 'izp_dialog' + setting.id;
			this.eventNamespace = '.' + this.id;//命名空间当关闭窗口时unbind在window和document上的事件
			
			$('body').append(this.dialogHtml(setting.id));
			this.dialog = dialog = $('#izp_dialog_' + setting.id);
			this.mainContainer = dialog.find('.izp_d_main');
			this.contentContainer = dialog.find('.izp_d_content');
			this.titleContainer = dialog.find('.izp_d_title');
			this.btnContainer = dialog.find('.izp_d_btn');
			this.headerContainer = dialog.find('.izp_d_header');
			this.footerContainer = dialog.find('.izp_d_footer');
			this.XcloseContainer = dialog.find('.izp_d_close');
			
			this.title(setting.title);
			this.content(setting.content, setting.icon);
			this.border(setting.border);
			this.buttonsInit();
			this.cssInit();
			this.logo(setting.isShowLogo);
			this.Xclose(setting.isShowClose);
			this.drag(setting.isDrag);
			//this.resize(setting.isResize);
			this.timeout(setting.timeout);
			this.follow(followObj);//在某元素附近弹出
			this.setMask(setting.isMask);
			this.ie6Mask(dialog.css('width'), dialog.css('height'), dialog);
			this.eventHandle();
			Dialog.focus(that);//设置当前对话框为最上层窗口
			this.dialog.fadeIn('fast', 'swing');
			setting.init(that);
		},
		
		/**
		*设置窗口标题
		*@param title 标题内容
		*/
		title : function(title){
			this.titleContainer.html(title);;
		},
		
		/**
		*设置窗口内容,当创建有消息图标的窗口是创建icon
		*@param content 内容
		*@param icon 消息图标名称
		*/
		content : function(content, icon){
			content = this.getContent(content);
			this.contentContainer.html(content);
			
			if(icon){
				this.contentContainer.prepend('<span class="izp_d_icon izp_d_icon_'+ icon +'"></span>');
			}
		},
		
		/**
		*根据content前缀处理内容并返回
		*@param content 内容
		*@return 返回处理后的内容
		*/
		getContent : function(content){
			if(content == ''){
				return '';
			}
			
			if($.type(content) == 'number'){
				return '' + content;
			}else if($.type(content) == 'object' && (content.nodeType == 1 || content[0].nodeType == 1)){
				content = $(content).clone().wrap('<div></div>').parent().html();
				return content;	
			}else if(content.indexOf('id:') == 0){//内容为id时
				return $(content.substring(3)).clone().wrap('<div></div>').parent().html();
			}else if(content.indexOf('iframe:') == 0){//内容为iframe时
				return 	'<iframe width="100%" height="100%" src='+ content.substring(7) +'></iframe>';
			}else{
				return content;	
			}
		},
		
		/**
		*设置窗口边的大小
		*@param border 大小
		*/
		border : function(border){
			border == 10 ? '' : this.dialog.find('.izp_d_w').css('width', border).end().find('.izp_d_h').css('height', border); 	
		},
		
		/**
		*窗口样式初始化
		*/
		cssInit : function(){
			var dialog = this.dialog,
				setting = this.setting;
			this.size(setting.width, setting.height);
			this.contentContainer.css('padding', setting.padding);
			if(setting.icon){//当icon存在时paddding-left加长
				this.contentContainer.css({'padding-left' : parseInt(this.contentContainer.css('padding-left')) + 30 + 'px'});
			}
			if(setting.isFixed === true && !G.isIE6){
				dialog.css('position', 'fixed');
			}
			
			this.position(setting.left, setting.top);
			dialog.css('z-index', this.index());
		},
		
		/**
		*设置窗口大小
		*@param w 宽度
		*@param h 高度
		*/
		size : function(w, h){
			var dialog = this.dialog,
				winWidth = $(G.win).width(),
				winHeight = $(G.win).height(),
				minWidth = parseInt(this.setting.minWidth),
				minHeight = parseInt(this.setting.minHeight),
				maxWidth,
				maxHeight;
			if($.type(w) == 'string' && w.lastIndexOf('%') == w.length - 1){
				maxWidth = winWidth - (dialog.width() - this.mainContainer.width());
				w = parseInt(w) * maxWidth / 100;
			}
			
			if($.type(h) == 'string' && h.lastIndexOf('%') == h.length - 1){
				maxHeight = winHeight - (dialog.height() - this.contentContainer.height());
				h = parseInt(h) * maxHeight / 100;
			}
			
			w = w < minWidth ? minWidth : w;
			h = h < minHeight ? minHeight : h;
			
			this.contentContainer.css({width : w, height : h});
		},
		
		
		/**
		*设置窗口位置
		*@param left X轴位置
		*@param top Y轴位置
		*/
		position : function(left, top){
			left = left || setting.left;
			top = top || setting.top;
			
			var posStr = {'left' : '0%', 'right' : '100%', 'top' : '0%', 'bottom' : '100%', 'center' : '50%'},
				dialog = this.dialog,
				setting = this.setting,
				isFixed = setting.isFixed,
				winWidth = $(G.win).width(),
				winHeight = $(G.win).height(),
				docLeft = $(G.doc).scrollLeft(),
				docTop = $(G.doc).scrollTop(),
				w = dialog.width(),
				h = dialog.height();
			
			left = posStr[left] ? posStr[left] : left;
			top = posStr[top] ? posStr[top] : top;
			//把%转换成数据
			if($.type(left) == 'string' && left.lastIndexOf('%') == (left.length - 1)){
				left = parseInt(left) * (winWidth - w)/100;
				left = isFixed ?  left : left + docLeft; 
			}
			left = parseInt(left);
			//把%转换成数据
			if($.type(top) == 'string' && top.lastIndexOf('%') == (top.length - 1)){
				top = parseInt(top) * (winHeight - h)/100;
				top = isFixed ?  top : top + docTop; 
			}
			top = parseInt(top);
			(G.isIE6 && setting.isFixed) ? this.ie6Fixed(dialog, setting.isFixed, top, left) : dialog.css({left : left , top : top});
		},
		
		
		/**
		*设置窗口z-index高度
		*/
		index : function(){
			Dialog.zIndex = Dialog.zIndex || 1900; 
			return Dialog.zIndex ++;
		},
		
		/**
		*根据参数isShowLogo判断是否显示logo
		*@param isShowLogo 
		*/
		logo : function(isShowLogo){
			isShowLogo === false ? this.titleContainer.removeClass('izp_d_title_logo') : '';
		},
		
		/**
		*根据参数isShowClose判断是否显示窗口右上角关闭按钮
		*@param isShowClose 
		*/
		Xclose : function(isShowClose){
			isShowClose === false ? this.XcloseContainer.hide() : '';
		},
		
		/**
		*根据参数isDrag判断是否显示窗口可拖拽
		*@param isDrag 
		*/
		drag : function(isDrag){
			isDrag === true ? this.dragInit() : '';
		},
		
		/**
		*根据参数isResize判断是否显示窗口可放大小
		*@param isResize 
		*/
		resize : function(isResize){
			isResize === true ? this.dialog.find('.izp_d_br').css('cursor', 'se-resize') : '';
		},
		
		/**
		*锁屏
		*/
		lock : function(){
			this.setting.isMask = true;
			this.setMask(this.setting.isMask);	
		},
		
		/**
		*解屏
		*/
		unlock : function(){
			this.hideMask(this.setting.isMask);	
		},
		
		/**
		*根据参数isMask判断是否设置遮罩
		*@param isMask 
		*/
		setMask : function(isMask){
			if(!isMask) return ;
			if(this.maskContainer){
				this.showMask(isMask);
				return ;	
			}
			
			var mask = '',
				setting = this.setting,
				opacity = G.isIE ? 'filter:alpha(opacity='+ setting.opacity * 100 +')' : 'opacity:' + setting.opacity;
				if(G.isIE6){
					opacity += ';position:absolute;width:expression(document.documentElement.clientWidth);height:expression(document.documentElement.clientHeight)';
					mask += '<iframe class="izp_d_mask_iframe" style=" position:absolute;left:0;top:0;filter:alpha(opacity=0);z-index:-1;width:100%;height:100%;"></iframe>';
					
				}
				mask = '<div class="izp_d_mask izp_d_mask_yes" style="'+ opacity +';background:'+ setting.maskColor +'">' + mask + '</div>';	
				this.maskContainer = $(mask);
				this.dialog.before(this.maskContainer);
		},
		
		/**
		*根据参数isMask判断是否删除遮罩
		*@param isMask 
		*/
		removeMask : function(isMask){
			if(!isMask) return ;
			this.maskContainer && this.maskContainer.remove();
		},
		
		/**
		*根据参数isMask判断是否隐藏遮罩
		*@param isMask 
		*/
		hideMask : function(isMask){
			if(!isMask) return ;
			this.maskContainer && this.maskContainer.hide();
		},
		
		/**
		*根据参数isMask判断显示删除遮罩
		*@param isMask 
		*/
		showMask : function(isMask){
			if(!isMask) return ;
			this.maskContainer && this.maskContainer.show();
		},
		
		/**
		*所有按钮初始化
		*/
		buttonsInit : function(){
			
			var that = this,
				btns = this.setting.btn,
				flag = false;
		
			$.each(btns, function(i, val){
				if(val === false){
					return true;
				}else if(i == 'close'){
					that.XcloseContainer.text(this.val).click(function(){
						if(btns[i].callback.call(that, this)){
							that.close();	
						};
					});
					return true;
				}else{
					
					$('<button class="aui_state_highlight">').text(this.val).prependTo(that.btnContainer).click(function(){
						if(btns[i].callback.call(that, this)){
							that.close();
						};
					});
				}
				flag = true;
			});
			
			!flag && that.footerContainer.hide();
	
		},
		
		/**
		*拖拽初始化
		*/
		dragInit : function(){
			var that = this;
			//拖拽开始
			this.headerContainer.mousedown(function(e){
				that.dragStart(e);
			});
			//拖拽移动
			$(G.doc).on('mousemove' + this.eventNamespace, function(e){
				that.dragMove(e);	
			});
			//拖拽结束
			$(G.doc).on('mouseup' + this.eventNamespace, function(e){
				that.dragEnd(e);	
			});
		},
		
		/**
		*拖拽开始
		*@param e 事件
		*/
		dragStart : function(e){
			var that = this;
			
			that.headerContainer.addClass('izp_d_header_drag');
			
			that.dragData = {
					dragFlag : true,
					dialogX : parseInt(that.dialog.css('left')),
					dialogY : parseInt(that.dialog.css('top')),
					mouseX : e.clientX,
					mouseY : e.clientY,
					mouseCurrX : e.clientX,
					mouseCurrY : e.clientY,
					min_x : 0,
					min_y : 0,
					max_x : $(G.doc).width() - that.dialog.width(),
					max_y : $(G.doc).height() - that.dialog.height()
				};
			if(G.isIE6){
				that.dragData.max_x -= G.docElem.offsetWidth - G.docElem.clientWidth;
			}
			if(G.isLoseCapture){
				that.headerContainer[0].attachEvent('onlosecapture', function(){
					that.dragEnd();	
				});
				/*that.headerContainer.on('losecapture', function(){//这里ie9有问题因为ie是用addEventLisnter绑定事件的
					that.mouseup();	
				});*/
			}else{
				$(G.win).on('blur', function(){
					that.dragEnd();
				});
			}
			G.isSetCapture && that.headerContainer[0].setCapture();
		},
		
		/**
		*拖拽移动
		*@param e 事件
		*/
		dragMove : function(e){
			var that = this,
				dragData = that.dragData;
			if(!dragData || (dragData && dragData.dragFlag === false)){
				return;
			}
			G.win.getSelection ? G.win.getSelection().removeAllRanges() : G.doc.selection.empty();
			var x = 0,
				y = 0,
				min_x = dragData.min_x,
				min_y = dragData.min_y,
				max_x = dragData.max_x,
				max_y = dragData.max_y;
				
			dragData.mouseCurrX = e.clientX;
			dragData.mouseCurrY = e.clientY;
			x = dragData.mouseCurrX - dragData.mouseX + dragData.dialogX;
			y = dragData.mouseCurrY - dragData.mouseY + dragData.dialogY;
			//限制把窗口移动到浏览器外
			x = x < min_x ? min_x : x > max_x ? max_x : x;
			y = y < min_y ? min_y : y > max_y ? max_y : y;
			//拖拽时重置ie6Fixed bug
			G.isIE6 ? this.ie6Fixed(that.dialog, that.setting.isFixed, y - $(G.doc).scrollTop(), x - $(G.doc).scrollLeft()) : that.dialog.css({left : x , top : y});
		},
		
		/**
		*拖拽结束
		*@param e 事件
		*/
		dragEnd : function(e){
			var that = this;
			
			that.headerContainer.removeClass('izp_d_header_drag');
			if(that.dragData)
				that.dragData.dragFlag = false;
			
			if(G.isLoseCapture){
				/*that.headerContainer.off('losecapture');*/
				/*that.headerContainer[0].detachEvent('onlosecapture', function(){
					that.mouseup();	
				});*/
			}else{
				$(G.win).off('blur')
			}
			G.isSetCapture && that.headerContainer[0].releaseCapture();
		},
		
		/**
		*设置窗口在elem元素周围
		*@param elem
		*/
		follow : function(elem){
			var $elem;
			if($.type(elem) == 'null'){
				return ;	
			}
			
			$elem = $(elem);
			if($elem.size() <= 0){return ;}
			if($elem.is(':hidden')){
				this.position();	
				return ;
			}
			
			var that = this,
				dialog = that.dialog,
				setting = that.setting,
				eTop = $elem.offset().top,
				eLeft = $elem.offset().left,
				eWidth = $elem.width(),
				eHeight = $elem.height(),
				dWidth = dialog.width(),
				dHeight = dialog.height(),
				clientWidth = $(G.win).width(),
				clientHeight = $(G.win).height(),
				docLeft = $(G.doc).scrollLeft(),
				docTop = $(G.doc).scrollTop(),
				top = eTop + eHeight + 10,
				left = (eLeft + eWidth / 2) - dWidth/2 + 10;
			
			//当在指定元素下时超出视口移到元素上面
			if(top + dHeight - docTop  > clientHeight){
				top = eTop - dHeight - 10;	
			}
			//当窗口超出浏览器边界时移动
			if(left + dWidth - docLeft > clientWidth){
				left = clientWidth - dWidth;	
			}else if(left < 0){
				left = 0;	
			}
				
			dialog.css({top : top + 'px', left : left + 'px'});
		},
		
		/**
		*设置窗口在t秒内关闭
		*@param t 时间（单位秒）
		*/
		timeout : function(t, timeoutCallback){
			if(t == 0) return ;
			timeoutCallback = timeoutCallback || this.setting.timeoutCallback || $.noop;
			
			var that = this;
			if(that.thread){
				clearTimeout(that.thread);	
			}
			that.thread = setTimeout(function(){
							that.close();
							timeoutCallback();
						  }, t*1000);
		},
		
		/**
		*显示窗口
		*/
		show : function(){
			this.showMask(this.setting.isMask);
			this.dialog.show();
		},
		
		/**
		*隐藏窗口
		*/
		hide : function(){
			this.hideMask(this.setting.isMask);
			this.dialog.hide();
		},
		
		/**
		*关闭窗口
		*/
		close : function(){
			this.removeMask(this.setting.isMask);
			this.dialog.remove();
			if(this.setting.follow){
				$.data(this.setting.follow, 'dialog', null)
			}
			if(this.setting.noRepeatId){
				$(G.doc).data('noRepeateId_' + this.setting.noRepeatId, null);	
			}
			this.dialog = null;
			if(this.dragData) this.dragData.dragFlag = false;
			$(G.win).off(this.eventNamespace);
			$(G.doc).off(this.eventNamespace);
			Dialog.focus();
		},
		
		/**
		*实现IE6下Fixed
		*@param dialog窗口容器
		*@setting 配置信息
		*@param type 判断是减去滚动条的高度
		*/
		ie6Fixed : function(elem, isFixed, top, left){
			$elem = $(elem);
			if(G.isIE6 && isFixed === true){
				left = left || parseInt($elem.css('left'));
				top = top || parseInt($elem.css('top'));
				
				$elem[0].style.setExpression('top', 'eval(document.documentElement.scrollTop + ' + top + ') + "px"');
				$elem[0].style.setExpression('left', 'eval(document.documentElement.scrollLeft + ' + left + ') + "px"'); 
			}
		},
		
		/**
		*遮罩select控件
		*@param width 遮罩宽度
		*@param height 遮罩高度
		*@param container 遮罩层所放控件
		*/
		ie6Mask : function(width, height, container){
			var $iframe = $('<iframe frameborder="0" style=" position:absolute;left:0;top:0;filter:alpha(opacity=0);z-index:-1;width:100%;height:100%;"></iframe>');
			$iframe.css({width : width, height : height});
			container = container || 'body';
			$(container).append($iframe);
		},
		
		/**
		*事件处理包括esc事件、window窗口变大小事件
		*/
		eventHandle : function(){
			var that = this,
				dialog = this.dialog;
			//按ESC退出
			if(this.setting.esc){
				$(G.doc).on('keydown' + this.eventNamespace, function(e){
					if(e.keyCode == 27 && Dialog.focusObj == that){
						if(that.escThread) clearTimeout(that.escThread);
						that.escThread = setTimeout(function(){
							that.XcloseContainer.click();//解决第二次esc时失败
							//that.close();
						}, 50);
					}
				});
			}
			
			//浏览器大小变化时重新设置窗口大小和位置
			$(G.win).on('resize' + this.eventNamespace, function(e) {
				if(that.winResizeThread) clearTimeout(that.winResizeThread);
				that.winResizeThread = setTimeout(function(){
					that.winResize();
				}, 30);
			});
			
			//点对话框时把此对话框设为最上层
			dialog.mousedown(function(){
				Dialog.focus(that);	
			});
		},
		
		winResize : function(){
			//解决滚动时触发onresize
			if(G.isIE6){
				var winSize = $(G.win).width() * $(G.win).height();
				this.winSize = this.winSize || winSize;
				if(this.winSize == winSize){ 
					return ;
				}
				this.winSize = winSize;
			}
			
			var setting = this.setting;
			this.size(setting.width , setting.height);
			this.position(setting.left, setting.top);
			this.follow(this.followObj);	
		}
	}
	
	var fn = Dialog.prototype,
		returnVal;
	//为每个没有返回值或都返回是undefied的函数添加return this;
	$.each(fn, function(key, fun){
		if($.type(fun) == 'function'){
			fn[key] =  function(){
				returnVal = fun.apply(this, arguments);
				if($.type(returnVal) === 'undefined'){
					return this;
				}else {
					return returnVal;
				}
			}
		}
	});
	
	/**
	*模拟alert
	*@param text 显示的内容
	*@return 窗口对象
	*/
	$.dialog.alert = function(text){
		return $.dialog({content : text, btn : {cancel : false}});
	}
	/**
	*模拟confirm
	*@param text 显示的内容
	*@param callback 确认的回调函数
	*@return 窗口对象
	*/
	$.dialog.confirm = function(text, callback){
		text = text || '';
		var d = $.dialog({
			content : text, 
			icon : 'ques', 
			title : G.lang.isConfirm, 
			btn : {
				ok : {
					callback : function(){
						d.close();callback();
					}
				}
			}
		});
		return d;
	}
	
	/**
	*成功提示窗
	*@param text 显示的内容
	*@return 窗口对象
	*/
	$.dialog.succ = function(text){
		text = text || '';
		return $.dialog({content : text, icon : 'succ', title : G.lang.succ, btn : {cancel : false}});
	}
	
	/**
	*错误提示窗
	*@param text 显示的内容
	*@return 窗口对象
	*/
	$.dialog.error = function(text){
		text = text || '';
		return $.dialog({content : text, width: '250px', icon : 'error', title : G.lang.error, btn : {cancel : false}});
	}
	/**
	*警告提示窗
	*@param text 显示的内容
	*@return 窗口对象
	*/
	$.dialog.warn = function(text){
		text = text || '';
		return $.dialog({content : text, icon : 'warn', title : G.lang.warn, btn : {cancel : false}});
	}
	/**
	*加载提示窗
	*@param text 显示的内容
	*@return 窗口对象
	*/
	$.dialog.loading = function(text){
		text = text || '';
		return $.dialog({content : text, icon : 'loading', title : G.lang.loading, btn : {cancel : false}});
	}

	/**
	*提示窗无标题无按钮定时关闭
	*@param text 显示的内容
	*@param time 关闭时间（单位时间默认2秒）
	*@param callbak 关闭时回调函数
	*@return 窗口对象
	*/
	$.dialog.tip = function(text, time, timeoutCallback){
		text = text || '';
		time = time || 2;
		timeoutCallback = timeoutCallback || $.noop;
		
		if($.type(time) === 'function'){
			callback = time;
			time = 0;
		}
		
		var d = $.dialog({
			minHeight : 50,
			content: text,
			isMask: false,
			timeout: time,
			timeoutCallback : timeoutCallback,
			btn: {
				ok: false,
				cancel: false
			}
		});
		//关闭标题栏和按钮栏
		d.headerContainer.hide();
		d.footerContainer.hide();
		
		return d;
	}
	
	/**
	*动态引入css文件
	@param filename 文件名
	*@return scriptSrc
	*/
	function insertCss(filename){
		var cssHref = getPath(filename) + 'css/'+ filename +'.css',
			$link = $('<link>');
		
		$link.attr({
				type : 'text/css',
				rel : 'stylesheet',
				href : cssHref
			});
		$("head")[0].appendChild($link[0])
	}

	/**
	*获取本脚本文件路径
	@param filename 文件名
	*@return scriptSrc
	*/
	function getPath(filename){
		var scriptSrc = '';
		
		$('script').each(function() {
            var src = $(this).prop('src').toLowerCase();
			var pos = src.indexOf('js/'+ filename +'.min.js');
			pos = pos >= 0 ? pos : src.indexOf('js/'+ filename +'.js');
			if(pos >= 0){
				scriptSrc = src.substr(0, pos);
				return false;
			}
        });
		return scriptSrc;
	}
	
})(jQuery);
