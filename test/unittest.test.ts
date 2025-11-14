import { describe, it, assert } from 'vitest';
import { TestCase, TimeoutFailed } from "./unittest.ts";

describe('test testcase', ()=>{
  it('should pass', async()=>{
    const passTest = new TestCase(async function(){
      assert.instanceOf(this, TestCase);
      this.assert(true, 'should pass');
    });
    assert.equal(passTest.status, 'ready');
    await passTest.run();
    assert.equal(passTest.status, 'success');
    assert.equal(passTest.error, null);
    assert.equal(passTest.passed, 1);
    assert.equal(passTest.getLogs().length, 0);
  });

  it('should fail', async()=>{ 
    const failTest = new TestCase(async function(){
      this.assert(true, 'should pass');
      this.assert(false, 'should fail');
    });
    assert.equal(failTest.status, 'ready');
    await failTest.run()
    .then(()=>{ 
      assert.fail('should not be here'); 
    })
    .catch(()=>{
      assert.equal(failTest.status, 'error');
      assert.equal(failTest.error?.message, 'should fail');
      assert.equal(failTest.passed, 1);
      assert.deepEqual(failTest.getLogs(), []);
    });
  });

  it('with setup/teardown', async()=>{ 
    let setupDone = false;
    const test = new TestCase(async function(){
      await this.assert(setupDone, 'setup was not called');
    }, {
      setup: () => new Promise((rs)=>{
        setTimeout(()=>{
          setupDone = true;
          rs();
        }, 100);
      }),
      teardown: () => new Promise((rs)=>{
        setTimeout(()=>{
          setupDone = false;
          rs();
        }, 100);
      })
    });
    await test.run();
    assert.equal(setupDone, false);
  });

  it('timeout', async()=>{
    const timeoutTest = new TestCase(function(){
      return new Promise((resolve)=>{
        setTimeout(resolve, 1000);
      });
    }, { timeout: 50 });
    try {
      await timeoutTest.run();
    } catch (e) {
      assert(e instanceof TimeoutFailed);
      assert.equal(timeoutTest.status, 'error');
      assert.equal(timeoutTest.error?.message, 'timeout: 50 ms');
    }
  });

  it('datasets', async ()=>{
    const numbers = [[1], [2], [3], [4], [5]];
    const expected = numbers.reduce((t,[v])=>t+v, 0);
    let actual = 0;

    const datasetTest = new TestCase(async function(num:number, sub?:boolean=false){
      await this.assert(0<num, 'parameter on');
      await this.assert(sub === false, 'sub parameter off');
      actual += num;
    }, {
      dataset: async function*() {
        for(const item of numbers) {
          yield item;
        }
      }
    });
    await datasetTest.run();
    assert.equal(actual, expected);
    assert.equal(datasetTest.passed, 2*numbers.length);
  })
});