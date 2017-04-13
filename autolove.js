// ==UserScript==
// @name        One Click Love-Script
// @namespace   discourse-autolove
// @include     https://bbs.boingboing.net/*
// @version     2017.04.11
// @grant       none
// ==/UserScript==

/*
* Patch for GM_getValue and GM_SetValue support for chrome
* credits to: www.devign.me/greasemonkey-gm_getvaluegm_setvalue-functions-for-google-chrome/
*/
if (!this.GM_getValue || (this.GM_getValue.toString && this.GM_getValue.toString().indexOf("not supported")>-1)) {
    this.GM_getValue=function (key,def) {
        return localStorage[key] || def;
    };
    this.GM_setValue=function (key,value) {
        return localStorage[key]=value;
    };
    this.GM_deleteValue=function (key) {
        return delete localStorage[key];
    };
}


$('body').ready(function(){
	var GR_COOKIE_NAME = 'discourse-autolove';
	var hide_ids = $.parseJSON(GM_getValue(GR_COOKIE_NAME, '{}'));

	function handle_post_node(node){
		var tid = node.getAttribute('data-user-id');
		function love_foo(){
			this.innerHTML = "Unlove";
//			$(node).find('.contents').hide();
			$(this).unbind('click', love_foo);
			$(this).click(ulove_foo);
			hide_ids[tid] = 1;
			GM_setValue(GR_COOKIE_NAME, JSON.stringify(hide_ids));
			$('[data-user-id="'+tid+'"]').find('.love_btn').remove();
			$('[data-user-id="'+tid+'"]').each(function(){ handle_post_node(this) });
		}
		function ulove_foo(){
			this.innerHTML = "love";
//			$(node).find('.contents').show();
			$(this).unbind('click', ulove_foo);
			$(this).click(love_foo);
			delete hide_ids[tid];
			GM_setValue(GR_COOKIE_NAME, JSON.stringify(hide_ids));
			$('[data-user-id="'+tid+'"]').find('.ulove_btn').remove();
			$('[data-user-id="'+tid+'"]').each(function(){ $(this).find('.contents').show(); handle_post_node(this) });
		}
		// execute on finding loved one
		if(hide_ids[tid]){			
//			$(node).find('.contents').hide();
			$(node).find('.contents').show();
			if($(node).find('.ulove_btn').length > 0) return;
			var btn = $('<button class="ulove_btn" title="Unsupport this user." style="background-color: Transparent; background-repeat:no-repeat; border: none; cursor:pointer; overflow: hidden; outline:none; margin-left: 3px; "><i class="fa fa-toggle-on"></i></button>');
			$(node).find('.post-info').first().prepend(btn);
			btn.click(ulove_foo);
			$('[data-user-id="'+tid+'"]').find("like").click();
			$('[data-user-id="'+tid+'"]').find(".like").click();
		}
// end execute
			else{
			if($(node).find('.love_btn').length > 0) return;
			var btn = $('<button title="Support this user." style="background: none;" class="love_btn"><i class="fa fa-toggle-off"></i></button>');
			btn.insertBefore($(node).find('.create').last());
			btn.click(love_foo);
		}
	}
	
	$('article').each(function(){handle_post_node(this)});
	var observer = new MutationObserver(function(mutations) {
		for(var i=0; i < mutations.length; ++i){
			var mutation = mutations[i];
			for(var j=0; j < mutation.addedNodes.length; ++j){
				if(mutation.addedNodes[j].nodeName == "#text") continue;
				var node = mutation.addedNodes[j];
				//console.log(node);
				if(node.className == 'container posts'){
					$(node).find('article').each(function(){handle_post_node(this)});
					continue;
				}
				// just to be sure (TODO: sometimes when jumping to a thread via notification the posts aren't handled.
				// This "hack" (should) ensure that all posts are handled )
				if(node.className == 'topic-link'){
					$(window.document).find('article').each(function(){handle_post_node(this)});
					continue;
				}
				if(node.className == 'ember-view post-cloak'){
					node = $(node).find('article').get(0);
				}
				if(node.nodeName == "ARTICLE" && node.getAttribute('data-user-id')){
					handle_post_node(node);	
				}
			}
		}
	});
observer.observe(document, { subtree: true, childList: true});
	});
