!function(){"use strict";var e,t={noop:function(){},texturize:function(e){return(e=(e=(e=(e+="").replace(/'/g,"&#8217;").replace(/&#039;/g,"&#8217;")).replace(/"/g,"&#8221;").replace(/&#034;/g,"&#8221;").replace(/&quot;/g,"&#8221;").replace(/[\u201D]/g,"&#8221;")).replace(/([\w]+)=&#[\d]+;(.+?)&#[\d]+;/g,'$1="$2"')).trim()},applyReplacements:function(e,t){if(e)return t?e.replace(/{(\d+)}/g,function(e,r){return void 0!==t[r]?t[r]:e}):e},getBackgroundImage:function(e){var t=document.createElement("canvas"),r=t.getContext&&t.getContext("2d");if(e){r.filter="blur(20px) ",r.drawImage(e,0,0);var o=t.toDataURL("image/png");return t=null,o}}},r=function(){function e(e,t){return Element.prototype.matches?e.matches(t):Element.prototype.msMatchesSelector?e.msMatchesSelector(t):void 0}function r(e,t,r,o){if(!e)return o();e.jpCarouselCancelFade&&e.jpCarouselCancelFade(),e.classList.remove("jp-carousel-fade"),e.style.removeProperty("display"),e.style.opacity=t,e.style.pointerEvents="none",e.offsetWidth,e.classList.add("jp-carousel-fade"),e.style.opacity=r;var a=1e3*parseFloat(getComputedStyle(e).transitionDuration)||0,i=setTimeout(function(){e.jpCarouselCancelFade=null,e.style.removeProperty("pointer-events"),o()},a+50);e.jpCarouselCancelFade=function(){clearTimeout(i),e.jpCarouselCancelFade=null}}return{closest:function(t,r){if(t.closest)return t.closest(r);var o=t;do{if(e(o,r))return o;o=o.parentElement||o.parentNode}while(null!==o&&1===o.nodeType);return null},matches:e,hide:function(e){e&&(e.style.display="none")},show:function(e){e&&(e.style.display="block")},fadeIn:function(e,o){r(e,0,1,o=o||t.noop)},fadeOut:function(e,o){o=o||t.noop,r(e,1,0,function(){e&&(e.style.display="none"),o()})},scrollToElement:function(e,t,r){if(!e||!t)return r?r():void 0;var o=t.querySelector(".jp-carousel-info-extra");o&&(o.style.minHeight=window.innerHeight-64+"px");var a=!0,i=Date.now(),n=t.scrollTop,l=Math.max(0,e.offsetTop-Math.max(0,window.innerHeight-function(e){var t=e.querySelector(".jp-carousel-info-footer"),r=e.querySelector(".jp-carousel-info-extra"),o=e.querySelector(".jp-carousel-info-content-wrapper");if(t&&r&&o){var a=window.getComputedStyle(r),i=parseInt(a.paddingTop,10)+parseInt(a.paddingBottom,10);return i=isNaN(i)?0:i,o.offsetHeight+t.offsetHeight+i}return 0}(t)))-t.scrollTop;function s(){a=!1}l=Math.min(l,t.scrollHeight-window.innerHeight),t.addEventListener("wheel",s),function e(){var c,u=Date.now(),d=(c=(u-i)/300)<.5?2*c*c:1-Math.pow(-2*c+2,2)/2,p=(d=d>1?1:d)*l;if(t.scrollTop=n+p,u<=i+300&&a)return requestAnimationFrame(e);r&&r(),o&&(o.style.minHeight=""),a=!1,t.removeEventListener("wheel",s)}()},getJSONAttribute:function(e,t){if(e&&e.hasAttribute(t))try{return JSON.parse(e.getAttribute(t))}catch{return}},convertToPlainText:function(e){var t=document.createElement("div");return t.textContent=e,t.innerHTML},stripHTML:function(e){var t=document.createElement("div");return t.innerHTML=e.replace(/<[^>]*>?/gm,""),t.textContent},emitEvent:function(e,t,r){var o;try{o=new CustomEvent(t,{bubbles:!0,cancelable:!0,detail:r||null})}catch{(o=document.createEvent("CustomEvent")).initCustomEvent(t,!0,!0,r||null)}e.dispatchEvent(o)},isTouch:function(){return"ontouchstart"in window||window.DocumentTouch&&document instanceof DocumentTouch}}}();function o(){var o,a,i,n,l="",s=!1,c="div.gallery, div.tiled-gallery, ul.wp-block-gallery, ul.blocks-gallery-grid, figure.wp-block-gallery.has-nested-images, div.wp-block-jetpack-tiled-gallery, a.single-image-gallery",u=".gallery-item, .tiled-gallery-item, .blocks-gallery-item,  .tiled-gallery__item",d=u+", .wp-block-image",p={},m="undefined"!=typeof wpcom&&wpcom.carousel&&wpcom.carousel.stat?wpcom.carousel.stat:t.noop,g="undefined"!=typeof wpcom&&wpcom.carousel&&wpcom.carousel.pageview?wpcom.carousel.pageview:t.noop;function h(t){if(!s)switch(t.which){case 38:t.preventDefault(),p.overlay.scrollTop-=100;break;case 40:t.preventDefault(),p.overlay.scrollTop+=100;break;case 39:t.preventDefault(),e.slideNext();break;case 37:case 8:t.preventDefault(),e.slidePrev();break;case 27:t.preventDefault(),x()}}function f(){s=!0}function v(){s=!1}function y(e){e.role="button",e.tabIndex=0,e.ariaLabel=jetpackCarouselStrings.image_label}function w(){p.overlay||(p.overlay=document.querySelector(".jp-carousel-overlay"),p.container=p.overlay.querySelector(".jp-carousel-wrap"),p.gallery=p.container.querySelector(".jp-carousel"),p.info=p.overlay.querySelector(".jp-carousel-info"),p.caption=p.info.querySelector(".jp-carousel-caption"),p.commentField=p.overlay.querySelector("#jp-carousel-comment-form-comment-field"),p.emailField=p.overlay.querySelector("#jp-carousel-comment-form-email-field"),p.authorField=p.overlay.querySelector("#jp-carousel-comment-form-author-field"),p.urlField=p.overlay.querySelector("#jp-carousel-comment-form-url-field"),window.innerWidth<=760&&Math.round(window.innerWidth/760*110)<40&&r.isTouch(),[p.commentField,p.emailField,p.authorField,p.urlField].forEach(function(e){e&&(e.addEventListener("focus",f),e.addEventListener("blur",v))}),p.overlay.addEventListener("click",function(e){var t,o,a=e.target,i=!!r.closest(a,".jp-carousel-close-hint"),n=!!window.matchMedia("(max-device-width: 760px)").matches;a===p.overlay?n||x():i?x():a.classList.contains("jp-carousel-image-download")?m("download_original_click"):a.classList.contains("jp-carousel-comment-login")?(t=p.currentSlide,o=t?t.attrs.attachmentId:"0",window.location.href=jetpackCarouselStrings.login_url+"%23jp-carousel-"+o):r.closest(a,"#jp-carousel-comment-form-container")?function(e){var t=e.target,o=r.getJSONAttribute(p.container,"data-carousel-extra")||{},a=p.currentSlide.attrs.attachmentId,i=document.querySelector("#jp-carousel-comment-form-submit-and-info-wrapper"),n=document.querySelector("#jp-carousel-comment-form-spinner"),l=document.querySelector("#jp-carousel-comment-form-button-submit"),s=document.querySelector("#jp-carousel-comment-form");if(p.commentField&&p.commentField.getAttribute("id")===t.getAttribute("id"))f(),r.show(i);else if(r.matches(t,'input[type="submit"]')){e.preventDefault(),e.stopPropagation(),r.show(n),s.classList.add("jp-carousel-is-disabled");var c={action:"post_attachment_comment",nonce:jetpackCarouselStrings.nonce,blog_id:o.blog_id,id:a,comment:p.commentField.value};if(!c.comment.length)return void j(jetpackCarouselStrings.no_comment_text,!1);if(1!==Number(jetpackCarouselStrings.is_logged_in)&&(c.email=p.emailField.value,c.author=p.authorField.value,c.url=p.urlField.value,1===Number(jetpackCarouselStrings.require_name_email))){if(!c.email.length||!c.email.match("@"))return void j(jetpackCarouselStrings.no_comment_email,!1);if(!c.author.length)return void j(jetpackCarouselStrings.no_comment_author,!1)}var u=new XMLHttpRequest;u.open("POST",jetpackCarouselStrings.ajaxurl,!0),u.setRequestHeader("X-Requested-With","XMLHttpRequest"),u.setRequestHeader("Content-Type","application/x-www-form-urlencoded; charset=UTF-8"),u.onreadystatechange=function(){if(this.readyState===XMLHttpRequest.DONE&&this.status>=200&&this.status<300){var e;try{e=JSON.parse(this.response)}catch{return void j(jetpackCarouselStrings.comment_post_error,!1)}"approved"===e.comment_status?j(jetpackCarouselStrings.comment_approved,!0):"unapproved"===e.comment_status?j(jetpackCarouselStrings.comment_unapproved,!0):j(jetpackCarouselStrings.comment_post_error,!1),H(),q(a),l.value=jetpackCarouselStrings.post_comment,r.hide(n),s.classList.remove("jp-carousel-is-disabled")}else j(jetpackCarouselStrings.comment_post_error,!1)};var d=[];for(var m in c)if(m){var g=encodeURIComponent(m)+"="+encodeURIComponent(c[m]);d.push(g.replace(/%20/g,"+"))}var h=d.join("&");u.send(h)}}(e):(r.closest(a,".jp-carousel-photo-icons-container")||a.classList.contains("jp-carousel-photo-title"))&&function(e){e.preventDefault();var t=e.target,o=p.info.querySelector(".jp-carousel-info-extra"),a=p.info.querySelector(".jp-carousel-image-meta"),i=p.info.querySelector(".jp-carousel-comments-wrapper"),n=p.info.querySelector(".jp-carousel-icon-info"),l=p.info.querySelector(".jp-carousel-icon-comments");function s(){l&&l.classList.remove("jp-carousel-selected"),n.classList.toggle("jp-carousel-selected"),i&&i.classList.remove("jp-carousel-show"),a&&(a.classList.toggle("jp-carousel-show"),a.classList.contains("jp-carousel-show")?o.classList.add("jp-carousel-show"):o.classList.remove("jp-carousel-show"))}function c(){n&&n.classList.remove("jp-carousel-selected"),l.classList.toggle("jp-carousel-selected"),a&&a.classList.remove("jp-carousel-show"),i&&(i.classList.toggle("jp-carousel-show"),i.classList.contains("jp-carousel-show")?o.classList.add("jp-carousel-show"):o.classList.remove("jp-carousel-show"))}(r.closest(t,".jp-carousel-icon-info")||t.classList.contains("jp-carousel-photo-title"))&&(a&&a.classList.contains("jp-carousel-show")?r.scrollToElement(p.overlay,p.overlay,s):(s(),r.scrollToElement(p.info,p.overlay))),r.closest(t,".jp-carousel-icon-comments")&&(i&&i.classList.contains("jp-carousel-show")?r.scrollToElement(p.overlay,p.overlay,c):(c(),r.scrollToElement(p.info,p.overlay)))}(e)}),window.addEventListener("keydown",h),p.overlay.addEventListener("jp_carousel.afterOpen",function(){v(),p.slides.length<=1||(p.slides.length<=5?r.show(p.info.querySelector(".jp-swiper-pagination")):r.show(p.info.querySelector(".jp-carousel-pagination")))}),p.overlay.addEventListener("jp_carousel.beforeClose",function(){f(),document.documentElement.style.removeProperty("height"),e&&e.enable(),r.hide(p.info.querySelector(".jp-swiper-pagination")),r.hide(p.info.querySelector(".jp-carousel-pagination"))}),p.overlay.addEventListener("jp_carousel.afterClose",function(){window.history.pushState?history.pushState("",document.title,window.location.pathname+window.location.search):window.location.href="",l="",p.isOpen=!1}),p.overlay.addEventListener("touchstart",function(e){e.touches.length>1&&e.preventDefault()}))}function j(e,t){var o=p.overlay.querySelector("#jp-carousel-comment-post-results"),a="jp-carousel-comment-post-"+(t?"success":"error");o.innerHTML='<span class="'+a+'">'+e+"</span>",r.hide(p.overlay.querySelector("#jp-carousel-comment-form-spinner")),p.overlay.querySelector("#jp-carousel-comment-form").classList.remove("jp-carousel-is-disabled"),r.show(o)}function b(){var e=document.querySelectorAll("a img[data-attachment-id]");Array.prototype.forEach.call(e,function(e){var t=e.parentElement,o=t.parentElement;if(!o.classList.contains("gallery-icon")&&!r.closest(o,u)&&t.hasAttribute("href")){var a=!1;t.getAttribute("href").split("?")[0]===e.getAttribute("data-orig-file").split("?")[0]&&1===Number(jetpackCarouselStrings.single_image_gallery_media_file)&&(a=!0),t.getAttribute("href")===e.getAttribute("data-permalink")&&(a=!0),a&&(y(e),t.classList.add("single-image-gallery"),t.setAttribute("data-carousel-extra",JSON.stringify({blog_id:Number(jetpackCarouselStrings.blog_id)})))}})}function S(t,r){p.isOpen?(L(r),e.slideTo(r+1)):M(t,{startIndex:r})}function L(e){(!e||e<0||e>p.slides.length)&&(e=0),p.currentSlide=p.slides[e];var o,a,i=p.currentSlide,n=i.attrs.attachmentId;A(p.slides[e]),function(e){var t=[],r=p.slides.length;if(r>1){var o=e>0?e-1:r-1;t.push(o);var a=e<r-1?e+1:0;t.push(a)}t.forEach(function(e){var t=p.slides[e];t&&(A(t),1!==Number(jetpackCarouselStrings.display_background_image)||t.backgroundImage||_(t))})}(e),1!==Number(jetpackCarouselStrings.display_background_image)||p.slides[e].backgroundImage||_(p.slides[e]),r.hide(p.caption),function(e){var t,o,a,i,n,l,s;if(i=p.overlay.querySelector(".jp-carousel-photo-caption"),n=p.overlay.querySelector(".jp-carousel-caption"),l=p.overlay.querySelector(".jp-carousel-photo-title"),s=p.overlay.querySelector(".jp-carousel-photo-description"),r.hide(i),r.hide(n),r.hide(l),r.hide(s),t=E(e.caption)||"",o=E(e.title)||"",a=E(e.desc)||"",(t||o||a)&&(t&&(i.innerHTML=t,n.innerHTML=t,r.show(i),r.show(n)),r.stripHTML(t)===r.stripHTML(o)&&(o=""),r.stripHTML(t)===r.stripHTML(a)&&(a=""),r.stripHTML(o)===r.stripHTML(a)&&(a=""),a&&(s.innerHTML=a,r.show(s),o||t||(i.textContent=r.stripHTML(a),r.show(i))),o)){var c=r.stripHTML(o);l.textContent=c,t||(i.textContent=c,n.textContent=c,r.show(i)),r.show(l)}}({caption:i.attrs.caption,title:i.attrs.title,desc:i.attrs.desc}),function(e){if(!e||1!==Number(jetpackCarouselStrings.display_exif))return!1;var t=p.info.querySelector(".jp-carousel-image-meta");if(!t)return!1;var r="";for(var o in e){var a=e[o],i=jetpackCarouselStrings.meta_data||[];if(0!==parseFloat(a)&&a.length&&-1!==i.indexOf(o)){switch(o){case"focal_length":a+="mm";break;case"shutter_speed":a=C(a);break;case"aperture":a="f/"+a}r+="<li><h5>"+jetpackCarouselStrings[o]+"</h5>"+a+"</li>"}}var n=t.querySelector("ul.jp-carousel-image-exif");if(""!==r){if(!n){(n=document.createElement("ul")).className="jp-carousel-image-exif";var l=t.querySelector(".jp-carousel-title-and-caption");l&&l.nextSibling?t.insertBefore(n,l.nextSibling):t.insertBefore(n,t.firstChild)}n.innerHTML=r,n.style.removeProperty("display")}else n&&n.parentNode.removeChild(n)}(p.slides[e].attrs.imageMeta),function(e){if(!e)return!1;var r,o=[e.attrs.origWidth,e.attrs.origHeight],a=document.createElement("a");a.href=e.attrs.src.replace(/\?.+$/,""),r=null!==a.hostname.match(/^i[\d]{1}\.wp\.com$/i)?a.href:e.attrs.origFile.replace(/\?.+$/,"");var i=p.info.querySelector(".jp-carousel-download-text"),n=p.info.querySelector(".jp-carousel-image-download");i.innerHTML=t.applyReplacements(jetpackCarouselStrings.download_original,o),n.setAttribute("href",r),n.style.removeProperty("display")}(i),1===Number(jetpackCarouselStrings.display_comments)&&(o=p.slides[e].attrs.commentsOpened,a=p.info.querySelector("#jp-carousel-comment-form-container"),1===parseInt(o,10)?r.fadeIn(a):r.fadeOut(a),q(n),r.hide(p.info.querySelector("#jp-carousel-comment-post-results")));var s=p.info.querySelector(".jp-carousel-pagination");if(s&&p.slides.length>5){var c=e+1;s.innerHTML="<span>"+c+" / "+p.slides.length+"</span>"}jetpackCarouselStrings.stats&&p.isOpen&&((new Image).src=document.location.protocol+"//pixel.wp.com/g.gif?"+jetpackCarouselStrings.stats+"&post="+encodeURIComponent(n)+"&rand="+Math.random()),p.isOpen&&g(n),l="#jp-carousel-"+n,window.location.hash=l}function x(){document.body.style.overflow=a,document.documentElement.style.overflow=i,H(),f(),r.emitEvent(p.overlay,"jp_carousel.beforeClose"),window.scrollTo(window.scrollX||window.pageXOffset||0,n||0),p.isOpen=!1,e.destroy(),p.slides=[],p.currentSlide=void 0,p.gallery.innerHTML="",r.fadeOut(p.overlay,function(){r.emitEvent(p.overlay,"jp_carousel.afterClose")})}function k(e){if("object"!=typeof e&&(e={}),void 0===e.origFile)return"";if(void 0===e.origWidth||void 0===e.maxWidth)return e.origFile;if(!e.largeFile)return e.origFile;var t=document.createElement("a");t.href=e.largeFile;var r=/^i[0-2]\.wp\.com$/i.test(t.hostname),o=function(e,t,r){var o,a=r?e.replace(/.*=([\d]+%2C[\d]+).*$/,"$1"):e.replace(/.*-([\d]+x[\d]+)\..+$/,"$1");return"9999"===(o=a!==e?r?a.split("%2C"):a.split("x"):[t,0])[0]&&(o[0]="0"),"9999"===o[1]&&(o[1]="0"),o}(e.largeFile,e.origWidth,r),a=parseInt(o[0],10),i=parseInt(o[1],10);if(e.origMaxWidth=e.maxWidth,e.origMaxHeight=e.maxHeight,void 0!==window.devicePixelRatio&&window.devicePixelRatio>1&&(e.maxWidth=e.maxWidth*window.devicePixelRatio,e.maxHeight=e.maxHeight*window.devicePixelRatio),a>=e.maxWidth||i>=e.maxHeight)return e.largeFile;if(r){if(-1===e.largeFile.lastIndexOf("?"))return e.largeFile;var n=function(e){var t;try{t=new URL(e)}catch(t){return e}var r=["quality","ssl","filter","brightness","contrast","colorize","smooth"],o=Array.from(t.searchParams.entries());return t.search="",o.forEach(([e,o])=>{r.includes(e)&&t.searchParams.append(e,o)}),t}(e.largeFile);return(e.origWidth>e.maxWidth||e.origHeight>e.maxHeight)&&(e.origMaxWidth=2*e.maxWidth,e.origMaxHeight=2*e.maxHeight,n.searchParams.set("fit",e.origMaxWidth+","+e.origMaxHeight)),n.toString()}return e.origFile}function C(e){return e>=1?Math.round(10*e)/10+"s":"1/"+Math.round(1/e)+"s"}function E(e){return!e.match(" ")&&e.match("_")?"":e}function q(e,t){var a=void 0===t,i=p.info.querySelector(".jp-carousel-icon-comments .jp-carousel-has-comments-indicator");if(i.classList.remove("jp-carousel-show"),clearInterval(o),e){(!t||t<1)&&(t=0);var n=p.info.querySelector(".jp-carousel-comments"),l=p.info.querySelector("#jp-carousel-comments-loading");r.show(l),a&&(r.hide(n),n.innerHTML="");var s=new XMLHttpRequest,c=jetpackCarouselStrings.ajaxurl+"?action=get_attachment_comments&nonce="+jetpackCarouselStrings.nonce+"&id="+e+"&offset="+t;s.open("GET",c),s.setRequestHeader("X-Requested-With","XMLHttpRequest");var u=function(){r.fadeIn(n),r.fadeOut(l)};s.onload=function(){if(p.currentSlide&&p.currentSlide.attrs.attachmentId===e){var c,d=s.status>=200&&s.status<300;try{c=JSON.parse(s.responseText)}catch{}if(!d||!c||!Array.isArray(c))return u();a&&(n.innerHTML="");for(var m=0;m<c.length;m++){var g=c[m],h=document.createElement("div");h.classList.add("jp-carousel-comment"),h.setAttribute("id","jp-carousel-comment-"+g.id),h.innerHTML='<div class="comment-gravatar">'+g.gravatar_markup+'</div><div class="comment-content"><div class="comment-author">'+g.author_markup+'</div><div class="comment-date">'+g.date_gmt+"</div>"+g.content+"</div>",n.appendChild(h),clearInterval(o),o=setInterval(function(){p.container.scrollTop+150>window.innerHeight&&(q(e,t+10),clearInterval(o))},300)}c.length>0&&(r.show(n),i.innerText=c.length,i.classList.add("jp-carousel-show")),r.hide(l)}},s.onerror=u,s.send()}}function A(e){var t=e.attrs,r=e.el.querySelector("img");if(!r.hasAttribute("data-loaded"))if(r.setAttribute("itemprop","image"),r.setAttribute("data-loaded",1),t.previewImage&&t.previewImage!==t.src){r.src=t.previewImage,r.style.filter="blur(8px)";var o=new window.Image;o.addEventListener("load",function(){r.src=t.src,r.style.filter=""},{once:!0}),o.addEventListener("error",function(){r.style.filter=""},{once:!0}),o.src=t.src}else r.src=t.src}function _(e){var t=e.attrs.originalElement;if(t)if(t.complete&&0!==t.naturalHeight)T(e,t);else{var r=function(){t.removeEventListener("error",o),T(e,t)},o=function(){t.removeEventListener("load",r)};t.addEventListener("load",r,{once:!0}),t.addEventListener("error",o,{once:!0})}}function T(e,r){var o=t.getBackgroundImage(r);o&&(e.backgroundImage=o,e.el.style.backgroundImage="url("+o+")",e.el.style.backgroundSize="cover",e.el.style.backgroundPosition="center")}function H(){p.commentField&&(p.commentField.value="")}function I(e,o){p.slides=[];var a={width:window.innerWidth,height:window.innerHeight-64};0!==o&&null!==e[o].getAttribute("data-gallery-src")&&((new Image).src=e[o].getAttribute("data-gallery-src")),Array.prototype.forEach.call(e,function(e,o){var i=r.closest(e,"a"),n=e.getAttribute("data-orig-file")||e.getAttribute("src-orig"),l=e.getAttribute("data-attachment-id")||e.getAttribute("data-id")||"0",s=document.querySelector('img[data-attachment-id="'+l+'"] + figcaption');s=s?s.innerHTML:e.getAttribute("data-image-caption");var c={originalElement:e,attachmentId:l,commentsOpened:e.getAttribute("data-comments-opened")||"0",imageMeta:r.getJSONAttribute(e,"data-image-meta")||{},title:e.getAttribute("data-image-title")||"",desc:e.getAttribute("data-image-description")||"",largeFile:e.getAttribute("data-large-file")||"",origFile:n||"",thumbSize:{width:e.naturalWidth,height:e.naturalHeight},caption:s||"",permalink:i&&i.getAttribute("href"),src:n||e.getAttribute("src")||""},u=r.closest(e,".tiled-gallery-item"),d=u&&u.querySelector(".tiled-gallery-caption"),m=d&&d.innerHTML;m&&(c.caption=m);var g=function(e){var t=e.getAttribute("data-orig-size")||"";if(t){var r=t.split(",");return{width:parseInt(r[0],10),height:parseInt(r[1],10)}}return{width:e.getAttribute("data-original-width")||e.getAttribute("width")||void 0,height:e.getAttribute("data-original-height")||e.getAttribute("height")||void 0}}(e);if(c.origWidth=g.width||c.thumbSize.width,c.origHeight=g.height||c.thumbSize.height,"undefined"!=typeof wpcom&&wpcom.carousel&&wpcom.carousel.generateImgSrc?c.src=wpcom.carousel.generateImgSrc(e,a):c.src=k({origFile:c.src,origWidth:c.origWidth,origHeight:c.origHeight,maxWidth:a.width,maxHeight:a.height,largeFile:c.largeFile}),e.setAttribute("data-gallery-src",c.src),"0"!==c.attachmentId){c.title=t.texturize(c.title),c.desc=t.texturize(c.desc),c.caption=t.texturize(c.caption);var h=new Image,f=document.createElement("div");f.classList.add("swiper-slide"),f.setAttribute("itemprop","associatedMedia"),f.setAttribute("itemscope",""),f.setAttribute("itemtype","https://schema.org/ImageObject");var v=document.createElement("div");v.classList.add("swiper-zoom-container"),p.gallery.appendChild(f),f.appendChild(v),v.appendChild(h),f.setAttribute("data-attachment-id",c.attachmentId),f.setAttribute("data-permalink",c.permalink),f.setAttribute("data-orig-file",c.origFile),c.previewImage=e.currentSrc||e.getAttribute("src")||"";var y={el:f,attrs:c,index:o};p.slides.push(y)}})}function M(e,t){if(!window.JetpackSwiper){var o=document.querySelector("#jp-carousel-loading-overlay");r.show(o);var a=document.createElement("script");return a.id="jetpack-carousel-swiper-js",a.src=window.jetpackSwiperLibraryPath.url,a.async=!0,a.onload=function(){r.hide(o),F(e,t)},a.onerror=function(){r.hide(o)},void document.head.appendChild(a)}F(e,t)}function F(t,o){var l,s={imgSelector:".gallery-item [data-attachment-id], .tiled-gallery-item [data-attachment-id], img[data-attachment-id], img[data-id]",startIndex:0},c=r.getJSONAttribute(t,"data-carousel-extra");if(!c)return;const u=t.querySelectorAll(s.imgSelector);if(u.length&&(w(),!p.isOpen)){for(var d in p.isOpen=!0,a=getComputedStyle(document.body).overflow,document.body.style.overflow="hidden",i=getComputedStyle(document.documentElement).overflow,document.documentElement.style.overflow="hidden",n=window.scrollY||window.pageYOffset||0,p.container.setAttribute("data-carousel-extra",JSON.stringify(c)),m(["open","view_image"]),o||{})s[d]=o[d];-1===s.startIndex&&(s.startIndex=0),r.emitEvent(p.overlay,"jp_carousel.beforeOpen"),p.gallery.innerHTML="",p.overlay.style.opacity=1,p.overlay.style.display="block",I(u,s.startIndex),(e=new window.JetpackSwiper(".jp-carousel-swiper-container",{centeredSlides:!0,zoom:!0,loop:p.slides.length>1,enabled:p.slides.length>1,pagination:{el:".jp-swiper-pagination",clickable:!0},navigation:{nextEl:".jp-swiper-button-next",prevEl:".jp-swiper-button-prev"},initialSlide:s.startIndex,on:{init:function(){L(s.startIndex)}},preventClicks:!1,preventClicksPropagation:!1,preventInteractionOnTransition:!r.isTouch(),threshold:5})).on("slideChange",function(e){p.isOpen&&(L(e.realIndex),p.overlay.classList.remove("jp-carousel-hide-controls"))}),e.on("zoomChange",function(e,t){t>1&&p.overlay.classList.add("jp-carousel-hide-controls"),1===t&&p.overlay.classList.remove("jp-carousel-hide-controls")}),e.on("doubleTap",function(e){if(clearTimeout(l),1===e.zoom.scale)var t=setTimeout(function(){p.overlay.classList.remove("jp-carousel-hide-controls"),clearTimeout(t)},150)}),e.on("tap",function(){e.zoom.scale>1&&(l=setTimeout(function(){p.overlay.classList.toggle("jp-carousel-hide-controls")},150))}),r.fadeIn(p.overlay,function(){r.emitEvent(p.overlay,"jp_carousel.afterOpen")})}}function O(e){if("click"!==e.type){if("keydown"===e.type){const t=document.activeElement.parentElement,r=t&&t.classList.contains("tiled-gallery__item");" "!==e.key&&"Enter"!==e.key||!r||R(e)}}else R(e)}function N(e){return(e||"").split("?")[0].replace(/\/$/,"")}function W(e){"A"===e.tagName&&(e=e.querySelector("img")||e);var t=e.parentElement,o=t?t.parentElement:null,a=null;if(o&&o.classList.contains("wp-block-image")?a=t.getAttribute("href"):t&&t.classList.contains("wp-block-image")&&t.querySelector(":scope > a")&&(a=t.querySelector(":scope > a").getAttribute("href")),a){var i=N(a),n=N(e.getAttribute("data-orig-file")),l=N(e.getAttribute("data-permalink"));if(i!==n&&i!==l)return!1}return!(t&&t.classList.contains("gallery-caption")||r.matches(t,"figcaption"))}function R(e){if(window.CSS&&window.CSS.supports&&window.CSS.supports("display","grid")){var t,o=e.target,a=r.closest(o,c);if(a){if(!(t=a)||!t.getAttribute("data-carousel-extra"))return;if(!W(o))return;document.documentElement.style.height="auto",e.preventDefault(),e.stopPropagation();var i=r.closest(o,d),n=Array.prototype.indexOf.call(a.querySelectorAll(d),i);M(a,{startIndex:n})}}}document.body.addEventListener("click",O),document.body.addEventListener("keydown",O),document.querySelectorAll(u+"img").forEach(function(e){W(e)&&y(e)}),1===Number(jetpackCarouselStrings.single_image_gallery)&&(b(),document.body.addEventListener("is.post-load",function(){b()})),window.addEventListener("hashchange",function(){var e=/jp-carousel-(\d+)/;if(window.location.hash&&e.test(window.location.hash)){if(window.location.hash!==l||!p.isOpen)if(window.location.hash&&p.gallery&&!p.isOpen&&history.back)history.back();else{l=window.location.hash;for(var t=window.location.hash.match(e),r=parseInt(t[1],10),o=document.querySelectorAll(c),a=0;a<o.length;a++){for(var i,n=o[a],s=n.querySelectorAll("img"),u=0;u<s.length;u++)if(parseInt(s[u].getAttribute("data-attachment-id"),10)===r||parseInt(s[u].getAttribute("data-id"),10)===r){i=u;break}if(void 0!==i){S(n,i);break}}}}else p.isOpen&&x()}),window.location.hash&&r.emitEvent(window,"hashchange")}"loading"!==document.readyState?o():document.addEventListener("DOMContentLoaded",o)}();;
/**
 * Comment Likes - JavaScript
 *
 * This handles liking and unliking comments, as well as viewing who has
 * liked a particular comment.
 *
 * @dependency  Swipe (dynamically loaded when needed)
 *
 * @package     Comment_Likes
 * @subpackage  JavaScript
 */
(function () {
	function init() {
		let extWin;
		let extWinCheck;
		let commentLikeEvent;

		// Only run once.
		if (window.comment_likes_loaded) {
			return;
		}
		window.comment_likes_loaded = true;

		// Client-side cache of who liked a particular comment to avoid
		// having to hit the server multiple times for the same data.
		const commentLikeCache = {};

		let swipeLibPromise;

		// Load the Swipe library, if it's not already loaded.
		function swipeLibLoader() {
			if (!swipeLibPromise) {
				swipeLibPromise = new Promise((resolve, reject) => {
					if (window.Swipe) {
						resolve(window.Swipe);
					} else {
						const swipeScript = document.createElement('script');
						swipeScript.src = comment_like_text.swipeUrl;
						swipeScript.async = true;
						document.body.appendChild(swipeScript);
						swipeScript.addEventListener('load', () => resolve(window.Swipe));
						swipeScript.addEventListener('error', error => reject(error));
					}
				});
			}
			return swipeLibPromise;
		}

		/**
		 * Parse the comment ID from a comment like link.
		 */
		function getCommentId(link) {
			const commentId =
				link && link.getAttribute('href') && link.getAttribute('href').split('like_comment=');
			return commentId[1].split('&_wpnonce=')[0];
		}

		/**
		 * Handle an ajax action on the comment like link.
		 */
		function handleLinkAction(link, action, commentId, callback) {
			const nonce =
				link && link.getAttribute('href') && link.getAttribute('href').split('_wpnonce=')[1];

			fetch('/wp-admin/admin-ajax.php', {
				method: 'POST',
				body: new URLSearchParams({
					action: action,
					_wpnonce: nonce,
					like_comment: commentId,
					blog_id: Number(link.dataset.blog),
				}),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
					'X-Requested-With': 'XMLHttpRequest',
					Accept: 'application/json',
					'cache-control': 'no-cache',
					pragma: 'no-cache',
				},
			})
				.then(response => response.json())
				.then(callback);
		}

		function startPolling() {
			// Append cookie polling login iframe to this window to wait for user to finish logging in (or cancel)
			const loginIframe = document.createElement('iframe');
			loginIframe.id = 'wp-login-polling-iframe';
			loginIframe.src = 'https://wordpress.com/public.api/connect/?iframe=true';
			document.body.appendChild(loginIframe);
			loginIframe.style.display = 'none';
		}

		function stopPolling() {
			const iframe = document.querySelector('#wp-login-polling-iframe');
			if (iframe) {
				iframe.remove();
			}
		}

		function hide(el) {
			if (el && el.style) {
				el.style.display = 'none';
			}
		}

		function show(el) {
			if (el && el.style) {
				el.style.removeProperty('display');
			}
		}

		// Overlay used for displaying comment like info.
		class Overlay {
			constructor() {
				// Overlay element.
				this.el = document.createElement('div');
				this.el.classList.add('comment-likes-overlay');
				document.body.appendChild(this.el);
				hide(this.el);

				this.el.addEventListener('mouseenter', () => {
					// Don't hide the overlay if the user is mousing over it.
					overlay.cancelHide();
				});

				this.el.addEventListener('mouseleave', () => overlay.requestHide());

				// Inner contents of overlay.
				this.innerEl = null;

				// Instance of the Swipe library.
				this.swipe = null;

				// Timeout used for hiding the overlay.
				this.hideTimeout = null;
			}

			// Initialise the overlay for use, removing any old content.
			clear() {
				// Unload any previous instance of Swipe (to avoid leaking a global
				// event handler). This is done before clearing the contents of the
				// overlay because Swipe expects the slides to still be present.
				if (this.swipe) {
					this.swipe.kill();
					this.swipe = null;
				}
				this.el.innerHTML = '';
				this.innerEl = document.createElement('div');
				this.innerEl.classList.add('inner');
				this.el.appendChild(this.innerEl);
			}

			/**
			 * Construct a list (<ul>) of user (gravatar, name) details.
			 *
			 * @param  data     liker data returned from the server
			 * @param  klass    CSS class to apply to the <ul> element
			 * @param  start    index of user to start at
			 * @param  length   number of users to include in the list
			 *
			 * @return          A container element with the list
			 */
			getUserBits(data, klass, start, length) {
				start = start || 0;
				let last = start + (length || data.length);
				last = last > data.length ? data.length : last;
				const container = document.createElement('div');
				container.classList.add('liker-list');
				let html = `<ul class="${klass || ''}">`;
				for (let i = start; i < last; ++i) {
					const user = data[i];
					html += `
						<li>
							<a rel="nofollow" title="${user.display_name_esc}" href="${user.profile_url_esc}">
								<img src="${user.avatar_url_esc}" alt="${user.display_name_esc}" />
								<span class="user-name">${user.display_name_esc}</span>
							</a>
						</li>
					`;
				}
				html += '</ul>';
				container.innerHTML = html;
				return container;
			}

			/**
			 * Render the display of who has liked this comment. The type of
			 * display depends on how many people have liked the comment.
			 * If more than 10 people have liked the comment, this function
			 * renders navigation controls and sets up the Swipe library for
			 * changing between pages.
			 *
			 * @param link  the element over which the user is hovering
			 * @param data  the results retrieved from the server
			 */
			showLikes(link, data) {
				this.clear();

				link.dataset.likeCount = data.length;
				if (data.length === 0) {
					// No likers after all.
					hide(this.el);
					return;
				}

				this.innerEl.style.padding = '12px';

				if (data.length < 6) {
					// Only one column needed.
					this.innerEl.style.maxWidth = '200px';
					this.innerEl.innerHTML = '';
					this.innerEl.appendChild(this.getUserBits(data, 'single'));
					this.setPosition(link);
				} else if (data.length < 11) {
					// Two columns, but only one page.
					this.innerEl.innerHTML = '';
					this.innerEl.appendChild(this.getUserBits(data, 'double'));
					this.setPosition(link);
				} else {
					// Multiple pages.
					this.renderLikesWithPagination(data, link);
				}
			}

			/**
			 * Render multiple pages of likes with pagination controls.
			 * This function is intended to be called by `showLikes` above.
			 *
			 * @param data  the results retrieved from the server
			 */
			renderLikesWithPagination(data, link) {
				swipeLibLoader().then(() => {
					const page_count = Math.ceil(data.length / 10);
					// Swipe requires two nested containers.
					const swipe = document.createElement('div');
					swipe.classList.add('swipe');
					this.innerEl.appendChild(swipe);

					const wrap = document.createElement('div');
					wrap.classList.add('swipe-wrap');
					swipe.appendChild(wrap);

					for (let i = 0; i < page_count; ++i) {
						wrap.appendChild(this.getUserBits(data, 'double', i * 10, 10));
					}

					/**
					 * Navigation controls.
					 * This is based on the Newdash controls found in
					 *    reader/recommendations-templates.php
					 */
					const nav = document.createElement('nav');
					nav.classList.add('slider-nav');

					let navContents = `
						<a href="#" class="prev">
							<span class="noticon noticon-previous" title="Previous" alt="<"></span>
						</a>
						<span class="position">
					`;
					for (let i = 0; i < page_count; ++i) {
						navContents += `<em data-page="${i}" class="${i === 0 ? 'on' : ''}">&bull;</em>`;
					}
					navContents += `
						</span>
						<a href="#" class="next">
							<span class="noticon noticon-next" title="Next" alt=">"></span>
						</a>
					`;
					this.innerEl.appendChild(nav);
					nav.innerHTML = navContents;

					/** Set up Swipe. **/
					// Swipe cannot be set up successfully unless its container
					// is visible, so we show it now.
					show(this.el);
					this.setPosition(link);

					this.swipe = new Swipe(swipe, {
						callback: function (pos) {
							// Update the pagination indicators.
							//
							// If there are exactly two pages, Swipe has a weird
							// special case where it duplicates both pages and
							// can return index 2 and 3 even though those aren't
							// real pages (see swipe.js, line 47). To deal with
							// this, we use the expression `pos % page_count`.
							pos = pos % page_count;
							nav.querySelectorAll('em').forEach(em => {
								const page = Number(em.dataset.page);
								em.setAttribute('class', pos === page ? 'on' : '');
							});
						},
					});

					nav.querySelectorAll('em').forEach(em => {
						em.addEventListener('click', e => {
							// Go to the page corresponding to the indicator clicked.
							this.swipe.slide(Number(em.dataset.page));
							e.preventDefault();
						});
					});
					// Previous and next buttons.
					nav.querySelector('.prev').addEventListener('click', e => {
						this.swipe.prev();
						e.preventDefault();
					});
					nav.querySelector('.next').addEventListener('click', e => {
						this.swipe.next();
						e.preventDefault();
					});
				});
			}

			/**
			 * Open the overlay and show a loading message.
			 */
			showLoadingMessage(link) {
				this.clear();
				this.innerEl.textContent = comment_like_text.loading;
				this.setPosition(link);
			}

			/**
			 * Position the overlay near the current comment.
			 *
			 * @param link  element near which to position the overlay
			 */
			setPosition(link) {
				// Prepare a down arrow icon for the bottom of the overlay.
				const icon = document.createElement('span');
				this.el.appendChild(icon);
				icon.classList.add('icon', 'noticon', 'noticon-downarrow');
				icon.style.textShadow = '0px 1px 1px rgb(223, 223, 223)';

				const rect = link.getBoundingClientRect();
				const win = document.defaultView;
				const offset = {
					top: rect.top + win.scrollY,
					left: rect.left + win.scrollX,
				};

				// Take measurements with the element fully visible.
				show(this.el);
				let left = offset.left - (this.el.offsetWidth - link.offsetWidth) / 2;
				left = left < 5 ? 5 : left;
				let top = offset.top - this.el.offsetHeight + 5;
				hide(this.el);

				const adminBar = document.querySelector('#wpadminbar');

				// Check if the overlay would appear off the screen.
				if (top < win.scrollY + ((adminBar && adminBar.offsetHeight) || 0)) {
					// We'll display the overlay beneath the link instead.
					top = offset.top + link.offsetHeight;
					// Instead of using the down arrow icon, use an up arrow.
					icon.remove();
					this.el.prepend(icon);
					icon.classList.remove('noticon-downarrow');
					icon.classList.add('noticon-uparrow');
					icon.style.textShadow = '0px -1px 1px rgb(223, 223, 223)';
					icon.style.verticalAlign = 'bottom';
				}

				this.el.style.left = `${left}px`;
				this.el.style.top = `${top}px`;
				show(this.el);

				// The height of the arrow icon differs slightly between browsers,
				// so we compute the margin here to make sure it isn't disjointed
				// from the overlay.
				icon.style.marginTop = `${icon.scrollHeight - 26}px`;
				icon.style.marginBottom = `${20 - icon.scrollHeight}px`;

				// Position the arrow to be horizontally centred on the link.
				icon.style.paddingLeft = `${
					offset.left - left + (link.offsetWidth - icon.scrollWidth) / 2
				}px`;
			}

			/**
			 * Return whether the overlay is visible.
			 */
			isVisible() {
				return this.el.style.getPropertyValue('display') !== 'none';
			}

			/**
			 * Request that the overlay be hidden after a short delay.
			 */
			requestHide() {
				if (this.hideTimeout !== null) {
					return;
				}
				this.hideTimeout = setTimeout(() => {
					hide(this.el);
					this.clear();
				}, 300);
			}

			/**
			 * Cancel a request to hide the overlay.
			 */
			cancelHide() {
				if (this.hideTimeout !== null) {
					clearTimeout(this.hideTimeout);
					this.hideTimeout = null;
				}
			}
		}

		// Overlay used for displaying comment like info.
		const overlay = new Overlay();

		// The most recent comment for which the user has requested to see
		// who liked it.
		var relevantComment;

		// Precache after this timeout.
		var precacheTimeout = null;

		/**
		 * Fetch the like data for a particular comment.
		 */
		function fetchLikeData(link, commentId) {
			commentLikeCache[commentId] = null;

			const container = link && link.parentElement && link.parentElement.parentElement;
			const star = container.querySelector('a.comment-like-link');
			star &&
				handleLinkAction(star, 'view_comment_likes', commentId, data => {
					// Populate the cache.
					commentLikeCache[commentId] = data;

					// Only show the overlay if the user is interested.
					if (overlay.isVisible() && relevantComment === commentId) {
						overlay.showLikes(link, data);
					}
				});
		}

		function readCookie(c) {
			const nameEQ = c + '=';
			const cookieStrings = document.cookie.split(';');

			for (let i = 0; i < cookieStrings.length; i++) {
				let cookieString = cookieStrings[i];
				while (cookieString.charAt(0) === ' ') {
					cookieString = cookieString.substring(1, cookieString.length);
				}
				if (cookieString.indexOf(nameEQ) === 0) {
					const chunk = cookieString.substring(nameEQ.length, cookieString.length);
					const pairs = chunk.split('&');
					const cookieData = {};
					for (let num = pairs.length - 1; num >= 0; num--) {
						const pair = pairs[num].split('=');
						cookieData[pair[0]] = decodeURIComponent(pair[1]);
					}
					return cookieData;
				}
			}
			return null;
		}

		function getServiceData() {
			const data = readCookie('wpc_wpc');
			if (data === null || typeof data.access_token === 'undefined' || !data.access_token) {
				return false;
			}
			return data;
		}

		function readMessage(msg) {
			const event = msg.data;

			if (typeof event.event === 'undefined') {
				return;
			}

			if (event.event === 'login' && event.success) {
				extWinCheck = setInterval(function () {
					if (!extWin || extWin.closed) {
						clearInterval(extWinCheck);
						if (getServiceData()) {
							// Load page in an iframe to get the current comment nonce
							const nonceIframe = document.createElement('iframe');
							nonceIframe.id = 'wp-login-comment-nonce-iframe';
							nonceIframe.style.display = 'none';
							nonceIframe.src = commentLikeEvent + '';
							document.body.appendChild(nonceIframe);

							const commentLikeId = (commentLikeEvent + '')
								.split('like_comment=')[1]
								.split('&_wpnonce=')[0];
							let c;

							// Set a 5 second timeout to redirect to the comment page without doing the Like as a fallback
							const commentLikeTimeout = setTimeout(() => {
								window.location = commentLikeEvent;
							}, 5000);

							// Check for a new nonced redirect and use that if available before timing out
							const commentLikeCheck = setInterval(() => {
								const iframe = document.querySelector('#wp-login-comment-nonce-iframe');
								if (iframe) {
									c = iframe.querySelector(`#comment-like-${commentLikeId} .comment-like-link`);
								}
								if (c && typeof c.href !== 'undefined') {
									clearTimeout(commentLikeTimeout);
									clearInterval(commentLikeCheck);
									window.location = c.href;
								}
							}, 100);
						}
					}
				}, 100);

				if (extWin) {
					if (!extWin.closed) {
						extWin.close();
					}
					extWin = false;
				}

				stopPolling();
			}
		}

		if (typeof window.postMessage !== 'undefined') {
			window.addEventListener('message', e => {
				let message = e && e.data;
				if (typeof message === 'string') {
					try {
						message = JSON.parse(message);
					} catch (err) {
						return;
					}
				}

				const type = message && message.type;
				if (type === 'loginMessage') {
					readMessage(message);
				}
			});
		}

		document.body.addEventListener('click', e => {
			let target = e.target;

			// Don't do anything when clicking on the "X people" link.
			if (target.matches('p.comment-likes a.view-likers')) {
				e.preventDefault();
				return;
			}

			// Retrieve the surrounding paragraph to the star, if it hasn't been liked.
			const notLikedPar = target.closest('p.comment-not-liked');

			// Return if not clicking on star or surrounding paragraph.
			if (!target.matches('a.comment-like-link') && !notLikedPar) {
				return;
			}

			// When a comment hasn't been liked, make the text clickable, too.
			if (notLikedPar) {
				target = notLikedPar.querySelector('a.comment-like-link');
				if (!target) {
					return;
				}
			}

			if (target.classList.contains('needs-login')) {
				e.preventDefault();
				commentLikeEvent = target;
				if (extWin) {
					if (!extWin.closed) {
						extWin.close();
					}
					extWin = false;
				}

				stopPolling();

				const url = 'https://wordpress.com/public.api/connect/?action=request&service=wordpress';
				extWin = window.open(
					url,
					'likeconn',
					'status=0,toolbar=0,location=1,menubar=0,directories=0,resizable=1,scrollbars=1,height=560,width=500'
				);

				startPolling();

				return false;
			}

			// Record that the user likes or does not like this comment.
			const commentId = getCommentId(target);
			target.classList.add('loading');

			let commentEl = document.querySelector(`p#comment-like-${commentId}`);
			// Determine whether to like or unlike based on whether the comment is
			// currently liked.
			const action =
				commentEl && commentEl.dataset.liked === 'comment-liked'
					? 'unlike_comment'
					: 'like_comment';
			handleLinkAction(target, action, commentId, data => {
				// Invalidate the like cache for this comment.
				delete commentLikeCache[commentId];

				const countEl = document.querySelector(`#comment-like-count-${data.context}`);
				if (countEl) {
					countEl.innerHTML = data.display;
				}

				commentEl = document.querySelector(`p#comment-like-${data.context}`);
				if (action === 'like_comment') {
					commentEl.classList.remove('comment-not-liked');
					commentEl.classList.add('comment-liked');
					commentEl.dataset.liked = 'comment-liked';
				} else {
					commentEl.classList.remove('comment-liked');
					commentEl.classList.add('comment-not-liked');
					commentEl.dataset.liked = 'comment-not-liked';
				}

				// Prefetch new data for this comment (if there are likers left).
				const parent = target.closest('.comment-likes');
				const link = parent && parent.querySelector('a.view-likers');
				if (link) {
					fetchLikeData(link, commentId);
				}

				target.classList.remove('loading');
			});
			e.preventDefault();
			e.stopPropagation();
		});

		document.body.addEventListener(
			'mouseenter',
			function (e) {
				if (!e.target.matches('p.comment-likes a.view-likers')) {
					return;
				}
				// Show the user a list of who has liked this comment.

				const link = e.target;
				if (Number(link.dataset.likeCount || 0) === 0) {
					// No one has liked this comment.
					return;
				}

				// Don't hide the overlay.
				overlay.cancelHide();

				// Get the comment ID.
				const container = link.parentElement && link.parentElement.parentElement;
				const star = container && container.querySelector('a.comment-like-link');
				const commentId = star && getCommentId(star);
				relevantComment = commentId;

				// Check if the list of likes for this comment is already in
				// the cache.
				if (commentId in commentLikeCache) {
					const entry = commentLikeCache[commentId];
					// Only display the likes if the ajax request is
					// actually done.
					if (entry !== null) {
						overlay.showLikes(link, entry);
					} else {
						// Make sure the overlay is visible (in case
						// the user moved the mouse away while loading
						// but then came back before it finished
						// loading).
						overlay.showLoadingMessage(link);
					}
					return;
				}

				// Position the "Loading..." overlay.
				overlay.showLoadingMessage(link);

				// Fetch the data.
				fetchLikeData(link, commentId);
			},
			true
		);

		document.body.addEventListener(
			'mouseleave',
			e => {
				if (!e.target.matches('p.comment-likes a.view-likers')) {
					return;
				}
				// User has moved cursor away - hide the overlay.
				overlay.requestHide();
			},
			true
		);

		document.body.addEventListener(
			'mouseenter',
			e => {
				if (!e.target.matches('.comment') || !e.target.querySelector('a.comment-like-link')) {
					return;
				}
				// User is moving over a comment - precache the comment like data.
				if (precacheTimeout !== null) {
					clearTimeout(precacheTimeout);
					precacheTimeout = null;
				}

				const star = e.target.querySelector('a.comment-like-link');
				const parent = star.closest('.comment-likes');
				const link = parent && parent.querySelector('a.view-likers');
				if (!link || Number(link.dataset.likeCount || 0) === 0) {
					// No likes.
					return;
				}
				const commentId = getCommentId(star);
				if (commentId in commentLikeCache) {
					// Already in cache.
					return;
				}

				precacheTimeout = setTimeout(() => {
					precacheTimeout = null;
					if (commentId in commentLikeCache) {
						// Was cached in the interim.
						return;
					}
					fetchLikeData(link, commentId);
				}, 1000);
			},
			true
		);
	}

	if (document.readyState !== 'loading') {
		init();
	} else {
		document.addEventListener('DOMContentLoaded', init);
	}
})();
;
( function () {
	'use strict';

	if ( typeof window.wpcom === 'undefined' ) {
		window.wpcom = {};
	}

	if ( window.wpcom.carousel ) {
		return;
	}

	var prebuilt_widths = jetpackCarouselStrings.widths;
	var pageviews_stats_args = jetpackCarouselStrings.stats_query_args;

	var findFirstLargeEnoughWidth = function ( original_w, original_h, dest_w, dest_h ) {
		var inverse_ratio = original_h / original_w;

		for ( var i = 0; i < prebuilt_widths.length; ++i ) {
			if ( prebuilt_widths[ i ] >= dest_w || prebuilt_widths[ i ] * inverse_ratio >= dest_h ) {
				return prebuilt_widths[ i ];
			}
		}

		return original_w;
	};

	var removeResizeFromImageURL = function ( url ) {
		return removeArgFromURL( url, 'resize' );
	};

	var removeArgFromURL = function ( url, arg ) {
		var re = new RegExp( '[\\?&]' + arg + '(=[^?&]+)?' );
		if ( url.match( re ) ) {
			return url.replace( re, '' );
		}
		return url;
	};

	var addWidthToImageURL = function ( url, width ) {
		width = parseInt( width, 10 );
		// Give devices with a higher devicePixelRatio higher-res images (Retina display = 2, Android phones = 1.5, etc)
		if ( 'undefined' !== typeof window.devicePixelRatio && window.devicePixelRatio > 1 ) {
			width = Math.round( width * window.devicePixelRatio );
		}
		url = addArgToURL( url, 'w', width );
		url = addArgToURL( url, 'h', '' );
		return url;
	};

	var addArgToURL = function ( url, arg, value ) {
		var re = new RegExp( arg + '=[^?&]+' );
		if ( url.match( re ) ) {
			return url.replace( re, arg + '=' + value );
		} else {
			var divider = url.indexOf( '?' ) !== -1 ? '&' : '?';
			return url + divider + arg + '=' + value;
		}
	};

	var stat = function ( names ) {
		if ( typeof names !== 'string' ) {
			names = names.join( ',' );
		}

		new Image().src = window.location.protocol +
			'//pixel.wp.com/g.gif?v=wpcom-no-pv' +
			'&x_carousel=' + names +
			'&baba=' + Math.random();
	};

	var lastTrackedPostId = null;

	var pageview = function ( post_id ) {
		// Prevent duplicate tracking of the same post during slide transitions
		if ( post_id === lastTrackedPostId ) {
			return;
		}

		lastTrackedPostId = post_id;

		new Image().src = window.location.protocol +
			'//pixel.wp.com/g.gif?host=' + encodeURIComponent( window.location.host ) +
			'&ref=' + encodeURIComponent( document.referrer ) +
			'&rand=' + Math.random() +
			'&' + pageviews_stats_args +
			'&post=' + encodeURIComponent( post_id );
	};

	var generateImgSrc = function ( srcItem, max ) {
		var origSize = srcItem.getAttribute( 'data-orig-size' ) || '';

		var src = srcItem.getAttribute( 'src' ) || srcItem.getAttribute( 'original' ) || srcItem.getAttribute( 'data-original' ) || srcItem.getAttribute( 'data-lazy-src' );
		if ( src.indexOf( 'imgpress' ) !== -1 ) {
			src = srcItem.getAttribute( 'data-orig-file' );
		}
		// Square/Circle galleries use a resize param that needs to be removed.
		src = removeResizeFromImageURL( src );
		src = addWidthToImageURL(
			src,
			findFirstLargeEnoughWidth( origSize.width, origSize.height, max.width, max.height )
		);

		return src;
	};

	window.wpcom.carousel = {
		findFirstLargeEnoughWidth: findFirstLargeEnoughWidth,
		removeResizeFromImageURL: removeResizeFromImageURL,
		addWidthToImageURL: addWidthToImageURL,
		stat: stat,
		pageview: pageview,
		generateImgSrc: generateImgSrc
	};

} )();
;
