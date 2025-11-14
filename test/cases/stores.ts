import SampleDriver from "../../src/sample.ts";

export default [
  {
    title: 'store / index check',
    test: async function () {
      const driver = new SampleDriver();
      const items = await driver.listItems();
      this.assert(items instanceof Array, 'items is array');
      this.log(items);
    }
  },
  {
    title: 'transaction proxy check',
  }
]