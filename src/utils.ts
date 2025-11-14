export function promising(
  builder:Function,
  triggers:{[on:string]:Function|null|undefined}={}, 
  self?:any) {
  return (...args:any[])=>new Promise((ok,err)=>{
    // @ts-ignore: intended call
    const request = builder.apply(self, args);
    Object.entries({
      ...triggers,
      onsuccess: ({target,result})=>ok(result || target.result),
      onerror: ({target,error})=>err(error || target.error),
    })
      .filter(([,listener])=>listener!=null)
      .forEach(([event, listener])=>{
        if(/^on\w+/.test(event)) {
          event = event.toLowerCase();
          request[event] = listener;
        } else {
          request.addEventListener(event, listener);
        }
      });
  });
}