import{w as S,D as v}from"./index-SVRFFNc9.js";function B(e){var t=typeof e;return e!=null&&(t=="object"||t=="function")}var T=B;const He=S(T);var D=typeof v=="object"&&v&&v.Object===Object&&v,U=D,X=U,H=typeof self=="object"&&self&&self.Object===Object&&self,q=X||H||Function("return this")(),G=q,z=G,J=function(){return z.Date.now()},K=J,Q=/\s/;function V(e){for(var t=e.length;t--&&Q.test(e.charAt(t)););return t}var Y=V,Z=Y,ee=/^\s+/;function te(e){return e&&e.slice(0,Z(e)+1).replace(ee,"")}var re=te,ne=G,ie=ne.Symbol,L=ie,E=L,W=Object.prototype,ae=W.hasOwnProperty,oe=W.toString,m=E?E.toStringTag:void 0;function ce(e){var t=ae.call(e,m),n=e[m];try{e[m]=void 0;var i=!0}catch{}var o=oe.call(e);return i&&(t?e[m]=n:delete e[m]),o}var fe=ce,se=Object.prototype,ue=se.toString;function de(e){return ue.call(e)}var be=de,I=L,le=fe,me=be,ge="[object Null]",ve="[object Undefined]",k=I?I.toStringTag:void 0;function Te(e){return e==null?e===void 0?ve:ge:k&&k in Object(e)?le(e):me(e)}var ye=Te;function je(e){return e!=null&&typeof e=="object"}var $e=je,Oe=ye,Se=$e,pe="[object Symbol]";function he(e){return typeof e=="symbol"||Se(e)&&Oe(e)==pe}var _e=he,xe=re,R=T,Ee=_e,w=NaN,Ie=/^[-+]0x[0-9a-f]+$/i,ke=/^0b[01]+$/i,Re=/^0o[0-7]+$/i,we=parseInt;function Ne(e){if(typeof e=="number")return e;if(Ee(e))return w;if(R(e)){var t=typeof e.valueOf=="function"?e.valueOf():e;e=R(t)?t+"":t}if(typeof e!="string")return e===0?e:+e;e=xe(e);var n=ke.test(e);return n||Re.test(e)?we(e.slice(2),n?2:8):Ie.test(e)?w:+e}var Ge=Ne,Le=T,O=K,N=Ge,We="Expected a function",Ce=Math.max,Fe=Math.min;function Pe(e,t,n){var i,o,u,s,a,f,d=0,p=!1,b=!1,y=!0;if(typeof e!="function")throw new TypeError(We);t=N(t)||0,Le(n)&&(p=!!n.leading,b="maxWait"in n,u=b?Ce(N(n.maxWait)||0,t):u,y="trailing"in n?!!n.trailing:y);function j(r){var c=i,l=o;return i=o=void 0,d=r,s=e.apply(l,c),s}function F(r){return d=r,a=setTimeout(g,t),p?j(r):s}function P(r){var c=r-f,l=r-d,x=t-c;return b?Fe(x,u-l):x}function h(r){var c=r-f,l=r-d;return f===void 0||c>=t||c<0||b&&l>=u}function g(){var r=O();if(h(r))return _(r);a=setTimeout(g,P(r))}function _(r){return a=void 0,y&&i?j(r):(i=o=void 0,s)}function A(){a!==void 0&&clearTimeout(a),d=0,i=f=o=a=void 0}function M(){return a===void 0?s:_(O())}function $(){var r=O(),c=h(r);if(i=arguments,o=this,f=r,c){if(a===void 0)return F(f);if(b)return clearTimeout(a),a=setTimeout(g,t),j(f)}return a===void 0&&(a=setTimeout(g,t)),s}return $.cancel=A,$.flush=M,$}var C=Pe;const qe=S(C);var Ae=C,Me=T,Be="Expected a function";function De(e,t,n){var i=!0,o=!0;if(typeof e!="function")throw new TypeError(Be);return Me(n)&&(i="leading"in n?!!n.leading:i,o="trailing"in n?!!n.trailing:o),Ae(e,t,{leading:i,maxWait:t,trailing:o})}var Ue=De;const ze=S(Ue);export{ye as _,T as a,G as b,L as c,qe as d,$e as e,He as f,U as g,Ge as h,_e as i,ze as t};
