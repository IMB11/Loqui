"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[770],{7706:function(e,t,r){r.d(t,{default:function(){return i.a}});var n=r(665),i=r.n(n)},6083:function(e,t,r){Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"Image",{enumerable:!0,get:function(){return y}});let n=r(8488),i=r(4489),o=r(6935),l=i._(r(5301)),a=n._(r(7911)),s=n._(r(9777)),u=r(6979),d=r(5325),c=r(3111);r(9469);let f=r(3029),p=n._(r(1279)),m={deviceSizes:[640,750,828,1080,1200,1920,2048,3840],imageSizes:[16,32,48,64,96,128,256,384],path:"/_next/image",loader:"default",dangerouslyAllowSVG:!1,unoptimized:!0};function g(e,t,r,n,i,o,l){let a=null==e?void 0:e.src;e&&e["data-loaded-src"]!==a&&(e["data-loaded-src"]=a,("decode"in e?e.decode():Promise.resolve()).catch(()=>{}).then(()=>{if(e.parentElement&&e.isConnected){if("empty"!==t&&i(!0),null==r?void 0:r.current){let t=new Event("load");Object.defineProperty(t,"target",{writable:!1,value:e});let n=!1,i=!1;r.current({...t,nativeEvent:t,currentTarget:e,target:e,isDefaultPrevented:()=>n,isPropagationStopped:()=>i,persist:()=>{},preventDefault:()=>{n=!0,t.preventDefault()},stopPropagation:()=>{i=!0,t.stopPropagation()}})}(null==n?void 0:n.current)&&n.current(e)}}))}function h(e){let[t,r]=l.version.split(".",2),n=parseInt(t,10),i=parseInt(r,10);return n>18||18===n&&i>=3?{fetchPriority:e}:{fetchpriority:e}}"undefined"==typeof window&&(globalThis.__NEXT_IMAGE_IMPORTED=!0);let v=(0,l.forwardRef)((e,t)=>{let{src:r,srcSet:n,sizes:i,height:a,width:s,decoding:u,className:d,style:c,fetchPriority:f,placeholder:p,loading:m,unoptimized:v,fill:b,onLoadRef:y,onLoadingCompleteRef:w,setBlurComplete:S,setShowAltText:E,sizesInput:C,onLoad:j,onError:_,...O}=e;return(0,o.jsx)("img",{...O,...h(f),loading:m,width:s,height:a,decoding:u,"data-nimg":b?"fill":"1",className:d,style:c,sizes:i,srcSet:n,src:r,ref:(0,l.useCallback)(e=>{t&&("function"==typeof t?t(e):"object"==typeof t&&(t.current=e)),e&&(_&&(e.src=e.src),e.complete&&g(e,p,y,w,S,v,C))},[r,p,y,w,S,_,v,C,t]),onLoad:e=>{g(e.currentTarget,p,y,w,S,v,C)},onError:e=>{E(!0),"empty"!==p&&S(!0),_&&_(e)}})});function b(e){let{isAppRouter:t,imgAttributes:r}=e,n={as:"image",imageSrcSet:r.srcSet,imageSizes:r.sizes,crossOrigin:r.crossOrigin,referrerPolicy:r.referrerPolicy,...h(r.fetchPriority)};return t&&a.default.preload?(a.default.preload(r.src,n),null):(0,o.jsx)(s.default,{children:(0,o.jsx)("link",{rel:"preload",href:r.srcSet?void 0:r.src,...n},"__nimg-"+r.src+r.srcSet+r.sizes)})}let y=(0,l.forwardRef)((e,t)=>{let r=(0,l.useContext)(f.RouterContext),n=(0,l.useContext)(c.ImageConfigContext),i=(0,l.useMemo)(()=>{let e=m||n||d.imageConfigDefault,t=[...e.deviceSizes,...e.imageSizes].sort((e,t)=>e-t),r=e.deviceSizes.sort((e,t)=>e-t);return{...e,allSizes:t,deviceSizes:r}},[n]),{onLoad:a,onLoadingComplete:s}=e,g=(0,l.useRef)(a);(0,l.useEffect)(()=>{g.current=a},[a]);let h=(0,l.useRef)(s);(0,l.useEffect)(()=>{h.current=s},[s]);let[y,w]=(0,l.useState)(!1),[S,E]=(0,l.useState)(!1),{props:C,meta:j}=(0,u.getImgProps)(e,{defaultLoader:p.default,imgConf:i,blurComplete:y,showAltText:S});return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(v,{...C,unoptimized:j.unoptimized,placeholder:j.placeholder,fill:j.fill,onLoadRef:g,onLoadingCompleteRef:h,setBlurComplete:w,setShowAltText:E,sizesInput:e.sizes,ref:t}),j.priority?(0,o.jsx)(b,{isAppRouter:!r,imgAttributes:C}):null]})});("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},1028:function(e,t,r){Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"AmpStateContext",{enumerable:!0,get:function(){return n}});let n=r(8488)._(r(5301)).default.createContext({})},211:function(e,t){function r(e){let{ampFirst:t=!1,hybrid:r=!1,hasQuery:n=!1}=void 0===e?{}:e;return t||r&&n}Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"isInAmpMode",{enumerable:!0,get:function(){return r}})},6979:function(e,t,r){Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"getImgProps",{enumerable:!0,get:function(){return a}}),r(9469);let n=r(2411),i=r(5325);function o(e){return void 0!==e.default}function l(e){return void 0===e?e:"number"==typeof e?Number.isFinite(e)?e:NaN:"string"==typeof e&&/^[0-9]+$/.test(e)?parseInt(e,10):NaN}function a(e,t){var r;let a,s,u,{src:d,sizes:c,unoptimized:f=!1,priority:p=!1,loading:m,className:g,quality:h,width:v,height:b,fill:y=!1,style:w,overrideSrc:S,onLoad:E,onLoadingComplete:C,placeholder:j="empty",blurDataURL:_,fetchPriority:O,layout:x,objectFit:P,objectPosition:A,lazyBoundary:F,lazyRoot:T,...R}=e,{imgConf:N,showAltText:k,blurComplete:M,defaultLoader:I}=t,z=N||i.imageConfigDefault;if("allSizes"in z)a=z;else{let e=[...z.deviceSizes,...z.imageSizes].sort((e,t)=>e-t),t=z.deviceSizes.sort((e,t)=>e-t);a={...z,allSizes:e,deviceSizes:t}}if(void 0===I)throw Error("images.loaderFile detected but the file is missing default export.\nRead more: https://nextjs.org/docs/messages/invalid-images-config");let L=R.loader||I;delete R.loader,delete R.srcSet;let D="__next_img_default"in L;if(D){if("custom"===a.loader)throw Error('Image with src "'+d+'" is missing "loader" prop.\nRead more: https://nextjs.org/docs/messages/next-image-missing-loader')}else{let e=L;L=t=>{let{config:r,...n}=t;return e(n)}}if(x){"fill"===x&&(y=!0);let e={intrinsic:{maxWidth:"100%",height:"auto"},responsive:{width:"100%",height:"auto"}}[x];e&&(w={...w,...e});let t={responsive:"100vw",fill:"100vw"}[x];t&&!c&&(c=t)}let U="",H=l(v),B=l(b);if("object"==typeof(r=d)&&(o(r)||void 0!==r.src)){let e=o(d)?d.default:d;if(!e.src)throw Error("An object should only be passed to the image component src parameter if it comes from a static image import. It must include src. Received "+JSON.stringify(e));if(!e.height||!e.width)throw Error("An object should only be passed to the image component src parameter if it comes from a static image import. It must include height and width. Received "+JSON.stringify(e));if(s=e.blurWidth,u=e.blurHeight,_=_||e.blurDataURL,U=e.src,!y){if(H||B){if(H&&!B){let t=H/e.width;B=Math.round(e.height*t)}else if(!H&&B){let t=B/e.height;H=Math.round(e.width*t)}}else H=e.width,B=e.height}}let q=!p&&("lazy"===m||void 0===m);(!(d="string"==typeof d?d:U)||d.startsWith("data:")||d.startsWith("blob:"))&&(f=!0,q=!1),a.unoptimized&&(f=!0),D&&d.endsWith(".svg")&&!a.dangerouslyAllowSVG&&(f=!0),p&&(O="high");let G=l(h),V=Object.assign(y?{position:"absolute",height:"100%",width:"100%",left:0,top:0,right:0,bottom:0,objectFit:P,objectPosition:A}:{},k?{}:{color:"transparent"},w),W=M||"empty"===j?null:"blur"===j?'url("data:image/svg+xml;charset=utf-8,'+(0,n.getImageBlurSvg)({widthInt:H,heightInt:B,blurWidth:s,blurHeight:u,blurDataURL:_||"",objectFit:V.objectFit})+'")':'url("'+j+'")',Y=W?{backgroundSize:V.objectFit||"cover",backgroundPosition:V.objectPosition||"50% 50%",backgroundRepeat:"no-repeat",backgroundImage:W}:{},$=function(e){let{config:t,src:r,unoptimized:n,width:i,quality:o,sizes:l,loader:a}=e;if(n)return{src:r,srcSet:void 0,sizes:void 0};let{widths:s,kind:u}=function(e,t,r){let{deviceSizes:n,allSizes:i}=e;if(r){let e=/(^|\s)(1?\d?\d)vw/g,t=[];for(let n;n=e.exec(r);n)t.push(parseInt(n[2]));if(t.length){let e=.01*Math.min(...t);return{widths:i.filter(t=>t>=n[0]*e),kind:"w"}}return{widths:i,kind:"w"}}return"number"!=typeof t?{widths:n,kind:"w"}:{widths:[...new Set([t,2*t].map(e=>i.find(t=>t>=e)||i[i.length-1]))],kind:"x"}}(t,i,l),d=s.length-1;return{sizes:l||"w"!==u?l:"100vw",srcSet:s.map((e,n)=>a({config:t,src:r,quality:o,width:e})+" "+("w"===u?e:n+1)+u).join(", "),src:a({config:t,src:r,quality:o,width:s[d]})}}({config:a,src:d,unoptimized:f,width:H,quality:G,sizes:c,loader:L});return{props:{...R,loading:q?"lazy":m,fetchPriority:O,width:H,height:B,decoding:"async",className:g,style:{...V,...Y},sizes:$.sizes,srcSet:$.srcSet,src:S||$.src},meta:{unoptimized:f,priority:p,placeholder:j,fill:y}}}},9777:function(e,t,r){Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{default:function(){return g},defaultHead:function(){return c}});let n=r(8488),i=r(4489),o=r(6935),l=i._(r(5301)),a=n._(r(5838)),s=r(1028),u=r(7266),d=r(211);function c(e){void 0===e&&(e=!1);let t=[(0,o.jsx)("meta",{charSet:"utf-8"})];return e||t.push((0,o.jsx)("meta",{name:"viewport",content:"width=device-width"})),t}function f(e,t){return"string"==typeof t||"number"==typeof t?e:t.type===l.default.Fragment?e.concat(l.default.Children.toArray(t.props.children).reduce((e,t)=>"string"==typeof t||"number"==typeof t?e:e.concat(t),[])):e.concat(t)}r(9469);let p=["name","httpEquiv","charSet","itemProp"];function m(e,t){let{inAmpMode:r}=t;return e.reduce(f,[]).reverse().concat(c(r).reverse()).filter(function(){let e=new Set,t=new Set,r=new Set,n={};return i=>{let o=!0,l=!1;if(i.key&&"number"!=typeof i.key&&i.key.indexOf("$")>0){l=!0;let t=i.key.slice(i.key.indexOf("$")+1);e.has(t)?o=!1:e.add(t)}switch(i.type){case"title":case"base":t.has(i.type)?o=!1:t.add(i.type);break;case"meta":for(let e=0,t=p.length;e<t;e++){let t=p[e];if(i.props.hasOwnProperty(t)){if("charSet"===t)r.has(t)?o=!1:r.add(t);else{let e=i.props[t],r=n[t]||new Set;("name"!==t||!l)&&r.has(e)?o=!1:(r.add(e),n[t]=r)}}}}return o}}()).reverse().map((e,t)=>{let n=e.key||t;if(!r&&"link"===e.type&&e.props.href&&["https://fonts.googleapis.com/css","https://use.typekit.net/"].some(t=>e.props.href.startsWith(t))){let t={...e.props||{}};return t["data-href"]=t.href,t.href=void 0,t["data-optimized-fonts"]=!0,l.default.cloneElement(e,t)}return l.default.cloneElement(e,{key:n})})}let g=function(e){let{children:t}=e,r=(0,l.useContext)(s.AmpStateContext),n=(0,l.useContext)(u.HeadManagerContext);return(0,o.jsx)(a.default,{reduceComponentsToState:m,headManager:n,inAmpMode:(0,d.isInAmpMode)(r),children:t})};("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},2411:function(e,t){function r(e){let{widthInt:t,heightInt:r,blurWidth:n,blurHeight:i,blurDataURL:o,objectFit:l}=e,a=n?40*n:t,s=i?40*i:r,u=a&&s?"viewBox='0 0 "+a+" "+s+"'":"";return"%3Csvg xmlns='http://www.w3.org/2000/svg' "+u+"%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3CfeColorMatrix values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 100 -1' result='s'/%3E%3CfeFlood x='0' y='0' width='100%25' height='100%25'/%3E%3CfeComposite operator='out' in='s'/%3E%3CfeComposite in2='SourceGraphic'/%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Cimage width='100%25' height='100%25' x='0' y='0' preserveAspectRatio='"+(u?"none":"contain"===l?"xMidYMid":"cover"===l?"xMidYMid slice":"none")+"' style='filter: url(%23b);' href='"+o+"'/%3E%3C/svg%3E"}Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"getImageBlurSvg",{enumerable:!0,get:function(){return r}})},3111:function(e,t,r){Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"ImageConfigContext",{enumerable:!0,get:function(){return o}});let n=r(8488)._(r(5301)),i=r(5325),o=n.default.createContext(i.imageConfigDefault)},5325:function(e,t){Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{VALID_LOADERS:function(){return r},imageConfigDefault:function(){return n}});let r=["default","imgix","cloudinary","akamai","custom"],n={deviceSizes:[640,750,828,1080,1200,1920,2048,3840],imageSizes:[16,32,48,64,96,128,256,384],path:"/_next/image",loader:"default",loaderFile:"",domains:[],disableStaticImages:!1,minimumCacheTTL:60,formats:["image/webp"],dangerouslyAllowSVG:!1,contentSecurityPolicy:"script-src 'none'; frame-src 'none'; sandbox;",contentDispositionType:"inline",remotePatterns:[],unoptimized:!1}},665:function(e,t,r){Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{default:function(){return s},getImageProps:function(){return a}});let n=r(8488),i=r(6979),o=r(6083),l=n._(r(1279));function a(e){let{props:t}=(0,i.getImgProps)(e,{defaultLoader:l.default,imgConf:{deviceSizes:[640,750,828,1080,1200,1920,2048,3840],imageSizes:[16,32,48,64,96,128,256,384],path:"/_next/image",loader:"default",dangerouslyAllowSVG:!1,unoptimized:!0}});for(let[e,r]of Object.entries(t))void 0===r&&delete t[e];return{props:t}}let s=o.Image},1279:function(e,t){function r(e){let{config:t,src:r,width:n,quality:i}=e;return t.path+"?url="+encodeURIComponent(r)+"&w="+n+"&q="+(i||75)}Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"default",{enumerable:!0,get:function(){return n}}),r.__next_img_default=!0;let n=r},3029:function(e,t,r){Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"RouterContext",{enumerable:!0,get:function(){return n}});let n=r(8488)._(r(5301)).default.createContext(null)},5838:function(e,t,r){Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"default",{enumerable:!0,get:function(){return a}});let n=r(5301),i="undefined"==typeof window,o=i?()=>{}:n.useLayoutEffect,l=i?()=>{}:n.useEffect;function a(e){let{headManager:t,reduceComponentsToState:r}=e;function a(){if(t&&t.mountedInstances){let i=n.Children.toArray(Array.from(t.mountedInstances).filter(Boolean));t.updateHead(r(i,e))}}if(i){var s;null==t||null==(s=t.mountedInstances)||s.add(e.children),a()}return o(()=>{var r;return null==t||null==(r=t.mountedInstances)||r.add(e.children),()=>{var r;null==t||null==(r=t.mountedInstances)||r.delete(e.children)}}),o(()=>(t&&(t._pendingUpdate=a),()=>{t&&(t._pendingUpdate=a)})),l(()=>(t&&t._pendingUpdate&&(t._pendingUpdate(),t._pendingUpdate=null),()=>{t&&t._pendingUpdate&&(t._pendingUpdate(),t._pendingUpdate=null)})),null}},2506:function(e,t,r){let n,i,o,l;r.d(t,{u:function(){return Q}});var a=r(5301),s=r.t(a,2);function u(){for(var e=arguments.length,t=Array(e),r=0;r<e;r++)t[r]=arguments[r];return Array.from(new Set(t.flatMap(e=>"string"==typeof e?e.split(" "):[]))).filter(Boolean).join(" ")}function d(e,t){for(var r=arguments.length,n=Array(r>2?r-2:0),i=2;i<r;i++)n[i-2]=arguments[i];if(e in t){let r=t[e];return"function"==typeof r?r(...n):r}let o=Error('Tried to handle "'.concat(e,'" but there is no handler defined. Only defined handlers are: ').concat(Object.keys(t).map(e=>'"'.concat(e,'"')).join(", "),"."));throw Error.captureStackTrace&&Error.captureStackTrace(o,d),o}var c=((n=c||{})[n.None=0]="None",n[n.RenderStrategy=1]="RenderStrategy",n[n.Static=2]="Static",n),f=((i=f||{})[i.Unmount=0]="Unmount",i[i.Hidden=1]="Hidden",i);function p(e){let{ourProps:t,theirProps:r,slot:n,defaultTag:i,features:o,visible:l=!0,name:a}=e,s=g(r,t);if(l)return m(s,n,i,a);let u=null!=o?o:0;if(2&u){let{static:e=!1,...t}=s;if(e)return m(t,n,i,a)}if(1&u){let{unmount:e=!0,...t}=s;return d(e?0:1,{0:()=>null,1:()=>m({...t,hidden:!0,style:{display:"none"}},n,i,a)})}return m(s,n,i,a)}function m(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},r=arguments.length>2?arguments[2]:void 0,n=arguments.length>3?arguments[3]:void 0,{as:i=r,children:o,refName:l="ref",...s}=b(e,["unmount","static"]),d=void 0!==e.ref?{[l]:e.ref}:{},c="function"==typeof o?o(t):o;"className"in s&&s.className&&"function"==typeof s.className&&(s.className=s.className(t));let f={};if(t){let e=!1,r=[];for(let[n,i]of Object.entries(t))"boolean"==typeof i&&(e=!0),!0===i&&r.push(n);e&&(f["data-headlessui-state"]=r.join(" "))}if(i===a.Fragment&&Object.keys(v(s)).length>0){if(!(0,a.isValidElement)(c)||Array.isArray(c)&&c.length>1)throw Error(['Passing props on "Fragment"!',"","The current component <".concat(n,' /> is rendering a "Fragment".'),"However we need to passthrough the following props:",Object.keys(s).map(e=>"  - ".concat(e)).join("\n"),"","You can apply a few solutions:",['Add an `as="..."` prop, to ensure that we render an actual element instead of a "Fragment".',"Render a single element as the child so that we can forward the props onto that element."].map(e=>"  - ".concat(e)).join("\n")].join("\n"));let e=c.props,t="function"==typeof(null==e?void 0:e.className)?function(){for(var t=arguments.length,r=Array(t),n=0;n<t;n++)r[n]=arguments[n];return u(null==e?void 0:e.className(...r),s.className)}:u(null==e?void 0:e.className,s.className);return(0,a.cloneElement)(c,Object.assign({},g(c.props,v(b(s,["ref"]))),f,d,function(){for(var e=arguments.length,t=Array(e),r=0;r<e;r++)t[r]=arguments[r];return{ref:t.every(e=>null==e)?void 0:e=>{for(let r of t)null!=r&&("function"==typeof r?r(e):r.current=e)}}}(c.ref,d.ref),t?{className:t}:{}))}return(0,a.createElement)(i,Object.assign({},b(s,["ref"]),i!==a.Fragment&&d,i!==a.Fragment&&f),c)}function g(){for(var e=arguments.length,t=Array(e),r=0;r<e;r++)t[r]=arguments[r];if(0===t.length)return{};if(1===t.length)return t[0];let n={},i={};for(let e of t)for(let t in e)t.startsWith("on")&&"function"==typeof e[t]?(null!=i[t]||(i[t]=[]),i[t].push(e[t])):n[t]=e[t];if(n.disabled||n["aria-disabled"])return Object.assign(n,Object.fromEntries(Object.keys(i).map(e=>[e,void 0])));for(let e in i)Object.assign(n,{[e](t){for(var r=arguments.length,n=Array(r>1?r-1:0),o=1;o<r;o++)n[o-1]=arguments[o];for(let r of i[e]){if((t instanceof Event||(null==t?void 0:t.nativeEvent)instanceof Event)&&t.defaultPrevented)return;r(t,...n)}}});return n}function h(e){var t;return Object.assign((0,a.forwardRef)(e),{displayName:null!=(t=e.displayName)?t:e.name})}function v(e){let t=Object.assign({},e);for(let e in t)void 0===t[e]&&delete t[e];return t}function b(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[],r=Object.assign({},e);for(let e of t)e in r&&delete r[e];return r}let y=(0,a.createContext)(null);y.displayName="OpenClosedContext";var w=((o=w||{})[o.Open=1]="Open",o[o.Closed=2]="Closed",o[o.Closing=4]="Closing",o[o.Opening=8]="Opening",o);function S(){return(0,a.useContext)(y)}function E(e){let{value:t,children:r}=e;return a.createElement(y.Provider,{value:t},r)}var C=Object.defineProperty,j=(e,t,r)=>t in e?C(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,_=(e,t,r)=>(j(e,"symbol"!=typeof t?t+"":t,r),r);class O{set(e){this.current!==e&&(this.handoffState="pending",this.currentId=0,this.current=e)}reset(){this.set(this.detect())}nextId(){return++this.currentId}get isServer(){return"server"===this.current}get isClient(){return"client"===this.current}detect(){return"undefined"==typeof window||"undefined"==typeof document?"server":"client"}handoff(){"pending"===this.handoffState&&(this.handoffState="complete")}get isHandoffComplete(){return"complete"===this.handoffState}constructor(){_(this,"current",this.detect()),_(this,"handoffState","pending"),_(this,"currentId",0)}}let x=new O,P=(e,t)=>{x.isServer?(0,a.useEffect)(e,t):(0,a.useLayoutEffect)(e,t)};function A(){let e=(0,a.useRef)(!1);return P(()=>(e.current=!0,()=>{e.current=!1}),[]),e}function F(e){let t=(0,a.useRef)(e);return P(()=>{t.current=e},[e]),t}function T(){let e;let t=(e="undefined"==typeof document,(0,s.useSyncExternalStore)(()=>()=>{},()=>!1,()=>!e)),[r,n]=a.useState(x.isHandoffComplete);return r&&!1===x.isHandoffComplete&&n(!1),a.useEffect(()=>{!0!==r&&n(!0)},[r]),a.useEffect(()=>x.handoff(),[]),!t&&r}let R=function(e){let t=F(e);return a.useCallback(function(){for(var e=arguments.length,r=Array(e),n=0;n<e;n++)r[n]=arguments[n];return t.current(...r)},[t])},N=Symbol();function k(){for(var e=arguments.length,t=Array(e),r=0;r<e;r++)t[r]=arguments[r];let n=(0,a.useRef)(t);(0,a.useEffect)(()=>{n.current=t},[t]);let i=R(e=>{for(let t of n.current)null!=t&&("function"==typeof t?t(e):t.current=e)});return t.every(e=>null==e||(null==e?void 0:e[N]))?void 0:i}function M(){let e=[],t={addEventListener:(e,r,n,i)=>(e.addEventListener(r,n,i),t.add(()=>e.removeEventListener(r,n,i))),requestAnimationFrame(){for(var e=arguments.length,r=Array(e),n=0;n<e;n++)r[n]=arguments[n];let i=requestAnimationFrame(...r);return t.add(()=>cancelAnimationFrame(i))},nextFrame(){for(var e=arguments.length,r=Array(e),n=0;n<e;n++)r[n]=arguments[n];return t.requestAnimationFrame(()=>t.requestAnimationFrame(...r))},setTimeout(){for(var e=arguments.length,r=Array(e),n=0;n<e;n++)r[n]=arguments[n];let i=setTimeout(...r);return t.add(()=>clearTimeout(i))},microTask(){for(var e,r=arguments.length,n=Array(r),i=0;i<r;i++)n[i]=arguments[i];let o={current:!0};return e=()=>{o.current&&n[0]()},"function"==typeof queueMicrotask?queueMicrotask(e):Promise.resolve().then(e).catch(e=>setTimeout(()=>{throw e})),t.add(()=>{o.current=!1})},style(e,t,r){let n=e.style.getPropertyValue(t);return Object.assign(e.style,{[t]:r}),this.add(()=>{Object.assign(e.style,{[t]:n})})},group(e){let t=M();return e(t),this.add(()=>t.dispose())},add:t=>(e.push(t),()=>{let r=e.indexOf(t);if(r>=0)for(let t of e.splice(r,1))t()}),dispose(){for(let t of e.splice(0))t()}};return t}function I(e){for(var t=arguments.length,r=Array(t>1?t-1:0),n=1;n<t;n++)r[n-1]=arguments[n];e&&r.length>0&&e.classList.add(...r)}function z(e){for(var t=arguments.length,r=Array(t>1?t-1:0),n=1;n<t;n++)r[n-1]=arguments[n];e&&r.length>0&&e.classList.remove(...r)}function L(){let[e]=(0,a.useState)(M);return(0,a.useEffect)(()=>()=>e.dispose(),[e]),e}function D(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"";return e.split(" ").filter(e=>e.trim().length>1)}let U=(0,a.createContext)(null);U.displayName="TransitionContext";var H=((l=H||{}).Visible="visible",l.Hidden="hidden",l);let B=(0,a.createContext)(null);function q(e){return"children"in e?q(e.children):e.current.filter(e=>{let{el:t}=e;return null!==t.current}).filter(e=>{let{state:t}=e;return"visible"===t}).length>0}function G(e,t){let r=F(e),n=(0,a.useRef)([]),i=A(),o=L(),l=R(function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:f.Hidden,l=n.current.findIndex(t=>{let{el:r}=t;return r===e});-1!==l&&(d(t,{[f.Unmount](){n.current.splice(l,1)},[f.Hidden](){n.current[l].state="hidden"}}),o.microTask(()=>{var e;!q(n)&&i.current&&(null==(e=r.current)||e.call(r))}))}),s=R(e=>{let t=n.current.find(t=>{let{el:r}=t;return r===e});return t?"visible"!==t.state&&(t.state="visible"):n.current.push({el:e,state:"visible"}),()=>l(e,f.Unmount)}),u=(0,a.useRef)([]),c=(0,a.useRef)(Promise.resolve()),p=(0,a.useRef)({enter:[],leave:[],idle:[]}),m=R((e,r,n)=>{u.current.splice(0),t&&(t.chains.current[r]=t.chains.current[r].filter(t=>{let[r]=t;return r!==e})),null==t||t.chains.current[r].push([e,new Promise(e=>{u.current.push(e)})]),null==t||t.chains.current[r].push([e,new Promise(e=>{Promise.all(p.current[r].map(e=>{let[t,r]=e;return r})).then(()=>e())})]),"enter"===r?c.current=c.current.then(()=>null==t?void 0:t.wait.current).then(()=>n(r)):n(r)}),g=R((e,t,r)=>{Promise.all(p.current[t].splice(0).map(e=>{let[t,r]=e;return r})).then(()=>{var e;null==(e=u.current.shift())||e()}).then(()=>r(t))});return(0,a.useMemo)(()=>({children:n,register:s,unregister:l,onStart:m,onStop:g,wait:c,chains:p}),[s,l,n,m,g,p,c])}function V(){}B.displayName="NestingContext";let W=["beforeEnter","afterEnter","beforeLeave","afterLeave"];function Y(e){var t;let r={};for(let n of W)r[n]=null!=(t=e[n])?t:V;return r}let $=c.RenderStrategy,J=h(function(e,t){let{show:r,appear:n=!1,unmount:i=!0,...o}=e,l=(0,a.useRef)(null),s=k(l,t);T();let u=S();if(void 0===r&&null!==u&&(r=(u&w.Open)===w.Open),![!0,!1].includes(r))throw Error("A <Transition /> is used but it is missing a `show={true | false}` prop.");let[d,c]=(0,a.useState)(r?"visible":"hidden"),f=G(()=>{c("hidden")}),[m,g]=(0,a.useState)(!0),h=(0,a.useRef)([r]);P(()=>{!1!==m&&h.current[h.current.length-1]!==r&&(h.current.push(r),g(!1))},[h,r]);let v=(0,a.useMemo)(()=>({show:r,appear:n,initial:m}),[r,n,m]);(0,a.useEffect)(()=>{if(r)c("visible");else if(q(f)){let e=l.current;if(!e)return;let t=e.getBoundingClientRect();0===t.x&&0===t.y&&0===t.width&&0===t.height&&c("hidden")}else c("hidden")},[r,f]);let b={unmount:i},y=R(()=>{var t;m&&g(!1),null==(t=e.beforeEnter)||t.call(e)}),E=R(()=>{var t;m&&g(!1),null==(t=e.beforeLeave)||t.call(e)});return a.createElement(B.Provider,{value:f},a.createElement(U.Provider,{value:v},p({ourProps:{...b,as:a.Fragment,children:a.createElement(X,{ref:s,...b,...o,beforeEnter:y,beforeLeave:E})},theirProps:{},defaultTag:a.Fragment,features:$,visible:"visible"===d,name:"Transition"})))}),X=h(function(e,t){var r,n,i;let o;let{beforeEnter:l,afterEnter:s,beforeLeave:c,afterLeave:m,enter:g,enterFrom:h,enterTo:v,entered:b,leave:y,leaveFrom:S,leaveTo:C,...j}=e,_=(0,a.useRef)(null),O=k(_,t),x=null==(r=j.unmount)||r?f.Unmount:f.Hidden,{show:N,appear:H,initial:V}=function(){let e=(0,a.useContext)(U);if(null===e)throw Error("A <Transition.Child /> is used but it is missing a parent <Transition /> or <Transition.Root />.");return e}(),[W,J]=(0,a.useState)(N?"visible":"hidden"),X=function(){let e=(0,a.useContext)(B);if(null===e)throw Error("A <Transition.Child /> is used but it is missing a parent <Transition /> or <Transition.Root />.");return e}(),{register:K,unregister:Q}=X;(0,a.useEffect)(()=>K(_),[K,_]),(0,a.useEffect)(()=>{if(x===f.Hidden&&_.current){if(N&&"visible"!==W){J("visible");return}return d(W,{hidden:()=>Q(_),visible:()=>K(_)})}},[W,_,K,Q,N,x]);let Z=F({base:D(j.className),enter:D(g),enterFrom:D(h),enterTo:D(v),entered:D(b),leave:D(y),leaveFrom:D(S),leaveTo:D(C)}),ee=(i={beforeEnter:l,afterEnter:s,beforeLeave:c,afterLeave:m},o=(0,a.useRef)(Y(i)),(0,a.useEffect)(()=>{o.current=Y(i)},[i]),o),et=T();(0,a.useEffect)(()=>{if(et&&"visible"===W&&null===_.current)throw Error("Did you forget to passthrough the `ref` to the actual DOM node?")},[_,W,et]);let er=H&&N&&V,en=et&&(!V||H)?N?"enter":"leave":"idle",ei=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,[t,r]=(0,a.useState)(e),n=A(),i=(0,a.useCallback)(e=>{n.current&&r(t=>t|e)},[t,n]),o=(0,a.useCallback)(e=>!!(t&e),[t]);return{flags:t,addFlag:i,hasFlag:o,removeFlag:(0,a.useCallback)(e=>{n.current&&r(t=>t&~e)},[r,n]),toggleFlag:(0,a.useCallback)(e=>{n.current&&r(t=>t^e)},[r])}}(0),eo=R(e=>d(e,{enter:()=>{ei.addFlag(w.Opening),ee.current.beforeEnter()},leave:()=>{ei.addFlag(w.Closing),ee.current.beforeLeave()},idle:()=>{}})),el=R(e=>d(e,{enter:()=>{ei.removeFlag(w.Opening),ee.current.afterEnter()},leave:()=>{ei.removeFlag(w.Closing),ee.current.afterLeave()},idle:()=>{}})),ea=G(()=>{J("hidden"),Q(_)},X);!function(e){let{immediate:t,container:r,direction:n,classes:i,onStart:o,onStop:l}=e,a=A(),s=L(),u=F(n);P(()=>{t&&(u.current="enter")},[t]),P(()=>{let e=M();s.add(e.dispose);let t=r.current;if(t&&"idle"!==u.current&&a.current){var n,c,f;let r,a,s,p,m,g,h;return e.dispose(),o.current(u.current),e.add((n=i.current,c="enter"===u.current,f=()=>{e.dispose(),l.current(u.current)},a=c?"enter":"leave",s=M(),p=void 0!==f?(r={called:!1},function(){for(var e=arguments.length,t=Array(e),n=0;n<e;n++)t[n]=arguments[n];if(!r.called)return r.called=!0,f(...t)}):()=>{},"enter"===a&&(t.removeAttribute("hidden"),t.style.display=""),m=d(a,{enter:()=>n.enter,leave:()=>n.leave}),g=d(a,{enter:()=>n.enterTo,leave:()=>n.leaveTo}),h=d(a,{enter:()=>n.enterFrom,leave:()=>n.leaveFrom}),z(t,...n.base,...n.enter,...n.enterTo,...n.enterFrom,...n.leave,...n.leaveFrom,...n.leaveTo,...n.entered),I(t,...n.base,...m,...h),s.nextFrame(()=>{z(t,...n.base,...m,...h),I(t,...n.base,...m,...g),function(e,t){let r=M();if(!e)return r.dispose;let{transitionDuration:n,transitionDelay:i}=getComputedStyle(e),[o,l]=[n,i].map(e=>{let[t=0]=e.split(",").filter(Boolean).map(e=>e.includes("ms")?parseFloat(e):1e3*parseFloat(e)).sort((e,t)=>t-e);return t}),a=o+l;if(0!==a){r.group(r=>{r.setTimeout(()=>{t(),r.dispose()},a),r.addEventListener(e,"transitionrun",e=>{e.target===e.currentTarget&&r.dispose()})});let n=r.addEventListener(e,"transitionend",e=>{e.target===e.currentTarget&&(t(),n())})}else t();r.add(()=>t()),r.dispose}(t,()=>(z(t,...n.base,...m),I(t,...n.base,...n.entered),p()))}),s.dispose)),e.dispose}},[n])}({immediate:er,container:_,classes:Z,direction:en,onStart:F(e=>{ea.onStart(_,e,eo)}),onStop:F(e=>{ea.onStop(_,e,el),"leave"!==e||q(ea)||(J("hidden"),Q(_))})});let es=j;return er?es={...es,className:u(j.className,...Z.current.enter,...Z.current.enterFrom)}:(es.className=u(j.className,null==(n=_.current)?void 0:n.className),""===es.className&&delete es.className),a.createElement(B.Provider,{value:ea},a.createElement(E,{value:d(W,{visible:w.Open,hidden:w.Closed})|ei.flags},p({ourProps:{ref:O},theirProps:es,defaultTag:"div",features:$,visible:"visible"===W,name:"Transition.Child"})))}),K=h(function(e,t){let r=null!==(0,a.useContext)(U),n=null!==S();return a.createElement(a.Fragment,null,!r&&n?a.createElement(J,{ref:t,...e}):a.createElement(X,{ref:t,...e}))}),Q=Object.assign(J,{Child:K,Root:J})}}]);