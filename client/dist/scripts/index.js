(()=>{var t,e,n=document.createElement("div"),o=document.createElement("iframe"),i=null,r=null,d=null,c=!1,u=".cms-container",s='[name="OpenCMSPreview"]';function a(){document.body.contains(n)||r.appendChild(n),c||(clearTimeout(d),c=!0,d=setTimeout(function(){o.src="about:blank",clearTimeout(d),d=setTimeout(function(){o.src=i.value,c=!1},500)},500))}o.src="about:blank",o.className="open-cms-preview__iframe",n.classList.add("open-cms-preview"),n.appendChild(o),new MutationObserver(function(e){i=document.querySelector(s),r=document.querySelector(u),e.some(function(e){return Array.from(e.addedNodes).some(function(e){return 1===e.nodeType})||Array.from(e.removedNodes).some(function(e){return 1===e.nodeType})})&&(i&&r?a():document.body.contains(n)&&n.remove())}).observe(document.body,{childList:!0,subtree:!0}),t=!1,(e=document.createElement("button")).classList.add("open-cms-preview__thumb"),n.appendChild(e),e.addEventListener("mousedown",function(){t=!0,n.classList.add("dragging")}),window.addEventListener("mouseup",function(){t=!1,n.classList.remove("dragging")}),window.addEventListener("mousemove",function(n){window.requestAnimationFrame(function(){var e;t&&(e=n.clientX-10,e=window.innerWidth-e,document.body.style.setProperty("--preview-width","".concat(e,"px")))})})})();
//# sourceMappingURL=index.js.map