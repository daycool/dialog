function test(ss){
	var dialog;
	if(dialog = $.data(ss, 'dialog', dialog)){
		if(dialog.dialog){
			return dialog;	
		}
		dialog = null;
	}
	
	var code = $(ss).prev('xmp').html();
	dialog = eval(code);
	DD = dialog;
	$.data(ss, 'dialog', dialog);
}

$(function(){
	$('.demoarea xmp').dblclick(function(){
		var $this = $(this),
			$textarea = $('<textarea>');
		$textarea.blur(function(){
			$this.text($(this).val());
			//$this.text($(this).val());
			$this.show();
			$(this).remove();
		});
		$textarea.val($this.text());
		$textarea.css({'height' : $this.css('height'), 'border' : 'red solid 2px'});
		$this.after($textarea);
		$this.hide();
		
		if(typeof CodeMirror !== 'undefined' && CodeMirror.fromTextArea){
			var editor = null,
				opt = {
					lineNumbers: true,
					matchBrackets: true,
					extraKeys: {"Enter": "newlineAndIndentContinueComment"},
					//theme  : 'eclipse'
				}
				
			opt.mode = "text/javascript";
			
			editor = CodeMirror.fromTextArea($textarea[0], opt);
			$(editor.getWrapperElement()).css({'height' : $this.outerHeight(), 'border' : 'red solid 2px'});
			
			//console.log(editor)
			editor.focus();
			editor.on('blur', function(){
				editor.toTextArea();
				$this.text($textarea.val());
				$this.show();
				$textarea.remove();
			});
			
		}else{
			$textarea.focus();
			$textarea.blur(function(){
				$this.text($(this).val());
				$this.show();
				$(this).remove();
			});
		}
	});
	
	$('xmp').attr('title', '双击可编辑后在测试！');
	
	$('xmp').next('input').css({padding : '5px'}).click(function(){
		test(this);
	});
	
	//快捷入口
	var $selectItem = $('#selectItem');
	$('h3').each(function(i){
		this.id = 'item_' + i;
		$(this).text((i + 1) + '.' +$(this).text());
		$selectItem.append('<option value="'+ this.id +'">'+ $(this).text() +'</option>');
	});
	
	$selectItem.change(function(){
		location.href = '#'+this.value;	
	});
	
	$('#shortcut').css({position : 'fixed', top : '48%', right : '10px', background : '#29E', padding : '10px', 'border-radius' : '8px'});
	
	
	
	insertCss('codemirror.css', '../common/codemirror/');
	insertCss('eclipse.css', '../common/codemirror/');
	
	insertJs('codemirror.js', '../common/codemirror/', function(){
		insertJs('xml.js', '../common/codemirror/', function(){
			insertJs('javascript.js', '../common/codemirror/', function(){
				insertJs('css.js', '../common/codemirror/', function(){
					insertJs('htmlmixed.js', '../common/codemirror/');
				});
			});
		});
	});
	/*insertJs('codemirror.js', '../codemirror/');
	insertJs('xml.js', '../codemirror/');
	insertJs('javascript.js', '../codemirror/');
	insertCss('css.js', '../codemirror/');
	insertJs('htmlmixed.js', '../codemirror/');*/
	
	//动态引入css文件
	function insertCss(filename, path){
		path = path || '';
		
		var cssHref = path + filename,
			$link = $('<link>');
		
		$link.attr({
				type : 'text/css',
				rel : 'stylesheet',
				href : cssHref
			});
		$("head")[0].appendChild($link[0]);
	}
	
	//动态引入js文件
	function insertJs(filename, path, callback){
		path = path || '';
		
		var jsSrc = path + filename,
			$script = $('<script>');
			
		$script.attr({
			type : 'text/javascript',
			src : jsSrc
		});
		$("head")[0].appendChild($script[0]);
		if(callback){
			$script.load(function(){
				callback();	
			});
		}
	}
	
	var $a = $('<a style=" width:80px;height:80px;position:fixed;right:40px;top:57.62%;background:#29E;color:white; display:block; font-size:28px; line-height:40px; text-align:center;text-decoration:none;border-radius:16px;">返回顶部</a>');
	$a.click(function(){
		$("html, body").animate({ scrollTop: 0 });
  		return false;	
	});
	$a.hover(function(){
		$(this).css('background', '#28B');	
	},function(){
		$(this).css('background', '#29E');	
	});
	$(document.body).append($a);
	
	$(window).scroll(function(){
		if($(this).scrollTop() > 700){
			$a.show();	
		}else{
			$a.hide();	
		}
	});
});