import { Meteor } from 'meteor/meteor';
const _root = this;

export default (base64Instance, base64) => {
  if (!base64Instance._isNode) {
    const _URL = _root.window.URL || _root.window.webkitURL || _root.window.mozURL || _root.window.msURL || _root.window.oURL || false;
    try {
      if (_root.window.Worker && _root.window.Blob && _URL) {
        base64Instance._supportWebWorker = true;
        base64Instance._webWorkerUrl = _URL.createObjectURL(new _root.window.Blob(['!function(a){"use strict";var t=["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9","+","/","="],e={0:52,1:53,2:54,3:55,4:56,5:57,6:58,7:59,8:60,9:61,A:0,B:1,C:2,D:3,E:4,F:5,G:6,H:7,I:8,J:9,K:10,L:11,M:12,N:13,O:14,P:15,Q:16,R:17,S:18,T:19,U:20,V:21,W:22,X:23,Y:24,Z:25,a:26,b:27,c:28,d:29,e:30,f:31,g:32,h:33,i:34,j:35,k:36,l:37,m:38,n:39,o:40,p:41,q:42,r:43,s:44,t:45,u:46,v:47,w:48,x:49,y:50,z:51,"+":62,"/":63,"=":64},r=String.fromCharCode,d=!(!a.atob||!a.btoa),n=function(t,n){var o="";if(t)if(n&&d)o=a.atob(t);else for(var i,c,s,h,f=0;f<t.length;)i=e[t.charAt(f++)],c=e[t.charAt(f++)],s=e[t.charAt(f++)],h=e[t.charAt(f++)],o+=r(i<<2|c>>4),64!==s&&(o+=r((15&c)<<4|s>>2)),64!==h&&(o+=r((3&s)<<6|h));return o};addEventListener("message",function(e){"encode"===e.data.type?postMessage({id:e.data.id,res:function(e,r){var n="";if(e)if(r&&d)n=a.btoa(e);else for(var o,i,c,s,h,f=0;f<e.length;)o=e.charCodeAt(f++),s=(15&(i=e.charCodeAt(f++)))<<2|(c=e.charCodeAt(f++))>>6,h=63&c,isNaN(i)?s=h=64:isNaN(c)&&(h=64),n+=t[o>>2]+t[(3&o)<<4|i>>4]+t[s]+t[h];return n}(e.data.ascii?function(a){var t="";if(a){var e,d,n=a.replace(/\\r\\n/g,"\\n");for(e=0;e<n.length;e++)(d=n.charCodeAt(e))<128?t+=r(d):d>127&&d<2048?(t+=r(d>>6|192),t+=r(63&d|128)):(t+=r(d>>12|224),t+=r(d>>6&63|128),t+=r(63&d|128))}return t}(e.data.e):e.data.e,e.data.n)}):postMessage({id:e.data.id,type:"decode",res:e.data.ascii?function(a){var t="";if(a)for(var e=0,d=0;e<a.length;)(d=a.charCodeAt(e))<128?(t+=r(d),e++):d>191&&d<224?(t+=r((31&d)<<6|63&a.charCodeAt(e+1)),e+=2):(t+=r((15&d)<<12|(63&a.charCodeAt(e+1))<<6|63&a.charCodeAt(e+2)),e+=3);return t}(n(e.data.e,e.data.n)):n(e.data.e,e.data.n)})})}(this);'], {
          type: 'application/javascript'
        }));
      } else if (_root.window.Worker) {
        base64Instance._supportWebWorker = true;
        base64Instance._webWorkerUrl = Meteor.absoluteUrl('packages/ostrio_base64/worker.min.js');
      } else {
        base64Instance._supportWebWorker = false;
      }

      if (base64Instance._supportWebWorker) {
        base64Instance._worker   = new _root.window.Worker(base64Instance._webWorkerUrl);
        base64Instance._handlers = {};
        base64Instance._worker.onmessage = (e) => {
          if (base64Instance._handlers[e.data.id]) {
            base64Instance._handlers[e.data.id](void 0, ((base64Instance._ejsonCompatible && e.data.type === 'decode') ? base64.str2uint8(e.data.res) : e.data.res));
            delete base64Instance._handlers[e.data.id];
          }
        };

        base64Instance._worker.onerror = (e) => {
          console.error('[ostrio:base64] WebWorker Error', e);
          base64Instance._worker.terminate();
          base64Instance._handlers = {};
          base64Instance._supportWebWorker = false;
        };
      }
    } catch (e) {
      base64Instance._supportWebWorker = false;
    }
  }
};
