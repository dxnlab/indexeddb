
type TestFunction = ()=>Promise<void>|void
type datasetProvider = ()=>AsyncGenerator<[], void, void> | Promise<Array<[]>> | Array<[]>;

export class AssertFailed extends Error {
  constructor(message?:string) {
    super(message || 'Assertion failed');
    this.name = 'AssertFailed';
  }
}

export class TimeoutFailed extends Error {
  constructor(message?:string) {
    super(message || 'Test timed out');
    this.name = 'TimeoutFailed';
  }
}

export type TestCaseOptions = {
  title?: string,
  desc?: string, 
  setup?: TestFunction,
  teardown?: TestFunction,
  timeout?: number,
  dataset?: datasetProvider
}
const defaultProvider = ()=>[[]];
const wrapAsync = async (fn:TestFunction|null|undefined, thisArg:object, args: [])=>{
  try {
    if(fn!=null) {
      await fn.apply(thisArg, args);
    }
    return Promise.resolve();
  } catch (error) {
    // rethrow except assertions & timeouts
    if(!(error instanceof AssertFailed)
    && !(error instanceof TimeoutFailed)) {
      return Promise.reject(error);
    } else {
      throw error;
    }
  }
}

export enum TestStatus {
  READY = 'ready',
  WAITING = 'waiting',
  RUNNING = 'running',
  SUCCESS = 'success',
  ERROR = 'error'
}

export class TestSemaphore {
  constructor(private maxCount:number) {}

  private queue:number[] = [];

  public get counting():number { return this.queue.length; }
  public get capacity():number { return this.maxCount - this.queue.length; }

  private get uniqueTicket():number {
    let ticket = Date.now() + Math.random();
    while(this.queue.includes(ticket)) {
      ticket = Date.now() + Math.random();
    }
    return ticket;
  }

  private async acquire(ticket:number): Promise<void> {
    while(this.queue.length >= this.maxCount) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    this.queue.push(ticket);
  }

  private release(ticket:number): void {
    this.queue.splice(this.queue.indexOf(ticket), 1);
  }

  public async ready(): Promise<void> {
    while(this.queue.length > 0) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    return Promise.resolve();
  }

  public within(fn:()=>Promise<void>, self:TestCase, args: []):Promise<void> {
    const ticket = this.uniqueTicket;
    return this.acquire(ticket)
      .then(()=>{
        return wrapAsync(fn, self, args);
      })
      .finally(()=>{
        this.release(ticket);
      });
  }
}

export class TestCase extends EventTarget {
  static builtInSemaphore = new TestSemaphore(2);
  static createWorkers(count:number) : TestSemaphore {
    return new TestSemaphore(count);
  }

  static get Workers() {
    return TestCase.builtInSemaphore;
  }

  static setDefaultWorkers(workers:TestSemaphore) {
    TestCase.builtInSemaphore = workers;
  }

  static updateStatusEvent = 'updatestatus';
  static timedoutEvent = 'timeout';

  private proc:Promise<void>|null = null;
  public logs:string[] = [];
  public elapsed:number = 0;
  public error:Error|null = null;
  public passed:number = 0;
  private _status:TestStatus = TestStatus.READY;
  
  constructor(
    protected evaluate: TestFunction,
    protected options: TestCaseOptions = {},
    private semaphore:TestSemaphore = TestCase.builtInSemaphore,
  ) {
    super();
  }

  get status():string { return this._status; }

  get dataset(): AsyncGenerator<[], void, void> {
    const provider = this.options?.dataset || defaultProvider;
    return provider() as AsyncGenerator<[], void, void>;
  }

  get timeout(): () => Promise<void> {
    const limits = this.options.timeout || 5000;
    return ()=>new Promise<void>((_,reject)=>{
      setTimeout(()=>{
        this.error= new TimeoutFailed(`timeout: ${limits} ms`);
        reject(this.error);
      }, limits);
    });
  }

  get isBusy(): boolean {
    return [
      TestStatus.WAITING,
      TestStatus.RUNNING
    ].includes(this._status);
  }

  get runner(): () => Promise<void> {
    return async ()=>{
      let started = null;
      try {
        // running
        this.setStatus(TestStatus.RUNNING);
        started = Date.now();
        // setup
        await wrapAsync(this.options.setup, this, []);
        // test execution
        for await(const data of this.dataset) {
          await wrapAsync(this.evaluate, this, data);
        }
        // teardown
        await wrapAsync(this.options.teardown, this, []);
        this.error = null;
        Promise.resolve();
      } catch (error) {
        this.error = error as Error;
        if(this.error instanceof AssertFailed
        || this.error instanceof TimeoutFailed) {
          return Promise.reject(this.error);
        } else {
          throw this.error;
        }
      } finally {
        this.elapsed = started != null ? Date.now() - started : 0;
      }
    }
  }

  get results(): object {
    return {
      status: this.status,
      error: this.error,
      passed: this.passed,
      logs: this.logs,
      elapsed: this.elapsed,
    }
  }

  protected emit(eventName:string, options:object={})  {
    const event = Object.defineProperties(new CustomEvent(eventName, options), {
      target: { get() { return this; } },
      ...Object.fromEntries(
        Object.entries(options)
        .map(([k, v])=>[k, { get() { return v; } }])),
    });
    return super.dispatchEvent(event);
  }

  protected setStatus(status:TestStatus, options:object={}) {
    console.log(`status: ${status}`, options);
    this._status = status;
    this.emit(TestCase.updateStatusEvent, {
      status,
      ...options,
    });
  }

  public log(...args:[]) {
    console.log(...args);
    this.logs.push(...args.map(String));
  }

  public getLogs():string[] { 
    return this.logs; 
  }


  public assert(condition:boolean | Promise<boolean>, message?:string) {
    const checkRaise = (rs:boolean)=>{
      if(!rs) {
        throw new AssertFailed(message || 'Assertion failed');
      } else {
        this.passed += 1;
        this.emit('pass', {message});
      }
    };
    if(condition instanceof Promise) {
      condition.then(checkRaise).catch(()=>checkRaise(false));
    } else {
      checkRaise(condition);
    }
  }

  run(managed:TestSemaphore=this.semaphore): Promise<void> {
    // initialization
    this.setStatus(TestStatus.WAITING);
    this.error = null;
    this.logs = [];
    // execution
    this.proc = managed.within(()=>Promise.race([
      this.timeout(),
      this.runner(),
    ]), this, []);
    return this.proc
      .finally(()=>{
        this.setStatus(this.error == null ? TestStatus.SUCCESS : TestStatus.ERROR, {
          settled: true,
          elapsed: this.elapsed,
          passed: this.passed,
          logs: this.logs,
          error: this.error,
        });
      });
  }
}