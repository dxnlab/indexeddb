export function promising(
  builder:Function,
  triggers:{[on:string]:Function|null|undefined}={}, 
  self?:any) {
  return (...args:any[])=>new Promise((ok,err)=>{
    const request = builder.apply(self, args);
    Object.entries({
      ...triggers,
      onsuccess: ({result}: {result:any})=>ok(result),
      onerror: ({error}: {error:any})=>err(error),
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