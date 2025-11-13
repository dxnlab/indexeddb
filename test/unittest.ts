
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
const wrapAsync = async (fn:TestFunction, thisArg: any, args: any[])=>{
  try {
    if(fn!=null) {
      await fn.apply(thisArg, args);
    }
    return Promise.resolve();
  } catch (error) {
    // rethrow except assertions & timeouts
    if(!(error instanceof AssertFailed)
    && !(error instanceof TimeoutFailed)) {
      throw error;
    } 
  }
}

export enum TestStatus {
  READY = 'ready',
  RUNNING = 'running',
  SUCCESS = 'success',
  ERROR = 'error'
}

export class TestCase extends EventTarget {

  static updateStatusEvent = 'updatestatus';
  static timedoutEvent = 'timeout';

  private logs:string[] = [];
  private proc:Promise<void>|null = null;
  private settled:boolean = false;
  private elapsed:number = 0;
  public readonly error:Error|null = null;
  public readonly passed:number = 0;

  constructor(
    protected evaluate: TestFunction,
    protected options: TestCaseOptions = {},
  ) {
    super();
  }

  get status():string {
    if(this.proc!=null && !this.settled) {
      return TestStatus.RUNNING;
    }
    else if(this.settled && this.error==null) {
      return TestStatus.SUCCESS;
    }
    else if(this.settled && this.error!=null) {
      return TestStatus.ERROR;
    }
    else {
      return TestStatus.READY;
    }
  }

  get dataset(): AsyncGenerator<[], void, void> {
    const provider = this.options?.dataset || defaultProvider;
    return provider() as AsyncGenerator<[], void, void>;
  }

  get timeout(): () => Promise<void> {
    const limits = this.options.timeout || 5000;
    return () => new Promise((_, reject) => {
      setTimeout(() => {
        this.emit(TestCase.timedoutEvent, { limits });
        reject(new TimeoutFailed(`timeout: ${limits} ms`));
      }, limits);
    });
  }

  get isBusy(): boolean {
    return this.status === TestStatus.RUNNING;
  }

  get runner(): () => Promise<void> {
    return async ()=>{
      try {
        // setup
        await wrapAsync(this.options.setup, this, []);
        // test execution
        for await(const data of this.dataset) {
          await wrapAsync(this.evaluate, this, data);
        }
        // teardown
        await wrapAsync(this.options.teardown, this, []);
        Promise.resolve();
      } catch (error) {
        Promise.reject(error);
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

  public log(...args:any[]) {
    console.log(...args);
    this.logs.push(...args.map(String));
  }

  public getLogs():string[] { 
    return this.logs; 
  }


  public assert(condition:boolean, message?:string) {
    if(!condition) {
      throw new AssertFailed(message || 'Assertion failed');
    } else {
      this.passed += 1;
      this.emit('pass', {message});
    }
  }

  run() {
    // 
    const started = Date.now();
    // initialization
    this.emit(TestCase.updateStatusEvent, {status: TestStatus.RUNNING});
    this.settled = false;
    this.error = null;
    this.logs = [];
    // execution
    this.proc = Promise.race([
      this.timeout(),
      this.runner(),
    ]);
    return this.proc
    .then(() => { 
      this.error = null;
    })
    .catch((error:Error|string) => {
        this.error = error;
    })
    .finally(() => { 
      this.settled = true;
      this.elapsed = Date.now() - started;
      this.emit(TestCase.updateStatusEvent, {
        status: this.status,
        elapsed: this.elapsed,
      }); 
    });
  }
}