(()=>{function r(e){return(r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function o(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,(e=>(e=((e,t)=>{if("object"!=r(e)||!e)return e;var n=e[Symbol.toPrimitive];if(void 0===n)return("string"===t?String:Number)(e);if("object"!=r(n=n.call(e,t||"default")))return n;throw new TypeError("@@toPrimitive must return a primitive value.")})(e,"string"),"symbol"==r(e)?e:e+""))(i.key),i)}}var n,t,e=(()=>{function e(){if(!(this instanceof e))throw new TypeError("Cannot call a class as a function");this.defaultSrc="about:blank?CMSPreview=1",this.previewPanel=document.createElement("div"),this.input=null,this.container=null,this.refreshTimeout=null,this.refreshDelay=100,this.isRefreshing=!1,this.iframe=document.createElement("iframe"),this.cache={},this.selectors={container:".cms-container",input:'[name="OpenCMSPreview"]'},this.events={},this.init()}return t=e,(n=[{key:"init",value:function(){this.setupIframe(),this.setupObserver(),this.makePreviewResizeable()}},{key:"setupIframe",value:function(){this.iframe.src=this.defaultSrc,this.iframe.className="open-cms-preview__iframe",this.previewPanel.classList.add("open-cms-preview"),this.previewPanel.appendChild(this.iframe)}},{key:"refresh",value:function(){var e,t,n=this,i=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{};this.isRefreshing||(e=!1,t=.5*this.refreshDelay,this.callback("beforeRefresh",i={data:i,preventRefresh:function(){return e=!0}}),e)||(clearTimeout(this.refreshTimeout),this.isRefreshing=!0,this.refreshTimeout=setTimeout(function(){clearTimeout(n.refreshTimeout),n.iframe.src=n.defaultSrc,n.iframe.classList.add("loading"),n.refreshTimeout=setTimeout(function(){if(!n.input)return n.isRefreshing=!1;function e(){n.isRefreshing=!1,n.iframe.removeEventListener("load",e),n.iframe.classList.remove("loading"),n.callback("refresh",n.input.value)}n.iframe.addEventListener("load",e),n.iframe.src=n.input.value},t)},t))}},{key:"addPreview",value:function(){document.body.contains(this.previewPanel)||(this.container.appendChild(this.previewPanel),this.refresh(),this.callback("addPreview",this.previewPanel))}},{key:"removePreview",value:function(){document.body.contains(this.previewPanel)&&(this.previewPanel.remove(),this.callback("removePreview"))}},{key:"setupObserver",value:function(){var e=this;new MutationObserver(function(){e.input=document.querySelector(e.selectors.input),e.container=document.querySelector(e.selectors.container),e.input&&e.container?e.cache.input&&e.input===e.cache.input&&e.cache.container&&e.container===e.cache.container||(e.cache.input=e.input,e.cache.container=e.container,e.addPreview()):e.removePreview()}).observe(document.body,{childList:!0,subtree:!0})}},{key:"makePreviewResizeable",value:function(){var e=this,n=!1,t=document.createElement("button");t.classList.add("open-cms-preview__thumb"),this.previewPanel.appendChild(t),t.addEventListener("mousedown",function(){n=!0,e.previewPanel.classList.add("dragging")}),window.addEventListener("mouseup",function(){n=!1,e.previewPanel.classList.remove("dragging")}),window.addEventListener("mousemove",function(t){window.requestAnimationFrame(function(){var e;n&&(e=t.clientX-10,e=window.innerWidth-e,document.body.style.setProperty("--preview-width","".concat(e,"px")))})})}},{key:"callback",value:function(e){var t=1<arguments.length&&void 0!==arguments[1]&&arguments[1];this.events[e]&&this.events[e].forEach(function(e){return e(t)})}},{key:"on",value:function(e,t){e&&"on"!=e&&"callback"!=e&&t&&"function"==typeof t&&(null==this.events[e]&&(this.events[e]=[]),this.events[e].push(t))}}])&&o(t.prototype,n),i&&o(t,i),Object.defineProperty(t,"prototype",{writable:!1}),t;var t,n,i})();window.OpenCMSPreviewController=new e;window.OpenCMSPreviewController.on("beforeRefresh",function(e){var t=e.data;if(((e,t)=>{if(e){if(!e.pathname.startsWith("/admin"))return!0;if(e.pathname.endsWith("/search"))return!0;if(e.pathname.endsWith("/ping"))return!0;if(e.pathname.endsWith("/SearchForm"))return!0;if(e.searchParams.has("search"))return!0;if(!e.pathname.endsWith("/reorder")&&t)try{var n=t.getResponseHeader("Content-Type");if(n&&"application/json"!==n)return!0}catch(e){}}return!1})(t.URL,t.response))return e.preventRefresh()}),n=XMLHttpRequest.prototype.open,t=XMLHttpRequest.prototype.send,XMLHttpRequest.prototype.open=function(e,t){this._url=t,n.apply(this,arguments)},XMLHttpRequest.prototype.send=function(){var e=this;this.addEventListener("load",function(){return function(e,t){var e=0<arguments.length&&void 0!==e?e:"",t=1<arguments.length?t:void 0,n=(e.startsWith("/")||(e="/"+e),new URL(window.location.href)),n=new URL(n.origin+e);window.OpenCMSPreviewController.refresh({URL:n,response:t})}(e._url,e)}),t.apply(this,arguments)}})();
//# sourceMappingURL=index.js.map