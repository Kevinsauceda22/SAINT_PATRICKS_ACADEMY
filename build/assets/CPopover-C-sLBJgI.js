import{r as t,_ as J,R as n,a as s,c as K,P as e,E as Q,z as U}from"./index-SVRFFNc9.js";import{u as W,C as X}from"./CConditionalPortal-DwBsYzTA.js";import{u as Y}from"./CDropdownToggle-DlfIUTmX.js";import{g as Z,e as $}from"./getRTLPlacement-CB0NCZ8Z.js";var H=t.forwardRef(function(o,O){var x=o.children,m=o.animation,F=m===void 0?!0:m,M=o.className,q=o.container,L=o.content,v=o.delay,l=v===void 0?0:v,b=o.fallbackPlacements,_=b===void 0?["top","right","bottom","left"]:b,h=o.offset,j=h===void 0?[0,8]:h,g=o.onHide,y=o.onShow,P=o.placement,z=P===void 0?"top":P,A=o.title,k=o.trigger,r=k===void 0?"click":k,d=o.visible,B=J(o,["children","animation","className","container","content","delay","fallbackPlacements","offset","onHide","onShow","placement","title","trigger","visible"]),i=t.useRef(null),a=t.useRef(null),I=W(O,i),w="popover".concat(t.useId()),E=t.useState(!1),f=E[0],R=E[1],T=t.useState(d),c=T[0],N=T[1],C=Y(),V=C.initPopper,D=C.destroyPopper,S=typeof l=="number"?{show:l,hide:l}:l,G={modifiers:[{name:"arrow",options:{element:".popover-arrow"}},{name:"flip",options:{fallbackPlacements:_}},{name:"offset",options:{offset:j}}],placement:Z(z,a.current)};t.useEffect(function(){if(d){u();return}p()},[d]),t.useEffect(function(){if(f&&a.current&&i.current){V(a.current,i.current,G),setTimeout(function(){N(!0)},S.show);return}!f&&a.current&&i.current&&D()},[f]),t.useEffect(function(){!c&&a.current&&i.current&&$(function(){R(!1)},i.current)},[c]);var u=function(){R(!0),y&&y()},p=function(){setTimeout(function(){N(!1),g&&g()},S.hide)};return n.createElement(n.Fragment,null,n.cloneElement(x,s(s(s(s(s({},c&&{"aria-describedby":w}),{ref:a}),(r==="click"||r.includes("click"))&&{onClick:function(){return c?p():u()}}),(r==="focus"||r.includes("focus"))&&{onFocus:function(){return u()},onBlur:function(){return p()}}),(r==="hover"||r.includes("hover"))&&{onMouseEnter:function(){return u()},onMouseLeave:function(){return p()}})),n.createElement(X,{container:q,portal:!0},f&&n.createElement("div",s({className:K("popover","bs-popover-auto",{fade:F,show:c},M),id:w,ref:I,role:"tooltip"},B),n.createElement("div",{className:"popover-arrow"}),n.createElement("div",{className:"popover-header"},A),n.createElement("div",{className:"popover-body"},L))))});H.propTypes={animation:e.bool,children:e.node,className:e.string,container:e.any,content:e.oneOfType([e.string,e.node]),delay:e.oneOfType([e.number,e.shape({show:e.number.isRequired,hide:e.number.isRequired})]),fallbackPlacements:Q,offset:e.any,onHide:e.func,onShow:e.func,placement:e.oneOf(["auto","top","right","bottom","left"]),title:e.oneOfType([e.string,e.node]),trigger:U,visible:e.bool};H.displayName="CPopover";export{H as C};
