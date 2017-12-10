import { Meteor } from 'meteor/meteor';
const root = this;

export default (base64Instance, base64) => {
  if (!base64Instance._isNode) {
    const _URL = root.window.URL || root.window.webkitURL || root.window.mozURL || root.window.msURL || root.window.oURL || false;
    try {
      if (root.window.Worker && root.window.Blob && _URL) {
        base64Instance._supportWebWorker = true;
        base64Instance._webWorkerUrl = _URL.createObjectURL(new root.window.Blob(['!function(){"use strict";var a=["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9","+","/","="],t={0:52,1:53,2:54,3:55,4:56,5:57,6:58,7:59,8:60,9:61,A:0,B:1,C:2,D:3,E:4,F:5,G:6,H:7,I:8,J:9,K:10,L:11,M:12,N:13,O:14,P:15,Q:16,R:17,S:18,T:19,U:20,V:21,W:22,X:23,Y:24,Z:25,a:26,b:27,c:28,d:29,e:30,f:31,g:32,h:33,i:34,j:35,k:36,l:37,m:38,n:39,o:40,p:41,q:42,r:43,s:44,t:45,u:46,v:47,w:48,x:49,y:50,z:51,"+":62,"/":63,"=":64},e=String.fromCharCode,r=!(!atob||!btoa),d=function(a,d){var n="";if(a)if(d&&r)n=atob(a);else for(var o,i,c,s,f=0;f<a.length;)o=t[a.charAt(f++)],i=t[a.charAt(f++)],c=t[a.charAt(f++)],s=t[a.charAt(f++)],n+=e(o<<2|i>>4),64!==c&&(n+=e((15&i)<<4|c>>2)),64!==s&&(n+=e((3&c)<<6|s));return n};addEventListener("message",function(t){"encode"===t.data.type?postMessage({id:t.data.id,res:function(t,e){var d="";if(t)if(e&&r)d=btoa(t);else for(var n,o,i,c,s,f=0;f<t.length;)n=t.charCodeAt(f++),c=(15&(o=t.charCodeAt(f++)))<<2|(i=t.charCodeAt(f++))>>6,s=63&i,isNaN(o)?c=s=64:isNaN(i)&&(s=64),d+=a[n>>2]+a[(3&n)<<4|o>>4]+a[c]+a[s];return d}(t.data.ascii?function(a){var t="";if(a){var r,d,n=a.replace(/\\r\\n/g,"\\n");for(r=0;r<n.length;r++)(d=n.charCodeAt(r))<128?t+=e(d):d>127&&d<2048?(t+=e(d>>6|192),t+=e(63&d|128)):(t+=e(d>>12|224),t+=e(d>>6&63|128),t+=e(63&d|128))}return t}(t.data.e):t.data.e,t.data.n)}):postMessage({id:t.data.id,type:"decode",res:t.data.ascii?function(a){var t="";if(a)for(var r=0,d=0;r<a.length;)(d=a.charCodeAt(r))<128?(t+=e(d),r++):d>191&&d<224?(t+=e((31&d)<<6|63&a.charCodeAt(r+1)),r+=2):(t+=e((15&d)<<12|(63&a.charCodeAt(r+1))<<6|63&a.charCodeAt(r+2)),r+=3);return t}(d(t.data.e,t.data.n)):d(t.data.e,t.data.n)})})}();'], {
          type: 'application/javascript'
        }));
      } else if (root.window.Worker) {
        base64Instance._supportWebWorker = true;
        base64Instance._webWorkerUrl = Meteor.absoluteUrl('packages/ostrio_base64/worker.js');
      } else {
        base64Instance._supportWebWorker = false;
      }

      if (base64Instance._supportWebWorker) {
        base64Instance._worker   = new root.window.Worker(base64Instance._webWorkerUrl);
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