//https://github.com/fabi1cazenave/webL10n without old IE support, minified
document.webL10n=function(y,k,J){function p(c){console.warn("[l10n] "+c)}function F(){var c=k.querySelector('script[type="application/l10n"]');return c?JSON.parse(c.innerHTML):null}function z(c){var e=k.createEvent("Event");e.initEvent("localized",!0,!1);e.language=c;k.dispatchEvent(e)}function A(c,e,b){e=e||function(b){};b=b||function(){p(c+" not found.")};var d=new XMLHttpRequest;d.open("GET",c,!0);d.overrideMimeType&&d.overrideMimeType("text/plain; charset=utf-8");d.onreadystatechange=function(){4==
d.readyState&&(200==d.status||0===d.status?e(d.responseText):b())};d.onerror=b;d.ontimeout=b;try{d.send(null)}catch(g){b()}}function G(c,e,b,d){function g(b,c){function d(b,c,d){function l(){for(;;){if(!B.length){d();break}var b=B.shift();if(!t.test(b)){if(c){if(r=k.exec(b)){u=r[1].toLowerCase();q="*"!==u&&u!==e&&u!==n;continue}else if(q)continue;if(r=p.exec(b)){g(a+r[1],l);break}}var h=b.match(m);h&&3==h.length&&(b=h[1],h=h[2],h=0>h.lastIndexOf("\\")?h:h.replace(/\\\\/g,"\\").replace(/\\n/g,"\n").replace(/\\r/g,
"\r").replace(/\\t/g,"\t").replace(/\\b/g,"\b").replace(/\\f/g,"\f").replace(/\\{/g,"{").replace(/\\}/g,"}").replace(/\\"/g,'"').replace(/\\'/g,"'"),f[b]=h)}}}var B=b.replace(h,"").split(/[\r\n]+/),u="*",n=e.split("-",1)[0],q=!1,r="";l()}function g(a,b){A(a,function(a){d(a,!1,b)},null)}var f={},h=/^\s*|\s*$/,t=/^\s*#|^\s*$/,k=/^\s*\[(.*)\]\s*$/,p=/^\s*@import\s+url\((.*)\)\s*$/i,m=/^([^=\s]*)\s*=\s*(.+)$/;d(b,!0,function(){c(f)})}var a=c.replace(/[^\/]*$/,"")||"./";A(c,function(a){v+=a;g(a,function(a){for(var c in a){var d=
c.lastIndexOf(".");if(0<d){var e=c.substring(0,d);d=c.substr(d+1)}else e=c,d="textContent";f[e]||(f[e]={});f[e][d]=a[c]}b&&b()})},d)}function w(c,e){function b(a){var b=a.href;this.load=function(a,c){G(b,a,c,function(){p(b+" not found.");p('"'+a+'" resource not found');m="";c()})}}c&&(c=c.toLowerCase());e=e||function(){};f={};m=v="";m=c;var d=k.querySelectorAll('link[type="application/l10n"]'),g=d.length;if(0===g){if((d=F())&&d.locales&&d.default_locale){f=d.locales[c];if(!f){var a=d.default_locale.toLowerCase();
for(h in d.locales){var h=h.toLowerCase();if(h===c){f=d.locales[c];break}else h===a&&(f=d.locales[a])}}e()}z(c);n="complete"}else{h=null;var t=0;h=function(){t++;t>=g&&(e(),z(c),n="complete")};for(a=0;a<g;a++)(new b(d[a])).load(c,h)}}function H(c){function e(a,b){return-1!==b.indexOf(a)}function b(a,b,c){return b<=a&&a<=c}var d={0:function(a){return"other"},1:function(a){return b(a%100,3,10)?"few":0===a?"zero":b(a%100,11,99)?"many":2==a?"two":1==a?"one":"other"},2:function(a){return 0!==a&&0===a%
10?"many":2==a?"two":1==a?"one":"other"},3:function(a){return 1==a?"one":"other"},4:function(a){return b(a,0,1)?"one":"other"},5:function(a){return b(a,0,2)&&2!=a?"one":"other"},6:function(a){return 0===a?"zero":1==a%10&&11!=a%100?"one":"other"},7:function(a){return 2==a?"two":1==a?"one":"other"},8:function(a){return b(a,3,6)?"few":b(a,7,10)?"many":2==a?"two":1==a?"one":"other"},9:function(a){return 0===a||1!=a&&b(a%100,1,19)?"few":1==a?"one":"other"},10:function(a){return b(a%10,2,9)&&!b(a%100,11,
19)?"few":1!=a%10||b(a%100,11,19)?"other":"one"},11:function(a){return b(a%10,2,4)&&!b(a%100,12,14)?"few":0===a%10||b(a%10,5,9)||b(a%100,11,14)?"many":1==a%10&&11!=a%100?"one":"other"},12:function(a){return b(a,2,4)?"few":1==a?"one":"other"},13:function(a){return b(a%10,2,4)&&!b(a%100,12,14)?"few":1!=a&&b(a%10,0,1)||b(a%10,5,9)||b(a%100,12,14)?"many":1==a?"one":"other"},14:function(a){return b(a%100,3,4)?"few":2==a%100?"two":1==a%100?"one":"other"},15:function(a){return 0===a||b(a%100,2,10)?"few":
b(a%100,11,19)?"many":1==a?"one":"other"},16:function(a){return 1==a%10&&11!=a?"one":"other"},17:function(a){return 3==a?"few":0===a?"zero":6==a?"many":2==a?"two":1==a?"one":"other"},18:function(a){return 0===a?"zero":b(a,0,2)&&0!==a&&2!=a?"one":"other"},19:function(a){return b(a,2,10)?"few":b(a,0,1)?"one":"other"},20:function(a){return!b(a%10,3,4)&&9!=a%10||b(a%100,10,19)||b(a%100,70,79)||b(a%100,90,99)?0===a%1E6&&0!==a?"many":2!=a%10||e(a%100,[12,72,92])?1!=a%10||e(a%100,[11,71,91])?"other":"one":
"two":"few"},21:function(a){return 0===a?"zero":1==a?"one":"other"},22:function(a){return b(a,0,1)||b(a,11,99)?"one":"other"},23:function(a){return b(a%10,1,2)||0===a%20?"one":"other"},24:function(a){return b(a,3,10)||b(a,13,19)?"few":e(a,[2,12])?"two":e(a,[1,11])?"one":"other"}},g={af:3,ak:4,am:4,ar:1,asa:3,az:0,be:11,bem:3,bez:3,bg:3,bh:4,bm:0,bn:3,bo:0,br:20,brx:3,bs:11,ca:3,cgg:3,chr:3,cs:12,cy:17,da:3,de:3,dv:3,dz:0,ee:3,el:3,en:3,eo:3,es:3,et:3,eu:3,fa:0,ff:5,fi:3,fil:4,fo:3,fr:5,fur:3,fy:3,
ga:8,gd:24,gl:3,gsw:3,gu:3,guw:4,gv:23,ha:3,haw:3,he:2,hi:4,hr:11,hu:0,id:0,ig:0,ii:0,is:3,it:3,iu:7,ja:0,jmc:3,jv:0,ka:0,kab:5,kaj:3,kcg:3,kde:0,kea:0,kk:3,kl:3,km:0,kn:0,ko:0,ksb:3,ksh:21,ku:3,kw:7,lag:18,lb:3,lg:3,ln:4,lo:0,lt:10,lv:6,mas:3,mg:4,mk:16,ml:3,mn:3,mo:9,mr:3,ms:0,mt:15,my:0,nah:3,naq:7,nb:3,nd:3,ne:3,nl:3,nn:3,no:3,nr:3,nso:4,ny:3,nyn:3,om:3,or:3,pa:3,pap:3,pl:13,ps:3,pt:3,rm:3,ro:9,rof:3,ru:11,rwk:3,sah:0,saq:3,se:7,seh:3,ses:0,sg:0,sh:11,shi:19,sk:12,sl:14,sma:7,smi:7,smj:7,smn:7,
sms:7,sn:3,so:3,sq:3,sr:11,ss:3,ssy:3,st:3,sv:3,sw:3,syr:3,ta:3,te:3,teo:3,th:0,ti:4,tig:3,tk:3,tl:4,tn:3,to:0,tr:0,ts:3,tzm:22,uk:11,ur:3,ve:3,vi:0,vun:3,wa:4,wae:3,wo:0,xh:3,xog:3,yo:0,zh:0,zu:3}[c.replace(/-.*$/,"")];return g in d?d[g]:(p("plural form unknown for ["+c+"]"),function(){return"other"})}function C(c,e,b){var d=f[c];if(!d){p("#"+c+" is undefined.");if(!b)return null;d=b}b={};for(var g in d){var a=d[g];var h=void 0,k=e,m=c,n=g,l=/\{\[\s*([a-zA-Z]+)\(([a-zA-Z]+)\)\s*\]\}/.exec(a);if(l&&
l.length){var r=l[1];l=l[2];k&&l in k?h=k[l]:l in f&&(h=f[l]);r in q&&(a=(0,q[r])(a,h,m,n))}a=I(a,e,c);b[g]=a}return b}function I(c,e,b){return c.replace(/\{\{\s*(.+?)\s*\}\}/g,function(b,c){return e&&c in e?e[c]:c in f?f[c]:b})}function D(c){if(c){var e=c.getAttribute("data-l10n-id");var b=c.getAttribute("data-l10n-args");var d={};if(b)try{d=JSON.parse(b)}catch(t){p("could not parse arguments for #"+e)}}else d=e=void 0;if(e)if(d=C(e,d)){if(d.textContent){if(c.children)e=c.children.length;else if("undefined"!==
typeof c.childElementCount)e=c.childElementCount;else for(b=e=0;b<c.childNodes.length;b++)e+=1===c.nodeType?1:0;if(0===e)c.textContent=d.textContent;else{e=c.childNodes;b=!1;for(var g=0,a=e.length;g<a;g++)3===e[g].nodeType&&/\S/.test(e[g].nodeValue)&&(b?e[g].nodeValue="":(e[g].nodeValue=d.textContent,b=!0));b||(e=k.createTextNode(d.textContent),c.insertBefore(e,c.firstChild))}delete d.textContent}for(var f in d)c[f]=d[f]}else p("#"+e+" is undefined.")}function x(c){for(var e=(c=c||k.documentElement)?
c.querySelectorAll("*[data-l10n-id]"):[],b=e.length,d=0;d<b;d++)D(e[d]);1===c.nodeType&&D(c)}function E(){n="interactive";var c=navigator.language||navigator.userLanguage;k.documentElement.lang===c?w(c):w(c,x)}var f={},v="",m="",q={},n="loading";q.plural=function(c,e,b,d){e=parseFloat(e);if(isNaN(e)||"textContent"!=d)return c;q._pluralRules||(q._pluralRules=H(m));var g="["+q._pluralRules(e)+"]";0===e&&b+"[zero]"in f?c=f[b+"[zero]"][d]:1==e&&b+"[one]"in f?c=f[b+"[one]"][d]:2==e&&b+"[two]"in f?c=f[b+
"[two]"][d]:b+g in f?c=f[b+g][d]:b+"[other]"in f&&(c=f[b+"[other]"][d]);return c};"loading"===k.readyState?k.addEventListener("DOMContentLoaded",E):y.setTimeout(E);return{get:function(c,e,b){var d=c.lastIndexOf("."),f="textContent";0<d&&(f=c.substr(d+1),c=c.substring(0,d));if(b){var a={};a[f]=b}return(e=C(c,e,a))&&f in e?e[f]:"{{"+c+"}}"},getData:function(){return f},getText:function(){return v},getLanguage:function(){return m},setLanguage:function(c,e){w(c,function(){e&&e();x()})},getDirection:function(){var c=
m.split("-",1)[0];return 0<=["ar","he","fa","ps","ur"].indexOf(c)?"rtl":"ltr"},translate:x,getReadyState:function(){return n},ready:function(c){c&&("complete"==n||"interactive"==n?y.setTimeout(function(){c()}):k.addEventListener("localized",function b(){k.removeEventListener("localized",b);c()}))}}}(window,document);if(void 0===window._)var _=document.webL10n.get;